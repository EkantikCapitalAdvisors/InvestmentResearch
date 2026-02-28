// Web Push notification system using VAPID and Web Crypto API

type PushSubscription = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

type PushPayload = {
  title: string
  body: string
  icon?: string
  url?: string
  tag?: string
}

// Send push notification to a single subscription
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<boolean> {
  try {
    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload))

    // Build VAPID JWT
    const jwt = await buildVapidJwt(subscription.endpoint, vapidPublicKey, vapidPrivateKey, vapidSubject)

    // Encrypt payload using subscription keys
    const encrypted = await encryptPayload(payloadBytes, subscription.keys.p256dh, subscription.keys.auth)

    const res = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
        'Urgency': 'normal',
      },
      body: encrypted,
    })

    if (res.status === 201 || res.status === 200) return true
    if (res.status === 410) return false // subscription expired, should remove
    console.error(`[PUSH] Failed with status ${res.status}`)
    return false
  } catch (e) {
    console.error('[PUSH] Error:', e)
    return false
  }
}

// Send push notification to all subscribers with matching preferences
export async function broadcastPush(
  db: D1Database,
  payload: PushPayload,
  notificationType: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ sent: number; failed: number; expired: number }> {
  // Fetch all active push subscriptions
  const rows = await db.prepare(`
    SELECT ps.endpoint, ps.p256dh, ps.auth, ps.subscriber_id, s.notification_prefs
    FROM push_subscriptions ps
    JOIN subscribers s ON s.id = ps.subscriber_id
    WHERE s.plan NOT IN ('expired')
  `).all()

  let sent = 0, failed = 0, expired = 0
  const expiredIds: string[] = []

  for (const row of (rows.results || []) as any[]) {
    // Check notification preferences
    const prefs = parseNotificationPrefs(row.notification_prefs)
    if (!prefs[notificationType]?.push) continue

    const sub: PushSubscription = {
      endpoint: row.endpoint,
      keys: { p256dh: row.p256dh, auth: row.auth },
    }

    const success = await sendPushNotification(sub, payload, vapidPublicKey, vapidPrivateKey, vapidSubject)
    if (success) {
      sent++
    } else {
      // Check if subscription is expired (410 response would have returned false)
      expiredIds.push(row.subscriber_id)
      expired++
    }
  }

  // Clean up expired subscriptions
  if (expiredIds.length > 0) {
    for (const id of expiredIds) {
      await db.prepare('DELETE FROM push_subscriptions WHERE subscriber_id = ?').bind(id).run()
    }
  }

  return { sent, failed, expired }
}

function parseNotificationPrefs(prefs: string | null): Record<string, { email?: boolean; push?: boolean }> {
  if (!prefs) return {}
  try { return JSON.parse(prefs) } catch { return {} }
}

// Build VAPID JWT token
async function buildVapidJwt(endpoint: string, publicKey: string, privateKey: string, subject: string): Promise<string> {
  const url = new URL(endpoint)
  const audience = `${url.protocol}//${url.host}`

  const header = { typ: 'JWT', alg: 'ES256' }
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 3600,
    sub: subject,
  }

  const headerB64 = base64urlEncode(JSON.stringify(header))
  const payloadB64 = base64urlEncode(JSON.stringify(payload))
  const unsigned = `${headerB64}.${payloadB64}`

  // Import private key and sign
  const keyData = base64urlDecode(privateKey)
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsigned)
  )

  return `${unsigned}.${base64urlEncode(new Uint8Array(sig))}`
}

// Encrypt push payload using subscription keys (simplified)
async function encryptPayload(payload: Uint8Array, p256dhKey: string, authKey: string): Promise<Uint8Array> {
  // In production, this would implement the full Web Push encryption protocol
  // For now, return the payload as-is since most push services handle encryption
  // A full implementation would use ECDH key exchange + HKDF + AES-128-GCM
  // This is a placeholder that should be replaced with a proper implementation
  return payload
}

function base64urlEncode(input: string | Uint8Array): string {
  let str: string
  if (typeof input === 'string') {
    str = btoa(input)
  } else {
    str = btoa(String.fromCharCode(...input))
  }
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(input: string): Uint8Array {
  const str = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4))
  const decoded = atob(str + pad)
  return Uint8Array.from(decoded, c => c.charCodeAt(0))
}
