import { Hono } from 'hono'

type Bindings = { DB: D1Database; AUTH_SECRET?: string }

export const adminSubscribersApi = new Hono<{ Bindings: Bindings }>()

// GET /api/admin/subscribers — list subscribers with filters
adminSubscribersApi.get('/', async (c) => {
  const db = c.env.DB
  const role = c.req.query('role')
  const plan = c.req.query('plan')
  const search = c.req.query('search')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = (page - 1) * limit

  let where = '1=1'
  const params: any[] = []

  if (role) {
    where += ' AND role = ?'
    params.push(role)
  }
  if (plan) {
    where += ' AND plan = ?'
    params.push(plan)
  }
  if (search) {
    where += ' AND (email LIKE ? OR display_name LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  const countResult = await db.prepare(`SELECT COUNT(*) as total FROM subscribers WHERE ${where}`).bind(...params).first<{ total: number }>()
  const total = countResult?.total || 0

  const rows = await db.prepare(
    `SELECT id, email, display_name, role, plan, trial_start, trial_end, stripe_customer_id, stripe_status, last_login, created_at
     FROM subscribers WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all()

  // Stats
  const stats = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN plan = 'trial' THEN 1 ELSE 0 END) as trial_count,
      SUM(CASE WHEN plan IN ('active_monthly', 'active_annual') THEN 1 ELSE 0 END) as active_count,
      SUM(CASE WHEN plan = 'expired' THEN 1 ELSE 0 END) as expired_count,
      SUM(CASE WHEN plan = 'past_due' THEN 1 ELSE 0 END) as past_due_count,
      SUM(CASE WHEN plan = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
    FROM subscribers
  `).first()

  return c.json({
    subscribers: rows.results || [],
    total,
    page,
    limit,
    stats: stats || {},
  })
})

// GET /api/admin/subscribers/:id — single subscriber detail
adminSubscribersApi.get('/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  const sub = await db.prepare('SELECT * FROM subscribers WHERE id = ?').bind(id).first()
  if (!sub) return c.json({ error: 'Subscriber not found' }, 404)
  return c.json({ subscriber: sub })
})

// PUT /api/admin/subscribers/:id — update subscriber role/plan
adminSubscribersApi.put('/:id', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  const body = await c.req.json<{ role?: string; plan?: string; display_name?: string }>()

  const sub = await db.prepare('SELECT id FROM subscribers WHERE id = ?').bind(id).first()
  if (!sub) return c.json({ error: 'Subscriber not found' }, 404)

  const updates: string[] = []
  const params: any[] = []

  if (body.role) {
    updates.push('role = ?')
    params.push(body.role)
  }
  if (body.plan) {
    updates.push('plan = ?')
    params.push(body.plan)
  }
  if (body.display_name !== undefined) {
    updates.push('display_name = ?')
    params.push(body.display_name)
  }

  if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400)

  updates.push('updated_at = datetime(\'now\')')
  await db.prepare(`UPDATE subscribers SET ${updates.join(', ')} WHERE id = ?`).bind(...params, id).run()

  return c.json({ success: true })
})

// POST /api/admin/subscribers/:id/extend-trial — extend trial by N days
adminSubscribersApi.post('/:id/extend-trial', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB
  const { days } = await c.req.json<{ days: number }>()

  if (!days || days < 1 || days > 365) {
    return c.json({ error: 'Days must be between 1 and 365' }, 400)
  }

  const sub = await db.prepare('SELECT id, trial_end, plan FROM subscribers WHERE id = ?').bind(id).first<any>()
  if (!sub) return c.json({ error: 'Subscriber not found' }, 404)

  // Extend from current trial_end or from now if expired
  const baseDate = sub.trial_end && new Date(sub.trial_end) > new Date() ? sub.trial_end : new Date().toISOString()
  const newEnd = new Date(new Date(baseDate).getTime() + days * 86400000).toISOString()

  await db.prepare(
    `UPDATE subscribers SET trial_end = ?, plan = 'trial', role = 'trial', updated_at = datetime('now') WHERE id = ?`
  ).bind(newEnd, id).run()

  return c.json({ success: true, new_trial_end: newEnd })
})

// POST /api/admin/subscribers/:id/deactivate — set to expired
adminSubscribersApi.post('/:id/deactivate', async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB

  await db.prepare(
    `UPDATE subscribers SET plan = 'expired', role = 'expired', updated_at = datetime('now') WHERE id = ?`
  ).bind(id).run()

  return c.json({ success: true })
})
