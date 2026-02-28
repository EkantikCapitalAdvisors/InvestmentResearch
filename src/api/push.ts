import { Hono } from 'hono'
import { generateId } from '../middleware/auth'

type Bindings = { DB: D1Database }

export const pushApi = new Hono<{ Bindings: Bindings }>()

// POST /api/push/subscribe — Save push subscription
pushApi.post('/subscribe', async (c) => {
  const user = (c as any).get?.('user')
  if (!user) return c.json({ error: 'Authentication required' }, 401)

  const { endpoint, keys } = await c.req.json<{
    endpoint: string
    keys: { p256dh: string; auth: string }
  }>()

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return c.json({ error: 'Invalid subscription data' }, 400)
  }

  const db = c.env.DB
  const sub = await db.prepare('SELECT id FROM subscribers WHERE email = ?').bind(user.email).first<any>()
  if (!sub) return c.json({ error: 'Subscriber not found' }, 404)

  // Upsert: delete existing for this endpoint, insert new
  await db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(endpoint).run()
  await db.prepare(
    'INSERT INTO push_subscriptions (id, subscriber_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?, ?)'
  ).bind(generateId(), sub.id, endpoint, keys.p256dh, keys.auth).run()

  return c.json({ success: true })
})

// POST /api/push/unsubscribe — Remove push subscription
pushApi.post('/unsubscribe', async (c) => {
  const user = (c as any).get?.('user')
  if (!user) return c.json({ error: 'Authentication required' }, 401)

  const { endpoint } = await c.req.json<{ endpoint: string }>()
  if (!endpoint) return c.json({ error: 'Endpoint required' }, 400)

  const db = c.env.DB
  await db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(endpoint).run()

  return c.json({ success: true })
})
