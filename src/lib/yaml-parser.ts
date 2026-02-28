/**
 * Simple YAML frontmatter parser for Markdown files.
 * Extracts YAML between --- delimiters and the Markdown body.
 * No external dependencies.
 */

export interface ParsedContent {
  frontmatter: Record<string, any>
  body: string
  errors: string[]
}

export function parseFrontmatter(raw: string): ParsedContent {
  const errors: string[] = []
  const trimmed = raw.trim()

  // Check for frontmatter delimiters
  if (!trimmed.startsWith('---')) {
    return { frontmatter: {}, body: trimmed, errors: ['No YAML frontmatter found (missing opening ---)'] }
  }

  const secondDelimiter = trimmed.indexOf('---', 3)
  if (secondDelimiter === -1) {
    return { frontmatter: {}, body: trimmed, errors: ['Incomplete YAML frontmatter (missing closing ---)'] }
  }

  const yamlBlock = trimmed.substring(3, secondDelimiter).trim()
  const body = trimmed.substring(secondDelimiter + 3).trim()

  const frontmatter = parseYamlBlock(yamlBlock, errors)

  return { frontmatter, body, errors }
}

function parseYamlBlock(yaml: string, errors: string[]): Record<string, any> {
  const result: Record<string, any> = {}
  const lines = yaml.split('\n')
  let currentKey = ''
  let currentArrayKey = ''
  let inArray = false
  let arrayItems: any[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) continue

    // Array item (starts with -)
    if (trimmedLine.startsWith('- ') && inArray) {
      const value = trimmedLine.substring(2).trim()
      // Check if it's a key-value pair inside an array item
      if (value.includes(':')) {
        const obj: Record<string, any> = {}
        const [k, ...v] = value.split(':')
        obj[k.trim()] = parseValue(v.join(':').trim())
        arrayItems.push(obj)
      } else {
        arrayItems.push(parseValue(value))
      }
      continue
    }

    // If we were in an array and hit a non-array line, flush
    if (inArray && !trimmedLine.startsWith('- ')) {
      result[currentArrayKey] = arrayItems
      inArray = false
      arrayItems = []
    }

    // Key-value pair
    const colonIdx = trimmedLine.indexOf(':')
    if (colonIdx > 0) {
      const key = trimmedLine.substring(0, colonIdx).trim()
      const rawValue = trimmedLine.substring(colonIdx + 1).trim()

      if (rawValue === '' || rawValue === '[]') {
        // Could be the start of an array or empty value
        if (rawValue === '[]') {
          result[key] = []
        } else {
          // Might be start of array block
          currentArrayKey = key
          inArray = true
          arrayItems = []
        }
      } else {
        result[key] = parseValue(rawValue)
      }
      currentKey = key
    }
  }

  // Flush any remaining array
  if (inArray) {
    result[currentArrayKey] = arrayItems
  }

  return result
}

function parseValue(raw: string): any {
  // Remove surrounding quotes
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1)
  }

  // Inline array: [item1, item2]
  if (raw.startsWith('[') && raw.endsWith(']')) {
    const inner = raw.slice(1, -1).trim()
    if (!inner) return []
    return inner.split(',').map(s => parseValue(s.trim()))
  }

  // Boolean
  if (raw === 'true') return true
  if (raw === 'false') return false

  // Null
  if (raw === 'null' || raw === '~') return null

  // Number
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)

  return raw
}

/**
 * Validate required fields for an intelligence entry.
 * Returns an array of missing field names.
 */
export function validateIntelligenceEntry(fm: Record<string, any>): string[] {
  const required = ['ticker', 'category', 'title', 'impact_score', 'conviction_level']
  const validCategories = ['daily_intelligence', 'value_opportunity', 'multibagger_report', 'aomg_trend', 'market_commentary', 'watchlist_update', 'avoid_list']
  const validImpact = ['HIGH', 'MEDIUM', 'LOW']
  const validConviction = ['HIGH', 'MEDIUM', 'LOW']
  const missing: string[] = []

  for (const field of required) {
    if (!fm[field]) missing.push(field)
  }

  if (fm.category && !validCategories.includes(fm.category)) {
    missing.push(`category (invalid: ${fm.category})`)
  }
  if (fm.impact_score && !validImpact.includes(fm.impact_score)) {
    missing.push(`impact_score (invalid: ${fm.impact_score})`)
  }
  if (fm.conviction_level && !validConviction.includes(fm.conviction_level)) {
    missing.push(`conviction_level (invalid: ${fm.conviction_level})`)
  }

  return missing
}

/**
 * Generate a URL-safe slug from a title.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
}

/**
 * Auto-generate a summary from the first paragraph of Markdown body.
 */
export function autoSummary(body: string, maxLen: number = 250): string {
  const lines = body.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'))
  const firstPara = lines.slice(0, 3).join(' ').trim()
  if (firstPara.length <= maxLen) return firstPara
  return firstPara.substring(0, maxLen).replace(/\s+\S*$/, '') + '...'
}
