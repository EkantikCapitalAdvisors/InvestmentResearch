// Email notification system using Resend API

type EmailOptions = {
  to: string
  subject: string
  html: string
}

async function sendEmail(options: EmailOptions, apiKey: string): Promise<boolean> {
  if (!apiKey) {
    console.log(`[EMAIL DEV] To: ${options.to} | Subject: ${options.subject}`)
    console.log(`[EMAIL DEV] Body preview: ${options.html.substring(0, 200)}...`)
    return true
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ekantik Research <intelligence@ekantikcapital.com>',
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    })
    const data = await res.json() as any
    if (data.error) {
      console.error('[EMAIL ERROR]', data.error)
      return false
    }
    return true
  } catch (e) {
    console.error('[EMAIL ERROR]', e)
    return false
  }
}

// Shared email wrapper with ekantik branding
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0f1e;font-family:'Inter',system-ui,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;background:#d4a843;border-radius:12px;padding:12px 16px;">
      <span style="color:#0a0f1e;font-weight:bold;font-size:16px;letter-spacing:1px;">ECA</span>
    </div>
    <div style="margin-top:8px;color:#d4a843;font-size:14px;font-weight:600;letter-spacing:1px;">Ekantik Research</div>
  </div>
  <div style="background:#111827;border:1px solid #1f2937;border-radius:16px;padding:32px;">
    ${content}
  </div>
  <div style="text-align:center;margin-top:24px;color:#6b7280;font-size:11px;line-height:1.6;">
    <p>Ekantik Capital Advisors LLC</p>
    <p>All content is for educational and informational purposes only.<br>Nothing herein constitutes investment advice.</p>
  </div>
