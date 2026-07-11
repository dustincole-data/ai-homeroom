#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isSameTopic } from './story-dedup.mjs'

const feeds = [
  ['TechCrunch AI', 'https://techcrunch.com/category/artificial-intelligence/feed/'],
  ['The Verge AI', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml'],
  ['Ars Technica AI', 'https://arstechnica.com/ai/feed/'],
  ['VentureBeat AI', 'https://venturebeat.com/category/ai/feed/'],
]

const lookbackMs = 24 * 60 * 60 * 1000
const now = new Date()
const cutoff = new Date(now.getTime() - lookbackMs)
const scriptDir = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(scriptDir, '../src/content/stories.ts')
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

function firstRawMatch(block, patterns) {
  for (const pattern of patterns) {
    const match = block.match(pattern)
    if (match?.[1]) return match[1]
  }
  return ''
}

function cleanProse(value = '') {
  return decodeXml(value)
    .replace(/\b(Image|Photo|Illustration|Screenshot)\s*:\s*[^.]+\./gi, ' ')
    .replace(/\bRead (more|the full story).*$/i, '')
    .replace(/\bThe post .* appeared first on .*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sentenceParts(value) {
  return cleanProse(value)
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'“])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 35)
}

function trimToLength(value, max = 380) {
  if (value.length <= max) return value
  const clipped = value.slice(0, max + 1)
  const lastSpace = clipped.lastIndexOf(' ')
  return `${clipped.slice(0, lastSpace > 220 ? lastSpace : max).replace(/[,.!?;:]+$/, '')}.`
}

function isUsefulContext(text, title) {
  const clean = cleanProse(text)
  if (clean.length < 90) return false
  if (title && similarity(clean, title) > 0.72) return false
  return /\b(says|said|plans|plan|will|would|could|because|after|using|used|build|company|users|developers|workers|government|court|law|data|model|tool|AI)\b/i.test(clean)
}

function metaContent(html, namePattern) {
  const escaped = namePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return firstRawMatch(html, [
    new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`, 'i'),
  ])
}

function extractArticleContext(html) {
  const meta = metaContent(html, 'og:description') || metaContent(html, 'twitter:description') || metaContent(html, 'description')
  if (isUsefulContext(meta, '')) return cleanProse(meta)

  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => cleanProse(match[1]))
    .filter((paragraph) => paragraph.length >= 70 && !/cookie|subscribe|newsletter|advertisement|sign up/i.test(paragraph))
    .slice(0, 3)
    .join(' ')
  return cleanProse(paragraphs)
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

function loadRecentStories() {
  try {
    const source = readFileSync(outputPath, 'utf8')
    const match = source.match(/export const storySeeds: StorySeed\[\] = (\[[\s\S]*\])\s*$/)
    return match ? JSON.parse(match[1]) : []
  } catch {
    return []
  }
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

function stripHeadlineAndByline(title, context) {
  const headline = cleanLead(title)
  let clean = cleanProse(context)
  if (clean.toLowerCase().startsWith(headline.toLowerCase())) {
    clean = clean.slice(headline.length).replace(/^[\s.:|—-]+/, '')
  }
  return clean
    .replace(/^[A-Z][A-Za-z .’'-]+ \d{1,2}:\d{2} [AP]M [A-Z]+ · [A-Za-z]+ \d{1,2}, \d{4}\s+/, '')
    .replace(/^INTERVIEW\s+/i, '')
    .trim()
}

function storySummary(title, context = '') {
  const lower = title.toLowerCase()
  if (/linux maintainer greg kroah-hartman/.test(lower)) {
    return 'Longtime Linux kernel maintainer Greg Kroah-Hartman says AI bug reports have moved from mostly useless noise to something maintainers can actually use.  The story is about a practical turning point: AI tools are now finding real software bugs in one of the most important open-source projects in the world.'
  }
  if (/allbirds/.test(lower) && /no employees/.test(lower)) {
    return 'Allbirds is trying to turn its AI pivot into a real business without building a normal staff around it.  The story looks at a strange new startup model where a public shoe company chases AI, keeps the team tiny, and tries to use automation instead of hiring people first.'
  }
  if (/barret zoph/.test(lower)) {
    return 'Barret Zoph, OpenAI’s head of enterprise AI sales, has left the company only five months after returning.  He had come back from Thinking Machines Lab, the rival AI company started by former OpenAI CTO Mira Murati.'
  }
  if (/baseten/.test(lower)) {
    return 'Baseten, a company that helps other businesses run AI models after they are trained, is reportedly close to raising $1.5 billion at a $13 billion valuation.  That would come only months after its last huge funding round.'
  }
  if (/snap spins off ai video team|dotmo/.test(lower)) {
    return 'Snap is spinning out its AI video team into a separate company called Dotmo because the work is expensive.  Current Snap employees will leave to build the new company around AI video instead of keeping it inside Snapchat.'
  }
  if (/openai is bringing on some big guns/.test(lower)) {
    return 'OpenAI is adding high-profile people as it prepares for an eventual IPO, including Transformer co-inventor Noam Shazeer and former Trump AI policy official Dean Ball.  The story is about OpenAI looking less like a research lab and more like a company preparing for Wall Street and Washington at the same time.'
  }

  const cleanContext = stripHeadlineAndByline(title, context)
  if (isUsefulContext(cleanContext, title)) {
    const sentences = sentenceParts(cleanContext).filter((sentence) => similarity(sentence, title) <= 0.68)
    const picked = sentences.slice(0, 2).join(' ')
    if (isUsefulContext(picked, title)) return trimToLength(picked)
    return trimToLength(cleanContext)
  }

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
  return `${cleanLead(title)}. The article needs a better source excerpt before it should appear in the daily briefing.`
}

function whyItMatters(title, context = '') {
  const lower = `${title} ${context}`.toLowerCase()
  if (/linux|kernel|maintainer|bug|bugs|patch/.test(lower) && /ai/.test(lower)) {
    return 'This is a practical shift, not hype.  If AI tools are finding real bugs in Linux, normal people benefit through more stable phones, servers, apps, and devices they never think about.'
  }
  if (/allbirds|no employees/.test(lower) && /ai/.test(lower)) {
    return 'This is the AI-work story in miniature.  If a company can test a business with almost no staff, that changes hiring, startup costs, and what “building a company” even means.'
  }
  if (/barret zoph|enterprise ai sales|openai.*departed|thinking machines/.test(lower)) {
    return 'Leadership churn at OpenAI matters because these are the people shaping which AI products companies buy and trust.  When top people move around this fast, it can affect product direction, sales, and confidence in the tools businesses are adopting.'
  }
  if (/baseten|inference|funding|valuation|mega-round/.test(lower)) {
    return 'Inference is the expensive part of AI that happens every time someone uses a model.  Big money flowing into companies like Baseten affects whether AI apps get faster, cheaper, or more expensive for everyone else.'
  }
  if (/snap|dotmo|video|costs|spinning off/.test(lower)) {
    return 'AI video is expensive enough that even large consumer apps are reorganizing around the cost.  That matters for users because the flashiest AI features may become separate products, paid tools, or experiments that disappear if the math does not work.'
  }
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
    return 'For normal people, this is the boring part that matters most: whether AI systems can be trusted when money, data, laws, or public safety are involved.'
  }
  if (/job|layoff|work|employee|engineer|coding/.test(lower)) {
    return 'This matters because it changes the shape of work, not just software.  People may spend less time doing routine tasks and more time checking, directing, and fixing AI output.'
  }
  if (/openai is bringing on some big guns|ipo|noam shazeer|dean ball/.test(lower)) {
    return 'This shows OpenAI preparing for a much more grown-up phase.  For normal people, that can affect how the company handles regulation, pricing, enterprise customers, and the tools millions of people already use.'
  }
  if (/model|claude|gpt|deepseek|qwen|gemini|openai|anthropic/.test(lower)) {
    return 'Model changes show up in the tools people already use for writing, coding, studying, and research.  Small changes upstream can change what feels easy or risky downstream.'
  }
  if (/app|device|android|apple|airpods|glasses/.test(lower)) {
    return 'This matters because AI is getting built into normal devices and apps.  People will not always choose to use AI; sometimes it will just be part of the product.'
  }
  return 'The useful question is not whether this sounds futuristic.  It is whether it changes a real decision for workers, customers, developers, schools, governments, or families.'
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'AIHomeroom/1.0' }, signal: AbortSignal.timeout(12000) })
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
      const context = cleanProse(firstRawMatch(block, [/<description[^>]*>([\s\S]*?)<\/description>/i, /<summary[^>]*>([\s\S]*?)<\/summary>/i, /<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i]))
      const publishedAt = new Date(dateText)
      return { title, context, sourceName, sourceUrl: canonicalUrl(link), publishedAt }
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
          context: item?.text ?? '',
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
  const selectedTopics = []
  const seenUrls = new Set()
  const recentStories = loadRecentStories()
  for (const candidate of candidates.sort((a, b) => b.publishedAt - a.publishedAt)) {
    if (seenUrls.has(candidate.sourceUrl)) continue
    if (/twitter\.com|x\.com/.test(candidate.sourceUrl)) continue
    let context = candidate.context ?? ''
    if (!isUsefulContext(context, candidate.title)) {
      try {
        context = extractArticleContext(await fetchText(candidate.sourceUrl))
      } catch (error) {
        errors.push(`${candidate.sourceName} article context: ${error.message}`)
      }
    }

    if (!isUsefulContext(context, candidate.title)) continue
    const topic = { headline: candidate.title, context }
    if (selectedTopics.some((story) => isSameTopic(story, topic))) continue
    if (recentStories.some((story) => isSameTopic(story, topic))) continue

    const summary = storySummary(candidate.title, context)
    const impact = whyItMatters(candidate.title, context)
    if (similarity(summary, candidate.title) > 0.68) continue
    if (/AI is moving quickly across business, work, apps, and public policy/.test(impact)) continue

    selected.push({
      headline: candidate.title,
      badge: 'new',
      summary,
      whyItMatters: impact,
      sourceName: candidate.sourceName,
      sourceUrl: candidate.sourceUrl,
      termNames: inferTerms(candidate.title),
      publishedAt: candidate.publishedAt.toISOString(),
    })
    selectedTopics.push(topic)
    seenUrls.add(candidate.sourceUrl)
    if (selected.length === 6) break
  }

  if (selected.length < 3) {
    throw new Error(`Only found ${selected.length} fresh AI stories. Errors: ${errors.join('; ')}`)
  }

  const content = `// Generated by web/scripts/generate-stories.mjs. Do not hand-edit story entries here.\nexport type StorySeed = {\n  headline: string\n  badge: 'new' | 'updated'\n  summary: string\n  whyItMatters: string\n  sourceName: string\n  sourceUrl: string\n  termNames: string[]\n  publishedAt: string\n}\n\nexport const generatedAt = '${now.toISOString()}'\n\nexport const storySeeds: StorySeed[] = ${JSON.stringify(selected, null, 2)}\n`

  writeFileSync(outputPath, content)
  console.log(`Generated ${selected.length} fresh stories at ${outputPath}`)
  if (errors.length) console.warn(`Non-fatal source errors: ${errors.join('; ')}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
