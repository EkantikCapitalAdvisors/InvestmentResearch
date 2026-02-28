import { Hono } from 'hono'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string; SLACK_BOT_TOKEN?: string; SLACK_SIGNING_SECRET?: string; RESEARCH_PASSCODE?: string }

const mag7Api = new Hono<{ Bindings: Bindings }>()

// ============================================================
// MAG 7
// ============================================================
mag7Api.get('/scorecard', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT t.*,
      (SELECT composite FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as ai_score,
      (SELECT conviction_level FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as conviction,
      (SELECT signal_type FROM trade_signals WHERE ticker_id = t.id AND is_active = 1 ORDER BY created_at DESC LIMIT 1) as active_signal,
      (SELECT tam_score FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as tam_score,
      (SELECT bias_score FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as bias_score,
      (SELECT superlative_score FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as superlative_score,
      (SELECT disruption_score FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) as disruption_score
    FROM tickers t WHERE t.is_mag7 = 1 ORDER BY
      (SELECT composite FROM ai_scores WHERE ticker_id = t.id ORDER BY scored_at DESC LIMIT 1) DESC
  `).all()
  return c.json({ tickers: results })
})

export { mag7Api }
