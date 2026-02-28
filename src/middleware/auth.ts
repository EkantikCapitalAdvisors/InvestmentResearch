import type { Context, Next } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

type Bindings = { DB: D1Database; AUTH_SECRET?: string; RESEARCH_PASSCODE?: string }

export interface AuthUser {
  id: string
  email: string
  displayName: string | null
  role: 'admin' | 'subscriber' | 'trial' | 'expired'
  plan: string
  trialEnd: string | null
  trialDaysRemaining: number | null
}

// ── Session token helpers ──────────────────────────────────

async function signToken(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
  return `${btoa(payload)}.${sigB64}`
}

async function verifyToken(token: string, secret: string): Promise<string | null> {
  try {
    const [payloadB64, sigB64] = token.split('.')
    if (!payloadB64 || !sigB64) return null
    const payload = atob(payloadB64)
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    )
    const sigBytes = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payload))
    return valid ? payload : null
  } catch {
    return null
  }
}

// ── Cookie session management ──────────────────────────────

export async function createSession(c: Context<{ Bindings: Bindings }>, subscriberId: string): Promise<void> {
  const secret = c.env.AUTH_SECRET || 'dev-secret-change-me'
  const token = await signToken(JSON.stringify({ sub: subscriberId, iat: Date.now() }), secret)
  setCookie(c, 'ekantik_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export function clearSession(c: Context): void {
  deleteCookie(c, 'ekantik_session', { path: '/' })
}

async function getSessionUser(c: Context<{ Bindings: Bindings }>): Promise<AuthUser | null> {
  const token = getCookie(c, 'ekantik_session')
  if (!token) return null

  const secret = c.env.AUTH_SECRET || 'dev-secret-change-me'
  const payload = await verifyToken(token, secret)
  if (!payload) return null

  try {
    const { sub } = JSON.parse(payload)
    const db = c.env.DB
    const row = await db.prepare(
      'SELECT id, email, display_name, role, plan, trial_end FROM subscribers WHERE id = ?'
    ).bind(sub).first<any>()
    if (!row) return null

    let trialDaysRemaining: number | null = null
    if (row.trial_end) {
      const diff = new Date(row.trial_end).getTime() - Date.now()
      trialDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      role: row.role,
      plan: row.plan || 'trial',
      trialEnd: row.trial_end,
      trialDaysRemaining,
    }
  } catch {
    return null
  }
}

// ── Middleware functions ────────────────────────────────────

/**
 * Attaches user to context if session cookie is present.
 * Does not block unauthenticated requests.
 */
export async function optionalAuth(c: Context<{ Bindings: Bindings }>, next: Next): Promise<void | Response> {
  const user = await getSessionUser(c)
  c.set('user', user)
  return next()
}

/**
 * Requires admin role OR valid passcode header (backward compat).
 */
export async function requireAdmin(c: Context<{ Bindings: Bindings }>, next: Next): Promise<void | Response> {
  // Check session first
  const user = await getSessionUser(c)
  if (user && user.role === 'admin') {
    c.set('user', user)
    return next()
  }

  // Fall back to passcode check (backward compatibility)
  const passcode = c.env.RESEARCH_PASSCODE
  if (passcode) {
    const provided = c.req.header('X-Research-Passcode') || ''
    if (provided === passcode) {
      c.set('user', null)
      return next()
    }
  } else {
    // No passcode configured = dev mode, allow all
    c.set('user', null)
    return next()
  }

  return c.json({ error: 'Admin access required' }, 403)
}

/**
 * Requires authenticated user with active subscription or trial.
 * Admin users always pass.
 */
export async function requireSubscriber(c: Context<{ Bindings: Bindings }>, next: Next): Promise<void | Response> {
  const user = await getSessionUser(c)
  if (!user) {
    return c.redirect('/login')
  }

  // Admin always has access
  if (user.role === 'admin') {
    c.set('user', user)
    return next()
  }

  // Check trial expiration
  if (user.role === 'trial' && user.trialDaysRemaining !== null && user.trialDaysRemaining <= 0) {
    // Update role to expired
    await c.env.DB.prepare('UPDATE subscribers SET role = ?, plan = ? WHERE id = ?')
      .bind('expired', 'expired', user.id).run()
    user.role = 'expired'
    user.plan = 'expired'
  }

  // Check subscription states that allow access
  const activePlans = ['trial', 'active_monthly', 'active_annual', 'past_due', 'cancelled']
  if (activePlans.includes(user.plan)) {
    c.set('user', user)
    return next()
  }

  // Expired — set context but allow (pages will show locked view)
  c.set('user', user)
  return next()
}

/**
 * Check if the current request is from an admin (session or passcode).
 * Returns true/false without blocking.
 */
export async function isAdmin(c: Context<{ Bindings: Bindings }>): Promise<boolean> {
  const user = await getSessionUser(c)
  if (user && user.role === 'admin') return true

  const passcode = c.env.RESEARCH_PASSCODE
  if (!passcode) return true // dev mode
  const provided = c.req.header('X-Research-Passcode') || ''
  return provided === passcode
}

// Generate a random magic link token
export function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

// Generate a UUID v4
export function generateId(): string {
  return crypto.randomUUID()
}
