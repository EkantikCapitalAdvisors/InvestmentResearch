import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_MONTHLY?: string
  STRIPE_PRICE_ANNUAL?: string
}

export const billingApi = new Hono<{ Bindings: Bindings }>()

// Helper: Stripe API call via raw fetch
async function stripeRequest(path: string, method: string, body: Record<string, string> | null, secretKey: string) {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${secretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  const options: RequestInit = { method, headers }
  if (body) {
    options.body = new URLSearchParams(body).toString()
  }
  const res = await fetch(`https://api.stripe.com/v1${path}`, options)
  return res.json() as Promise<any>
}

// POST /api/billing/create-checkout — Create Stripe Checkout session
billingApi.post('/create-checkout', async (c) => {
  const secretKey = c.env.STRIPE_SECRET_KEY
  if (!secretKey) return c.json({ error: 'Stripe not configured' }, 503)

  const user = (c as any).get?.('user')
  if (!user) return c.json({ error: 'Authentication required' }, 401)

  const { price_type } = await c.req.json<{ price_type: 'monthly' | 'annual' }>()
  const priceId = price_type === 'annual' ? c.env.STRIPE_PRICE_ANNUAL : c.env.STRIPE_PRICE_MONTHLY
  if (!priceId) return c.json({ error: `No ${price_type} price configured` }, 503)

  const db = c.env.DB
  const subscriber = await db.prepare('SELECT id, email, stripe_customer_id FROM subscribers WHERE email = ?')
    .bind(user.email).first<any>()

  if (!subscriber) return c.json({ error: 'Subscriber not found' }, 404)

  // Create or reuse Stripe customer
  let customerId = subscriber.stripe_customer_id
  if (!customerId) {
    const customer = await stripeRequest('/customers', 'POST', {
      email: subscriber.email,
      'metadata[subscriber_id]': subscriber.id,
    }, secretKey)
    customerId = customer.id
    await db.prepare('UPDATE subscribers SET stripe_customer_id = ? WHERE id = ?')
      .bind(customerId, subscriber.id).run()
  }

  // Create Checkout session
  const origin = new URL(c.req.url).origin
  const session = await stripeRequest('/checkout/sessions', 'POST', {
    customer: customerId,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    mode: 'subscription',
    success_url: `${origin}/account?checkout=success`,
    cancel_url: `${origin}/account/subscribe?checkout=cancelled`,
    'metadata[subscriber_id]': subscriber.id,
  }, secretKey)

  if (session.error) {
    return c.json({ error: session.error.message || 'Checkout creation failed' }, 400)
  }

  return c.json({ url: session.url })
})

// POST /api/billing/portal — Create Stripe Customer Portal session
billingApi.post('/portal', async (c) => {
  const secretKey = c.env.STRIPE_SECRET_KEY
  if (!secretKey) return c.json({ error: 'Stripe not configured' }, 503)

  const user = (c as any).get?.('user')
  if (!user) return c.json({ error: 'Authentication required' }, 401)

  const db = c.env.DB
  const subscriber = await db.prepare('SELECT stripe_customer_id FROM subscribers WHERE email = ?')
    .bind(user.email).first<any>()

  if (!subscriber?.stripe_customer_id) {
    return c.json({ error: 'No billing account found' }, 404)
  }

  const origin = new URL(c.req.url).origin
  const session = await stripeRequest('/billing_portal/sessions', 'POST', {
    customer: subscriber.stripe_customer_id,
    return_url: `${origin}/account`,
  }, secretKey)

  return c.json({ url: session.url })
})

// POST /api/billing/webhook — Handle Stripe webhook events
billingApi.post('/webhook', async (c) => {
  const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET
  const secretKey = c.env.STRIPE_SECRET_KEY
  if (!webhookSecret || !secretKey) return c.json({ error: 'Stripe not configured' }, 503)

  const signature = c.req.header('stripe-signature')
  if (!signature) return c.json({ error: 'Missing signature' }, 400)

  const body = await c.req.text()

  // Verify webhook signature
  const verified = await verifyStripeSignature(body, signature, webhookSecret)
  if (!verified) return c.json({ error: 'Invalid signature' }, 400)

  const event = JSON.parse(body)
  const db = c.env.DB

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const subscriberId = session.metadata?.subscriber_id
      if (subscriberId && session.subscription) {
        // Fetch subscription to determine plan
        const sub = await stripeRequest(`/subscriptions/${session.subscription}`, 'GET', null, secretKey)
        const priceId = sub.items?.data?.[0]?.price?.id
        const plan = priceId === c.env.STRIPE_PRICE_ANNUAL ? 'active_annual' : 'active_monthly'

        await db.prepare(
          `UPDATE subscribers SET
            stripe_subscription_id = ?, stripe_status = 'active', plan = ?, role = 'subscriber',
            updated_at = datetime('now')
           WHERE id = ?`
        ).bind(session.subscription, plan, subscriberId).run()
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const customerId = subscription.customer
      const status = subscription.status

      let plan = 'active_monthly'
      const priceId = subscription.items?.data?.[0]?.price?.id
      if (priceId === c.env.STRIPE_PRICE_ANNUAL) plan = 'active_annual'

      if (status === 'active') {
        await db.prepare(
          `UPDATE subscribers SET stripe_status = 'active', plan = ?, role = 'subscriber', updated_at = datetime('now')
           WHERE stripe_customer_id = ?`
        ).bind(plan, customerId).run()
      } else if (status === 'past_due') {
        await db.prepare(
          `UPDATE subscribers SET stripe_status = 'past_due', plan = 'past_due', updated_at = datetime('now')
           WHERE stripe_customer_id = ?`
        ).bind(customerId).run()
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer
      await db.prepare(
        `UPDATE subscribers SET stripe_status = 'cancelled', plan = 'expired', role = 'expired', updated_at = datetime('now')
         WHERE stripe_customer_id = ?`
      ).bind(customerId).run()
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object
      const customerId = invoice.customer
      await db.prepare(
        `UPDATE subscribers SET stripe_status = 'active', updated_at = datetime('now')
         WHERE stripe_customer_id = ?`
      ).bind(customerId).run()
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const customerId = invoice.customer
      await db.prepare(
        `UPDATE subscribers SET stripe_status = 'past_due', plan = 'past_due', updated_at = datetime('now')
         WHERE stripe_customer_id = ?`
      ).bind(customerId).run()
      break
    }
  }

  return c.json({ received: true })
})

// Verify Stripe webhook signature using Web Crypto API
async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  try {
    const parts = header.split(',')
    let timestamp = ''
    let signature = ''
    for (const part of parts) {
      const [key, value] = part.split('=')
      if (key === 't') timestamp = value
      if (key === 'v1') signature = value
    }
    if (!timestamp || !signature) return false

    // Check timestamp tolerance (5 minutes)
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - parseInt(timestamp)) > 300) return false

    const signedPayload = `${timestamp}.${payload}`
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload))
    const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')

    return computed === signature
  } catch {
    return false
  }
}
