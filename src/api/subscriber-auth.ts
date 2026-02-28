import { Hono } from 'hono'
import { createSession, clearSession, generateToken, generateId } from '../middleware/auth'

type Bindings = { DB: D1Database; AUTH_SECRET?: string; RESEND_API_KEY?: string; RESEARCH_PASSCODE?: string }

export const subscriberAuthApi = new Hono<{ Bindings: Bindings }>()

// ── POST /register — Create trial subscriber + send magic link ──
subscriberAuthApi.post('/register', async (c) => {
  try {
    const { email, name } = await c.req.json<{ email: string; name?: string }>()
    if (!email || !email.includes('@')) {
      return c.json({ error: 'Valid email required' }, 400)
    }

    const db = c.env.DB
    const normalizedEmail = email.toLowerCase().trim()

    // Check if already exists
    const existing = await db.prepare('SELECT id, role FROM subscribers WHERE email = ?')
      .bind(normalizedEmail).first<any>()

    if (existing) {
      // Already registered — send a new magic link instead
      const token = generateToken()
      const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min
      await db.prepare('UPDATE subscribers SET magic_link_token = ?, magic_link_expires = ? WHERE id = ?')
        .bind(token, expires, existing.id).run()

      await sendMagicLinkEmail(c.env.RESEND_API_KEY, normalizedEmail, token)
      return c.json({ success: true, message: 'Magic link sent to your email' })
    }

    // Create new subscriber with 60-day trial
    const id = generateId()
    const token = generateToken()
    const now = new Date()
    const trialEnd = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) // 60 days
    const expires = new Date(now.getTime() + 15 * 60 * 1000).toISOString() // 15 min

    await db.prepare(`
      INSERT INTO subscribers (id, email, display_name, role, plan, magic_link_token, magic_link_expires, trial_start, trial_end)
      VALUES (?, ?, ?, 'trial', 'trial', ?, ?, ?, ?)
    `).bind(id, normalizedEmail, name || null, token, expires, now.toISOString(), trialEnd.toISOString()).run()

    await sendMagicLinkEmail(c.env.RESEND_API_KEY, normalizedEmail, token)
    return c.json({ success: true, message: 'Account created! Check your email for login link.' })
  } catch (e: any) {
    return c.json({ error: 'Registration failed: ' + e.message }, 500)
  }
})

// ── POST /magic-link — Request a login magic link ──
subscriberAuthApi.post('/magic-link', async (c) => {
  try {
    const { email } = await c.req.json<{ email: string }>()
    if (!email) return c.json({ error: 'Email required' }, 400)

    const db = c.env.DB
    const normalizedEmail = email.toLowerCase().trim()
    const user = await db.prepare('SELECT id FROM subscribers WHERE email = ?')
      .bind(normalizedEmail).first<any>()

    if (!user) {
      // Don't reveal whether email exists
      return c.json({ success: true, message: 'If an account exists, a login link has been sent.' })
    }

    const token = generateToken()
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    await db.prepare('UPDATE subscribers SET magic_link_token = ?, magic_link_expires = ? WHERE id = ?')
      .bind(token, expires, user.id).run()

    await sendMagicLinkEmail(c.env.RESEND_API_KEY, normalizedEmail, token)
    return c.json({ success: true, message: 'If an account exists, a login link has been sent.' })
  } catch (e: any) {
    return c.json({ error: 'Failed to send magic link: ' + e.message }, 500)
  }
})

// ── GET /verify/:token — Verify magic link + create session ──
subscriberAuthApi.get('/verify/:token', async (c) => {
  const token = c.req.param('token')
  const db = c.env.DB

  const user = await db.prepare(
    'SELECT id, email, role, magic_link_expires FROM subscribers WHERE magic_link_token = ?'
  ).bind(token).first<any>()

  if (!user) {
    return c.html('<html><body style="background:#0a0f1e;color:#ef4444;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><h2>Invalid or Expired Link</h2><p style="color:#8B95A5">This login link is no longer valid. <a href="/login" style="color:#d4a843">Request a new one</a>.</p></div></body></html>', 400)
  }

  // Check expiration
  if (user.magic_link_expires && new Date(user.magic_link_expires) < new Date()) {
    return c.html('<html><body style="background:#0a0f1e;color:#ef4444;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><h2>Link Expired</h2><p style="color:#8B95A5">This login link has expired. <a href="/login" style="color:#d4a843">Request a new one</a>.</p></div></body></html>', 400)
  }

  // Clear magic link token and update last login
  await db.prepare(
    'UPDATE subscribers SET magic_link_token = NULL, magic_link_expires = NULL, last_login = ? WHERE id = ?'
  ).bind(new Date().toISOString(), user.id).run()

  // Create session
  await createSession(c as any, user.id)

  // Redirect based on role
  if (user.role === 'admin') {
    return c.redirect('/')
  }
  return c.redirect('/feed')
})

// ── POST /logout — Clear session ──
subscriberAuthApi.post('/logout', async (c) => {
  clearSession(c)
  return c.json({ success: true })
})

// ── GET /me — Current user info ──
subscriberAuthApi.get('/me', async (c) => {
  const user = c.get('user') as any
  if (!user) {
    return c.json({ authenticated: false }, 401)
  }
  return c.json({
    authenticated: true,
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    plan: user.plan,
    trialEnd: user.trialEnd,
    trialDaysRemaining: user.trialDaysRemaining,
  })
})

// ── Email sending helper ──
async function sendMagicLinkEmail(apiKey: string | undefined, email: string, token: string): Promise<void> {
  if (!apiKey) {
    // Dev mode — log to console instead of sending email
    console.log(`[DEV] Magic link for ${email}: /api/auth/verify/${token}`)
    return
  }

  const loginUrl = `https://research.ekantikcapital.com/api/auth/verify/${token}`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Ekantik Research <research@ekantikcapital.com>',
      to: [email],
      subject: 'Your Ekantik Research Login Link',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;background:#0a0f1e;color:#f9fafb;padding:40px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="display:inline-block;background:#d4a843;color:#0a0f1e;font-weight:bold;padding:8px 16px;border-radius:8px;font-size:14px;">ECA</div>
          </div>
          <h2 style="text-align:center;color:#d4a843;margin-bottom:8px;">Sign in to Ekantik Research</h2>
          <p style="text-align:center;color:#8B95A5;font-size:14px;margin-bottom:32px;">Click the button below to securely sign in. This link expires in 15 minutes.</p>
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${loginUrl}" style="display:inline-block;background:#d4a843;color:#0a0f1e;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:14px;">Sign In to Research Portal</a>
          </div>
          <p style="text-align:center;color:#6b7280;font-size:12px;">If you didn't request this link, you can safely ignore this email.</p>
        </div>
      `,
    }),
  })
}
