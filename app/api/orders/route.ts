import { Resend } from 'resend'
import { handleOrder } from '@/lib/order-handler'

export async function POST(request: Request) {
  return handleOrder(request, {
    apiKey: process.env.RESEND_API_KEY,
    domain: process.env.RESEND_EMAIL_DOMAIN,
    recipient: process.env.ORDER_NOTIFICATION_EMAIL,
  }, async (email, options) => new Resend(process.env.RESEND_API_KEY).emails.send(email, options))
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
