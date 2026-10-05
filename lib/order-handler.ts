import { createHash } from 'node:crypto'
import { OrderValidationError, validateOrder } from './order-validation.ts'

type Email = { from: string; to: string[]; replyTo: string; subject: string; html: string }
type SendEmail = (email: Email, options: { idempotencyKey: string }) => Promise<{ data: { id: string } | null; error: unknown }>
type Config = { apiKey?: string; domain?: string; recipient?: string }
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!)

export async function handleOrder(request: Request, config: Config, send: SendEmail) {
  const reply = (body: object, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return reply({ error: 'Invalid request origin.' }, 403)
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply({ error: 'Expected a JSON order.' }, 415)
  try {
    // Bound bytes while streaming, including when Content-Length is absent or forged.
    const reader = request.body?.getReader()
    if (!reader) return reply({ error: 'Missing order details.' }, 400)
    const chunks: Uint8Array[] = []
    let length = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > 16384) { await reader.cancel(); return reply({ error: 'Order request is too large.' }, 413) }
      chunks.push(value)
    }
    let input: unknown
    try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { return reply({ error: 'Invalid JSON order.' }, 400) }
    const order = validateOrder(input)
    if (!config.apiKey || !config.domain || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(config.domain)) return reply({ error: 'Ordering is temporarily unavailable. Please contact Swervecitybrandd@gmail.com before making a payment.' }, 503)
    // Bind the reference and provider deduplication key to the validated, immutable payload.
    const digest = createHash('sha256').update(JSON.stringify(order)).digest('hex')
    const orderId = `SC-${digest.slice(0, 16).toUpperCase()}`
    const { customer, items, paymentMethod, total, creatorCode, discount } = order
    const address = [customer.address, customer.addressLine2, customer.city, customer.state, customer.zip].filter(Boolean).join(', ')
    const lines = items.map((item) => `${escapeHtml(item.color)} ${escapeHtml(item.name)} — size ${escapeHtml(item.size)} × ${item.quantity} ($${(item.price * item.quantity).toFixed(2)})`).join('<br />')
    const { data, error } = await send({
      from: `Swerve City Orders <orders@${config.domain}>`,
      to: [config.recipient || 'Swervecitybrandd@gmail.com'],
      replyTo: customer.email,
      subject: `Order request ${orderId} — $${total.toFixed(2)} — payment unverified`,
      html: `<h1>Swerve City order request</h1><p><strong>Order:</strong> ${orderId}</p><p><strong>Customer:</strong> ${escapeHtml(customer.name)}<br /><strong>Email:</strong> ${escapeHtml(customer.email)}<br /><strong>Phone:</strong> ${escapeHtml(customer.phone)}<br /><strong>Address:</strong> ${escapeHtml(address)}</p><p><strong>Payment method:</strong> ${escapeHtml(paymentMethod)}<br />${creatorCode ? `<strong>Creator code:</strong> ${escapeHtml(creatorCode)}<br /><strong>Discount:</strong> −$${discount.toFixed(2)}<br />` : ''}<strong>Total including $10 shipping:</strong> $${total.toFixed(2)}</p><p>${lines}</p><p>Payment note: ${orderId}. This request does not verify payment or reserve inventory. Verify both before confirming fulfillment.</p>`,
    }, { idempotencyKey: `order/${digest}` })
    if (error || !data?.id) return reply({ error: 'We could not confirm your order email. Please retry with the same details before paying.' }, 502)
    return reply({ id: data.id, orderId, total, paymentMethod })
  } catch (error) {
    if (error instanceof OrderValidationError) return reply({ error: error.message }, 400)
    return reply({ error: 'Unable to send your order. Please retry with the same details before paying.' }, 502)
  }
}
