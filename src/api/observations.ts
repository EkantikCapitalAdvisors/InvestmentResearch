import { Hono } from 'hono'

type Bindings = { DB: D1Database; ANTHROPIC_API_KEY: string; SLACK_BOT_TOKEN?: string; SLACK_SIGNING_SECRET?: string; RESEARCH_PASSCODE?: string }

const observationsApi = new Hono<{ Bindings: Bindings }>()

// ============================================================
// OBSERVATIONS
// ============================================================
observationsApi.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM observations ORDER BY created_at DESC LIMIT 50').all()
  return c.json({ observations: results })
})

observationsApi.post('/', async (c) => {
  const body = await c.req.json()
  const id = 'obs-' + Date.now()
  await c.env.DB.prepare(
    'INSERT INTO observations (id, happened_text, why_matters, watch_next, ticker_symbols, kpi, category, is_potential_pivot, pivot_type, pivot_magnitude, catalyst_date, reality_change) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    id, body.happened_text, body.why_matters, body.watch_next,
    JSON.stringify(body.ticker_symbols || []),
    body.kpi || null, body.category || null,
    body.is_potential_pivot ? 1 : 0,
    body.pivot_type || null,
    body.pivot_magnitude || null,
    body.catalyst_date || null,
    body.reality_change || null
  ).run()
  return c.json({ id, success: true })
})

// ── Observation File Upload Endpoints ─────────────────────
// List files (optionally filter by observation_id, or get all general files)
observationsApi.get('/files', async (c) => {
  const obsId = c.req.query('observation_id')
  let query: string
  let params: any[]
  if (obsId) {
    query = 'SELECT id, observation_id, file_name, file_type, file_size, notes, uploaded_by, created_at FROM observation_files WHERE observation_id = ? ORDER BY created_at DESC'
    params = [obsId]
  } else {
    // Return all observation files (general + linked)
    query = 'SELECT id, observation_id, file_name, file_type, file_size, notes, uploaded_by, created_at FROM observation_files ORDER BY created_at DESC'
    params = []
  }
  const stmt = params.length > 0 ? c.env.DB.prepare(query).bind(...params) : c.env.DB.prepare(query)
  const { results } = await stmt.all()
  return c.json({ files: results })
})

// Upload a file (optionally linked to a specific observation)
observationsApi.post('/files', async (c) => {
  const contentType = c.req.header('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await c.req.formData()
    const file = formData.get('file') as File | null
    const notes = (formData.get('notes') as string) || null
    const observationId = (formData.get('observation_id') as string) || null

    if (!file) return c.json({ error: 'No file provided' }, 400)

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) return c.json({ error: 'File too large (max 5MB)' }, 400)

    const allowedTypes = [
      'text/markdown', 'text/plain', 'text/csv',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream'
    ]
    const allowedExtensions = ['.md', '.txt', '.csv', '.pdf', '.doc', '.docx', '.xls', '.xlsx']
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      return c.json({ error: 'File type not allowed. Accepted: md, txt, csv, pdf, doc, docx, xls, xlsx' }, 400)
    }

    const buffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

    const result = await c.env.DB.prepare(`
      INSERT INTO observation_files (observation_id, file_name, file_type, file_size, content_b64, notes, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, 'portal')
    `).bind(
      observationId, file.name, file.type || 'application/octet-stream', file.size, base64, notes
    ).run()

    return c.json({
      id: result.meta.last_row_id,
      observation_id: observationId,
      file_name: file.name,
      file_size: file.size,
      notes,
      uploaded_by: 'portal'
    })
  }

  return c.json({ error: 'Content-Type must be multipart/form-data' }, 400)
})

// Download a file
observationsApi.get('/files/:id/download', async (c) => {
  const id = c.req.param('id')
  const file = await c.env.DB.prepare('SELECT * FROM observation_files WHERE id = ?').bind(id).first() as any
  if (!file) return c.json({ error: 'File not found' }, 404)

  const binary = atob(file.content_b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

  return new Response(bytes, {
    headers: {
      'Content-Type': file.file_type,
      'Content-Disposition': `attachment; filename="${file.file_name}"`,
      'Content-Length': String(bytes.length)
    }
  })
})

// Preview a text-based file
observationsApi.get('/files/:id/preview', async (c) => {
  const id = c.req.param('id')
  const file = await c.env.DB.prepare('SELECT * FROM observation_files WHERE id = ?').bind(id).first() as any
  if (!file) return c.json({ error: 'File not found' }, 404)

  const textTypes = ['text/markdown', 'text/plain', 'text/csv', 'application/octet-stream']
  const textExts = ['.md', '.txt', '.csv']
  const ext = '.' + file.file_name.split('.').pop()?.toLowerCase()

  if (!textTypes.includes(file.file_type) && !textExts.includes(ext)) {
    return c.json({ error: 'Preview only available for text files', file_name: file.file_name, file_type: file.file_type })
  }

  const decoded = atob(file.content_b64)
  return c.json({ preview: decoded, file_name: file.file_name, file_type: file.file_type })
})

// Delete a file
observationsApi.delete('/files/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM observation_files WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

export { observationsApi }
