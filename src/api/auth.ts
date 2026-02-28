import { Hono } from 'hono'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string; SLACK_BOT_TOKEN?: string; SLACK_SIGNING_SECRET?: string; RESEARCH_PASSCODE?: string }

const authApi = new Hono<{ Bindings: Bindings }>()

// ============================================================
// PASSCODE MIDDLEWARE — Protects AI/research routes from unauthorized use
// Requires X-Research-Passcode header matching the RESEARCH_PASSCODE env secret.
// If RESEARCH_PASSCODE is not set, all requests are allowed (dev mode).
// ============================================================
const requirePasscode = async (c: any, next: any) => {
  const secret = c.env.RESEARCH_PASSCODE
  // If no passcode configured, allow all (dev mode)
  if (!secret) return next()

  const provided = c.req.header('X-Research-Passcode') || ''
  if (!provided) {
    return c.json({ error: 'Research passcode required', code: 'PASSCODE_REQUIRED' }, 401)
  }
  if (provided !== secret) {
    return c.json({ error: 'Invalid passcode', code: 'PASSCODE_INVALID' }, 403)
  }
  return next()
}

// Verify passcode endpoint (frontend calls this to check before storing)
authApi.post('/verify-passcode', async (c) => {
  const secret = c.env.RESEARCH_PASSCODE
  if (!secret) return c.json({ valid: true, message: 'No passcode required (dev mode)' })

  const { passcode } = await c.req.json()
  if (!passcode) return c.json({ valid: false, message: 'Passcode is required' }, 400)
  if (passcode !== secret) return c.json({ valid: false, message: 'Invalid passcode' }, 403)
  return c.json({ valid: true })
})

// Check if passcode is required (frontend calls this on page load)
authApi.get('/passcode-required', async (c) => {
  const secret = c.env.RESEARCH_PASSCODE
  return c.json({ required: !!secret })
})

export { authApi, requirePasscode }
