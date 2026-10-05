import { products, sizes, shipping, maxQuantity, validCreatorCode } from './catalog.ts'

export class OrderValidationError extends Error {}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new OrderValidationError('Invalid order details.')
  return value as Record<string, unknown>
}
function field(value: unknown, label: string, max: number, optional = false) {
  if (optional && (value === undefined || value === null || value === '')) return ''
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max || /[\u0000-\u001f\u007f]/.test(value)) throw new OrderValidationError(`Please provide a valid ${label}.`)
  return value.trim()
}
export function validateOrder(input: unknown) {
  const body = record(input)
  const requestId = field(body.requestId, 'request ID', 36)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) throw new OrderValidationError('Invalid request ID.')
  const raw = record(body.customer)
  const customer = {
    name: field(raw.name, 'name', 120),
    email: field(raw.email, 'email address', 254),
    address: field(raw.address, 'street address', 200),
    addressLine2: field(raw.addressLine2, 'apartment or unit', 120, true),
    city: field(raw.city, 'city', 100),
    state: field(raw.state, 'state', 100),
    zip: field(raw.zip, 'ZIP code', 10),
    phone: field(raw.phone, 'phone number', 32),
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new OrderValidationError('Please provide a valid email address.')
  if (!/^\d{5}(-\d{4})?$/.test(customer.zip)) throw new OrderValidationError('Please provide a valid ZIP code.')
  if (!/^[+\d ().-]+$/.test(customer.phone) || customer.phone.replace(/\D/g, '').length < 7) throw new OrderValidationError('Please provide a valid phone number.')
  const paymentMethod = field(body.paymentMethod, 'payment method', 20)
  if (!['Apple Cash', 'Zelle'].includes(paymentMethod)) throw new OrderValidationError('Invalid payment method.')
  const creatorCode = field(body.creatorCode, 'creator code', 50, true)
  if (creatorCode && !validCreatorCode(creatorCode)) throw new OrderValidationError('Creator code not recognized.')
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > products.length * sizes.length) throw new OrderValidationError('Your cart is empty or invalid.')
  const seen = new Set<string>()
  const items = body.items.map((value) => {
    const item = record(value)
    const product = products.find((product) => product.id === item.id)
    if (!product || typeof item.size !== 'string' || !sizes.includes(item.size)) throw new OrderValidationError('Invalid product or size.')
    if (typeof item.quantity !== 'number' || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > maxQuantity) throw new OrderValidationError(`Quantity must be between 1 and ${maxQuantity}.`)
    const key = `${product.id}/${item.size}`
    if (seen.has(key)) throw new OrderValidationError('Duplicate product variant.')
    seen.add(key)
    return { id: product.id, name: product.name, color: product.color, price: product.price, size: item.size, quantity: item.quantity }
  })
  const subtotalCents = items.reduce((sum, item) => sum + item.price * 100 * item.quantity, 0)
  const discountCents = creatorCode ? Math.round(subtotalCents * 0.1) : 0
  return { requestId, customer, paymentMethod, creatorCode, items, subtotal: subtotalCents / 100, discount: discountCents / 100, total: (subtotalCents - discountCents + shipping * 100) / 100 }
}
