import test from 'node:test'
import assert from 'node:assert/strict'
import { handleOrder } from '../lib/order-handler.ts'

const config = { apiKey: 'test-key', domain: 'orders.example.com' }
const baseOrder = {
  requestId: '2e17c16a-c70d-4e2f-99ca-12b9f0d88391',
  paymentMethod: 'Apple Cash',
  creatorCode: '',
  customer: { name: 'Avery Rider', email: 'avery@example.com', address: '1 Broadway', addressLine2: '', city: 'New York', state: 'NY', zip: '10001', phone: '917-555-0100' },
  items: [{ id: 'white-tee', size: 'M', quantity: 2 }],
}

function request(value: unknown) {
  return new Request('https://store.example.com/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://store.example.com' }, body: JSON.stringify(value) })
}

test('calculates the order price on the server, ignoring client price fields', async () => {
  let sent: { subject: string; html: string; idempotencyKey: string } | undefined
  const response = await handleOrder(request({ ...baseOrder, total: 0.01, items: [{ ...baseOrder.items[0], price: 0.01 }] }), config, async (email, options) => {
    sent = { subject: email.subject, html: email.html, idempotencyKey: options.idempotencyKey }
    return { data: { id: 'email_1' }, error: null }
  })
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { id: 'email_1', orderId: 'SC-95A62703D6713314', total: 90, paymentMethod: 'Apple Cash' })
  assert.match(sent!.subject, /\$90\.00/)
  assert.match(sent!.html, /\$80\.00/)
  assert.match(sent!.idempotencyKey, /^order\/[a-f0-9]{64}$/)
})

test('rejects invalid variants and never sends an email', async () => {
  let calls = 0
  const response = await handleOrder(request({ ...baseOrder, items: [{ id: 'white-tee', size: 'XXL', quantity: 1 }] }), config, async () => {
    calls++
    return { data: { id: 'email_1' }, error: null }
  })
  assert.equal(response.status, 400)
  assert.equal(calls, 0)
})

test('requires configured server-side email credentials', async () => {
  const response = await handleOrder(request(baseOrder), { domain: 'orders.example.com' }, async () => ({ data: { id: 'email_1' }, error: null }))
  assert.equal(response.status, 503)
})
