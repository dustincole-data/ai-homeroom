#!/usr/bin/env node
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const feeds = [
  ['TechCrunch AI', 'https://techcrunch.com/category/artificial-intelligence/feed/'],
  ['The Verge AI', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml'],
  ['Ars Technica AI', 'https://arstechnica.com/ai/feed/'],
  ['VentureBeat AI', 'https://venturebeat.com/category/ai/feed/'],
]

const lookbackMs = 24 * 60 * 60 * 1000
const now = new Date()
const cutoff = new Date(now.getTime() - lookbackMs)
const aiPattern = /\b(ai|a\.i\.|artificial intelligence|llm|large language model|model|openai|anthropic|claude|chatgpt|gemini|gpt|deepmind|mistral|llama|copilot|agents?|xai|grok|cursor|neural|machine learning)\b/i
const stopWords = new Set(['the', 'a', 'an', 'to', 'of', 'and', 'or', 'for', 'in', 'on', 'with', 'is', 'are', 'be', 'as', 'at', 'by', 'from', 'its', 'it', 'this', 'that', 'after', 'over', 'new'])

function decodeXml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/\s+/g, ' ')
    .trim()
}

function firstMatch(block, patterns) {
  for (const pattern of patterns) {
    const match = block.match(pattern)
    if (match?.[1]) return decodeXml(match[1])
  }
  return ''
}

function canonicalUrl(url) {
  try {
    const parsed = new URL(url)
    for (const key of [...parsed.searchParams.keys()]) {
      const lower = key.toLowerCase()
      if (lower.startsWith('utm_') || ['fbclid', 'gclid', 'mc_cid', 'mc_eid'].includes(lower)) {
        parsed.searchParams.delete(key)
      }
    }
    parsed.hash = ''
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return url.trim()
  }
}

function tokens(value) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2 && !stopWords.has(token)),
  )
}

function similarity(a, b) {
  const left = tokens(a)
  const right = tokens(b)
  const union = new Set([...left, ...right])
  if (!union.size) return 0
  let intersection = 0
  left.forEach((token) => {
    if (right.has(token)) intersection += 1
  })
  return intersection / union.size
}

function inferTerms(title) {
  const lower = title.toLowerCase()
  const terms = new Set(['Artificial Intelligence (AI)'])
  if (/anthropic|claude/.test(lower)) terms.add('Anthropic')
  if (/claude/.test(lower)) terms.add('Chatbot')
  if (/openai|chatgpt/.test(lower)) terms.add('Chatbot')
  if (/gemini|deepmind|google/.test(lower)) terms.add('DeepMind')
  if (/xai|grok/.test(lower)) terms.add('xAI')
  if (/agent|copilot|cursor|coding/.test(lower)) terms.add('AI Agent')
  if (/coding|copilot|cursor|software/.test(lower)) terms.add('Coding Agent')
  if (/model|llm|language model|gpt|claude|deepseek|qwen/.test(lower)) terms.add('Model')
  if (/data|database|palantir/.test(lower)) terms.add('Training Data')
  if (/privacy|security|vulnerability|2fa|lawsuit|safety|guardrail/.test(lower)) terms.add('AI Safety')
  if (/chip|gpu|nvidia/.test(lower)) terms.add('GPU')
  if (/speech|voice|transcript|caption/.test(lower)) terms.add('Speech-to-Text')
  if (/image|camera|vision|glasses/.test(lower)) terms.add('Image Recognition')
  if (/tool|platform|app/.test(lower)) terms.add('Tool')
  return [...terms]
}

function cleanLead(text) {
  return text.replace(/\s+/g, ' ').trim().replace(/[.?!]+$/, '')
}

function storySummary(title) {
  const lower = title.toLowerCase()
  if (/palantir/.test(lower) && /france/.test(lower)) {
    return "France plans to replace Palantir's AI data tools with a domestic vendor, a move that keeps more government data and analytics control inside the country."
  }
  if (/wolfram language|mathematica/.test(lower)) {
    return 'Version 15 of Wolfram Language and Mathematica adds a built-in AI assistant and new symbolic music features, bringing AI deeper into technical work.'
  }
  if (/anthropic/.test(lower) && /feud/.test(lower)) {
    return 'Sales data suggests Anthropic’s public clash with the Trump administration may be helping the company, not hurting it.'
  }
  if (/xai/.test(lower) && /(gas turbines|clean air act|pollution|lawsuit)/.test(lower)) {
    return 'The Trump administration is backing xAI in a Clean Air Act fight over gas turbines at its data center, tying AI growth to pollution and permitting battles.'
  }
  if (/token-based billing|claude agent sdk|billing/.test(lower)) {
    return 'Anthropic is pausing token-based billing for its Claude Agent SDK, changing how developers will be charged for building agent-style products.'
  }
  if (/pentagon/.test(lower) && /reports/.test(lower)) {
    return 'The Pentagon says it is using AI to draft reports Congress requires, bringing machine-written paperwork into a process that used to rely on human staff.'
  }
  return `${cleanLead(title)}.`
}