</div>
</body>
</html>`
}

// ── Email templates ──────────────────────────────────────

export async function sendMagicLink(email: string, token: string, baseUrl: string, apiKey: string): Promise<boolean> {
  const link = `${baseUrl}/api/auth/verify/${token}`
  return sendEmail({
    to: email,
    subject: 'Sign in to Ekantik Intelligence',
    html: emailWrapper(`
      <h2 style="color:#ffffff;margin:0 0 16px;font-size:20px;">Sign In to Your Account</h2>
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Click the button below to securely sign in to your Ekantik Intelligence Portal.
        This link expires in 15 minutes.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${link}" style="display:inline-block;background:#d4a843;color:#0a0f1e;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">
          Sign In Now
        </a>
      </div>
      <p style="color:#6b7280;font-size:12px;margin:16px 0 0;">
        If you didn't request this, you can safely ignore this email.
      </p>
    `),
  }, apiKey)
}

export async function sendWelcome(email: string, name: string, apiKey: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Welcome to Ekantik Intelligence — Your 60-Day Trial Begins',
    html: emailWrapper(`
      <h2 style="color:#ffffff;margin:0 0 16px;font-size:20px;">Welcome${name ? `, ${name}` : ''}!</h2>
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Your 60-day free trial is now active. You have full access to institutional-grade
        intelligence powered by 12 proprietary frameworks.
      </p>
      <div style="background:#0a0f1e;border-radius:12px;padding:20px;margin:16px 0;">
        <h3 style="color:#d4a843;font-size:13px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">What You Get</h3>
        <ul style="color:#9ca3af;font-size:13px;line-height:2;margin:0;padding:0 0 0 20px;">
          <li>Daily Intelligence Feed with impact scoring</li>
          <li>Active Watchlist with catalyst tracking</li>
          <li>Multibagger research reports</li>
          <li>AOMG Trend Radar analysis</li>
          <li>Market commentary & risk assessments</li>
          <li>Magnificent 7 scorecards</li>
          <li>Avoid List — broken business model alerts</li>
        </ul>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://research.ekantikcapital.com/feed" style="display:inline-block;background:#d4a843;color:#0a0f1e;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">
          Open Intelligence Feed
        </a>
      </div>
    `),
  }, apiKey)
}

export async function sendDailyDigest(email: string, entries: Array<{ title: string; category: string; impact_score: string; summary: string; slug: string }>, apiKey: string): Promise<boolean> {
  const entriesHtml = entries.map(e => {
    const impactColor = e.impact_score === 'HIGH' ? '#ef4444' : e.impact_score === 'MEDIUM' ? '#f59e0b' : '#6b7280'
    return `
      <div style="border-bottom:1px solid #1f2937;padding:16px 0;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="display:inline-block;background:${impactColor}22;color:${impactColor};padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;">${e.impact_score}</span>
          <span style="color:#6b7280;font-size:11px;text-transform:uppercase;">${e.category.replace(/_/g, ' ')}</span>
        </div>
        <a href="https://research.ekantikcapital.com/feed#${e.slug}" style="color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">${e.title}</a>
        <p style="color:#9ca3af;font-size:13px;line-height:1.5;margin:6px 0 0;">${e.summary || ''}</p>
      </div>`
  }).join('')

  return sendEmail({
    to: email,
    subject: `Ekantik Intelligence — ${entries.length} New Entries Today`,
    html: emailWrapper(`
      <h2 style="color:#ffffff;margin:0 0 8px;font-size:20px;">Daily Intelligence Digest</h2>
      <p style="color:#9ca3af;font-size:13px;margin:0 0 20px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      ${entriesHtml}
      <div style="text-align:center;margin:24px 0;">
        <a href="https://research.ekantikcapital.com/feed" style="display:inline-block;background:#d4a843;color:#0a0f1e;padding:12px 28px;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;">
          View All Intelligence
        </a>
      </div>
    `),
  }, apiKey)
}

export async function sendValueOpportunityAlert(email: string, entry: { title: string; ticker_symbols: string; impact_score: string; summary: string; slug: string }, apiKey: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `HIGH IMPACT: ${entry.title}`,
    html: emailWrapper(`
      <div style="background:#ef444422;border:1px solid #ef444444;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
        <span style="color:#ef4444;font-weight:700;font-size:12px;">HIGH IMPACT ALERT</span>
      </div>
      <h2 style="color:#ffffff;margin:0 0 8px;font-size:20px;">${entry.title}</h2>
      <div style="margin-bottom:16px;">
        <span style="display:inline-block;background:#d4a84322;color:#d4a843;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;">${entry.ticker_symbols}</span>
      </div>
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px;">${entry.summary}</p>
      <div style="text-align:center;">
        <a href="https://research.ekantikcapital.com/feed#${entry.slug}" style="display:inline-block;background:#d4a843;color:#0a0f1e;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">
          Read Full Analysis
        </a>
      </div>
    `),
  }, apiKey)
}

export async function sendWeeklyRoundup(email: string, stats: { total: number; highImpact: number; newWatchlist: number; topTickers: string[] }, entries: Array<{ title: string; category: string; impact_score: string }>, apiKey: string): Promise<boolean> {
  const topEntries = entries.slice(0, 5).map(e => {
    const impactColor = e.impact_score === 'HIGH' ? '#ef4444' : e.impact_score === 'MEDIUM' ? '#f59e0b' : '#6b7280'
    return `<li style="color:#9ca3af;font-size:13px;line-height:2;">
      <span style="color:${impactColor};font-size:10px;">●</span> ${e.title}
    </li>`
  }).join('')

  return sendEmail({
    to: email,
    subject: 'Ekantik Weekly Intelligence Roundup',
    html: emailWrapper(`
      <h2 style="color:#ffffff;margin:0 0 16px;font-size:20px;">Weekly Intelligence Roundup</h2>
      <div style="display:flex;gap:16px;margin-bottom:20px;">
        <div style="flex:1;background:#0a0f1e;border-radius:8px;padding:16px;text-align:center;">
          <div style="color:#d4a843;font-size:24px;font-weight:700;">${stats.total}</div>
          <div style="color:#6b7280;font-size:11px;">Entries Published</div>
        </div>
        <div style="flex:1;background:#0a0f1e;border-radius:8px;padding:16px;text-align:center;">
          <div style="color:#ef4444;font-size:24px;font-weight:700;">${stats.highImpact}</div>
          <div style="color:#6b7280;font-size:11px;">High Impact</div>
        </div>
        <div style="flex:1;background:#0a0f1e;border-radius:8px;padding:16px;text-align:center;">
          <div style="color:#10b981;font-size:24px;font-weight:700;">${stats.newWatchlist}</div>
          <div style="color:#6b7280;font-size:11px;">Watchlist Updates</div>
        </div>
      </div>
      <h3 style="color:#d4a843;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin:20px 0 8px;">Top Intelligence This Week</h3>
      <ul style="padding:0 0 0 16px;margin:0;">${topEntries}</ul>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://research.ekantikcapital.com/feed" style="display:inline-block;background:#d4a843;color:#0a0f1e;padding:12px 28px;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;">
          View Full Feed
        </a>
      </div>
    `),
  }, apiKey)
}

export async function sendTrialExpiring(email: string, daysLeft: number, apiKey: string): Promise<boolean> {
  const urgency = daysLeft <= 2
  return sendEmail({
    to: email,
    subject: urgency ? `Your trial expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}!` : `${daysLeft} days left in your Ekantik trial`,
    html: emailWrapper(`
      <h2 style="color:#ffffff;margin:0 0 16px;font-size:20px;">
        ${urgency ? 'Your Trial Is Almost Over' : 'Keep Your Edge'}
      </h2>
      <div style="background:${urgency ? '#ef444422' : '#f59e0b22'};border:1px solid ${urgency ? '#ef444444' : '#f59e0b44'};border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;">
        <div style="color:${urgency ? '#ef4444' : '#f59e0b'};font-size:36px;font-weight:700;">${daysLeft}</div>
        <div style="color:${urgency ? '#ef4444' : '#f59e0b'};font-size:13px;font-weight:600;">day${daysLeft === 1 ? '' : 's'} remaining</div>
      </div>
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px;">
        ${urgency
          ? 'Don\'t lose access to daily institutional-grade intelligence. Subscribe now to continue receiving our research.'
          : 'You\'ve been getting a taste of institutional-grade intelligence. Subscribe to keep your competitive edge.'
        }
      </p>
      <div style="text-align:center;">
        <a href="https://research.ekantikcapital.com/account/subscribe" style="display:inline-block;background:#d4a843;color:#0a0f1e;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">
          Subscribe Now
        </a>
      </div>
      <div style="margin-top:16px;text-align:center;">
        <span style="color:#6b7280;font-size:12px;">Monthly: $149/mo · Annual: $999/yr (save $789)</span>
      </div>
    `),
  }, apiKey)
}