function whyItMatters(title) {
  const lower = title.toLowerCase()
  if (/palantir/.test(lower) && /france/.test(lower)) {
    return 'This is a data-sovereignty move.  Governments want control over sensitive records, and deals like this can push public AI contracts toward local vendors instead of foreign platforms.'
  }
  if (/wolfram language|mathematica/.test(lower)) {
    return 'It puts AI directly inside a tool used by scientists, engineers, and analysts.  If it works well, it shortens the gap between asking a question and getting a real computation.'
  }
  if (/anthropic/.test(lower) && /feud/.test(lower)) {
    return 'Political fights can change buyer behavior in AI.  If a public clash makes a vendor look stronger, that can influence enterprise trust, sales, and competition.'
  }
  if (/xai/.test(lower) && /(gas turbines|clean air act|pollution|lawsuit)/.test(lower)) {
    return 'AI infrastructure now carries real-world costs like power, pollution, and local pushback.  Once defense and AI get tied together, the policy stakes get much bigger.'
  }
  if (/token-based billing|claude agent sdk|billing/.test(lower)) {
    return 'Agent pricing shapes whether teams can ship products at all.  A billing change like this can affect budgets, app design, and whether experiments turn into real businesses.'
  }
  if (/pentagon/.test(lower) && /reports/.test(lower)) {
    return 'When government starts using AI for formal reporting, the big issue is accountability.  Faster paperwork is nice, but accuracy and oversight matter a lot more.'
  }
  if (/security|vulnerability|2fa|safety|guardrail|pollution|clean air|lawsuit/.test(lower)) {
    return 'It shows that AI products are not just demos; they also raise safety, security, legal, and public-trust questions.'
  }
  if (/job|layoff|work|employee|engineer|coding/.test(lower)) {
    return 'It matters for workers because AI is changing which tasks people do themselves and which tasks software can help handle.'
  }
  if (/model|claude|gpt|deepseek|qwen|gemini|openai|anthropic/.test(lower)) {
    return 'It matters because model changes can affect the tools people use for writing, coding, research, and everyday work.'
  }
  if (/app|device|android|apple|airpods|glasses/.test(lower)) {
    return 'It matters because AI features are moving into everyday devices and apps, not just separate chatbots.'
  }
  return 'It matters because AI is moving quickly across business, work, apps, and public policy.'
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'AIHomeroom/1.0' } })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.text()
}

async function fetchRss(sourceName, url) {
  const xml = await fetchText(url)
  const blocks = [...xml.matchAll(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/g)].map((match) => match[0])
  return blocks
    .map((block) => {
      const title = firstMatch(block, [/<title[^>]*>([\s\S]*?)<\/title>/i])
      const link = firstMatch(block, [/<link[^>]*>([\s\S]*?)<\/link>/i, /<link[^>]*href=["']([^"']+)["'][^>]*>/i])
      const dateText = firstMatch(block, [/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i, /<published[^>]*>([\s\S]*?)<\/published>/i, /<updated[^>]*>([\s\S]*?)<\/updated>/i])
      const publishedAt = new Date(dateText)
      return { title, sourceName, sourceUrl: canonicalUrl(link), publishedAt }
    })
    .filter((item) => item.title && item.sourceUrl && !Number.isNaN(item.publishedAt.getTime()) && item.publishedAt >= cutoff && aiPattern.test(item.title))
}

async function fetchHackerNews() {
  const ids = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json').then((res) => res.json())
  const items = []
  for (const id of ids.slice(0, 80)) {
    try {
      const item = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((res) => res.json())
      const title = item?.title ?? ''
      const publishedAt = new Date((item?.time ?? 0) * 1000)
      if (title && aiPattern.test(title) && publishedAt >= cutoff) {
        const sourceUrl = canonicalUrl(item.url ?? `https://news.ycombinator.com/item?id=${id}`)
        let sourceName = 'Hacker News'
        try {
          sourceName = new URL(sourceUrl).hostname.replace(/^www\./, '')
        } catch {
          sourceName = 'Hacker News'
        }
        items.push({
          title,
          sourceName,
          sourceUrl,
          publishedAt,
        })
      }
    } catch {
      // Keep the refresh resilient if one HN item fails.
    }
  }
  return items
}

async function main() {
  const errors = []
  const candidates = []
  for (const [sourceName, url] of feeds) {
    try {
      candidates.push(...(await fetchRss(sourceName, url)))
    } catch (error) {
      errors.push(`${sourceName}: ${error.message}`)
    }
  }
  try {
    candidates.push(...(await fetchHackerNews()))
  } catch (error) {
    errors.push(`Hacker News: ${error.message}`)
  }

  const selected = []
  const seenUrls = new Set()
  for (const candidate of candidates.sort((a, b) => b.publishedAt - a.publishedAt)) {
    if (seenUrls.has(candidate.sourceUrl)) continue
    if (/twitter\.com|x\.com/.test(candidate.sourceUrl)) continue
    if (selected.some((story) => similarity(story.headline, candidate.title) >= 0.34)) continue
    selected.push({
      headline: candidate.title,
      badge: 'new',
      summary: storySummary(candidate.title),
      whyItMatters: whyItMatters(candidate.title),
      sourceName: candidate.sourceName,
      sourceUrl: candidate.sourceUrl,
      termNames: inferTerms(candidate.title),
      publishedAt: candidate.publishedAt.toISOString(),
    })
    seenUrls.add(candidate.sourceUrl)
    if (selected.length === 6) break
  }

  if (selected.length < 3) {
    throw new Error(`Only found ${selected.length} fresh AI stories. Errors: ${errors.join('; ')}`)
  }

  const content = `// Generated by web/scripts/generate-stories.mjs. Do not hand-edit story entries here.\nexport type StorySeed = {\n  headline: string\n  badge: 'new' | 'updated'\n  summary: string\n  whyItMatters: string\n  sourceName: string\n  sourceUrl: string\n  termNames: string[]\n  publishedAt: string\n}\n\nexport const generatedAt = '${now.toISOString()}'\n\nexport const storySeeds: StorySeed[] = ${JSON.stringify(selected, null, 2)}\n`

  const scriptDir = dirname(fileURLToPath(import.meta.url))
  const outputPath = resolve(scriptDir, '../src/content/stories.ts')
  writeFileSync(outputPath, content)
  console.log(`Generated ${selected.length} fresh stories at ${outputPath}`)
  if (errors.length) console.warn(`Non-fatal source errors: ${errors.join('; ')}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
