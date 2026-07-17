import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import test from 'node:test'

const appSource = () => readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const glossarySource = () => readFileSync(new URL('../src/content/permanentGlossary.ts', import.meta.url), 'utf8')
const storiesSource = () => readFileSync(new URL('../src/content/stories.ts', import.meta.url), 'utf8')

test('site has no signup or update-subscription UI', () => {
  const app = appSource()
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

  for (const source of [app, html]) {
    assert.doesNotMatch(source, /signup/i)
    assert.doesNotMatch(source, /subscribe/i)
    assert.doesNotMatch(source, /Feedrabbit/i)
    assert.doesNotMatch(source, /formsubmit\.co/i)
    assert.doesNotMatch(source, /Daily email/i)
    assert.doesNotMatch(source, /rel="alternate" type="application\/rss\+xml"/i)
  }
})

test('feed update script remains available for the daily site refresh job', () => {
  const feedFile = new URL('../public/feed.xml', import.meta.url)
  assert.equal(existsSync(feedFile), true)
  const feed = readFileSync(feedFile, 'utf8')
  assert.match(feed, /<rss version="2\.0"/)
  assert.match(feed, /<title>AI Homeroom<\/title>/)
  assert.match(feed, /<item>/)

  const script = readFileSync(new URL('../scripts/update-feed.mjs', import.meta.url), 'utf8')
  assert.match(script, /const SITE_URL = 'https:\/\/dustincole-data\.github\.io\/ai-homeroom\/'/)
  assert.match(script, /writeFileSync\(feedPath, xml\)/)
  assert.match(script, /args\.get\('title'\)/)
  assert.match(script, /args\.get\('description'\)/)

  const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8')
  assert.match(packageJson, /"update-feed": "node scripts\/update-feed\.mjs"/)
})

test('fresh story generator is wired into deployment and avoids stale static stories', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/pages.yml', import.meta.url), 'utf8')
  const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8')
  const generator = readFileSync(new URL('../scripts/generate-stories.mjs', import.meta.url), 'utf8')
  const stories = storiesSource()
  const publishedHistory = JSON.parse(readFileSync(new URL('../src/content/published-story-history.json', import.meta.url), 'utf8')).stories

  assert.match(packageJson, /"update-stories": "node scripts\/generate-stories\.mjs"/)
  assert.match(workflow, /npm run update-stories/)
  assert.match(workflow, /github\.actor != 'github-actions\[bot\]'/)
  assert.match(workflow, /Persist generated stories for the next refresh/)
  assert.match(workflow, /git add web\/src\/content\/stories\.ts/)
  assert.match(generator, /lookbackMs = 24 \* 60 \* 60 \* 1000/)
  assert.match(generator, /isSameTopic\(story, topic\)/)
  assert.match(generator, /const publishedHistory = loadPublishedHistory\(\)/)
  assert.match(generator, /isPreviouslyPublished\(topic, previouslyPublished\)/)
  assert.match(generator, /published\.sourceUrl === entry\.sourceUrl/)

  const currentStories = JSON.parse(stories.match(/export const storySeeds: StorySeed\[\] = (\[[\s\S]*\])\s*$/)?.[1] ?? '[]')
  assert.ok(currentStories.every((story) => publishedHistory.some((published) => published.sourceUrl === story.sourceUrl)), 'every live story should be retained in published history')

  const generatedAt = stories.match(/export const generatedAt = '([^']+)'/)?.[1]
  assert.ok(generatedAt, 'generatedAt should be present')
  assert.ok(Date.now() - Date.parse(generatedAt) < 48 * 60 * 60 * 1000, 'generated stories should not be stale')

  const headlines = [...stories.matchAll(/"headline": "([^"]+)"/g)].map((match) => match[1])
  // On quiet news days, one reliable, unique story beats inventing or repeating coverage.
  assert.ok(headlines.length >= 1, 'at least one fresh story should be generated')
  assert.ok(headlines.length <= 6, 'no more than six fresh stories should be generated')
  assert.equal(new Set(headlines).size, headlines.length)
})

test('lesson notes come from the model per story, with a heuristic fallback and repeat guard', () => {
  const generator = readFileSync(new URL('../scripts/generate-stories.mjs', import.meta.url), 'utf8')
  const workflow = readFileSync(new URL('../../.github/workflows/pages.yml', import.meta.url), 'utf8')

  assert.match(generator, /async function writeLessonNotes/)
  assert.match(generator, /function validateNotes/)
  assert.match(generator, /process\.env\.OPENAI_API_KEY/)
  assert.match(generator, /near-identical/, 'duplicate notes must be rejected')
  assert.match(generator, /keeping heuristic lesson notes/, 'missing key must not break the refresh')
  assert.match(workflow, /OPENAI_API_KEY: \$\{\{ secrets\.OPENAI_API_KEY \}\}/)
})

test('site exposes app icons and social share preview metadata', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  assert.match(html, /rel="apple-touch-icon" href="\/ai-homeroom\/apple-touch-icon\.png"/)
  assert.match(html, /rel="manifest" href="\/ai-homeroom\/site\.webmanifest"/)
  assert.match(html, /property="og:image" content="https:\/\/dustincole-data\.github\.io\/ai-homeroom\/og-image\.png"/)
  assert.match(html, /name="twitter:card" content="summary_large_image"/)
  assert.match(html, /name="theme-color" content="#13233f"/)

  for (const asset of [
    '../public/favicon.svg',
    '../public/logo.svg',
    '../public/apple-touch-icon.png',
    '../public/icons/icon-192.png',
    '../public/icons/icon-512.png',
    '../public/og-image.png',
    '../public/site.webmanifest',
  ]) {
    assert.equal(existsSync(new URL(asset, import.meta.url)), true, `${asset} should exist`)
  }

  const manifest = readFileSync(new URL('../public/site.webmanifest', import.meta.url), 'utf8')
  assert.match(manifest, /"name": "AI Homeroom"/)
  assert.match(manifest, /"src": "\/ai-homeroom\/icons\/icon-192\.png"/)
  assert.match(manifest, /"src": "\/ai-homeroom\/icons\/icon-512\.png"/)
})

test('permanent glossary terms live in a dedicated source file and are merged into displayed glossary', () => {
  const glossaryFile = new URL('../src/content/permanentGlossary.ts', import.meta.url)
  assert.equal(existsSync(glossaryFile), true)

  const glossary = glossarySource()
  assert.match(glossary, /export const permanentGlossaryTerms/)
  assert.match(glossary, /Agentic AI/)
  assert.match(glossary, /MCP/)

  const source = appSource()
  assert.match(source, /import \{ permanentGlossaryTerms/)
  assert.match(source, /permanentGlossaryTerms\.map/)
})

test('permanent glossary includes canonical versions of all current classroom AI terms', () => {
  const glossary = glossarySource()
  const requiredTerms = [
    'Artificial Intelligence (AI)',
    'Large Language Model (LLM)',
    'Neural Network',
    'Transformer',
    'Token',
    'Embedding',
    'Inference',
    'Training Data',
    'Fine-Tuning',
    'Hallucination',
    'AI Agent',
    'Multimodal AI',
    'Prompt Engineering',
    'Context Window',
    'Synthetic Data',
    'GPU',
    'Model Weights',
    'Retrieval-Augmented Generation (RAG)',
    'API',
    'Automation',
    'Model Context Protocol (MCP)',
    'Coding Agent',
    'Skill',
    'Vector Search',
    'Vector Database',
    'AI Detector',
    'AI-Generated Music',
    'AI Safety',
    'Back-Office Work',
    'Chatbot',
    'Claude Fable',
    'Coding',
    'Company Server',
    'DeepMind',
    'Deezer',
    'Debugging',
    'DiffusionGemma',
    'Engineer',
    'Grok',
    'Guardrails',
    'Hidden Rules',
    'Human Judgment',
    'Local AI',
    'Local Device',
    'Lower-Cost Team',
    'Model',
    'Open Model',
    'Operations',
    'Outsourcing',
    'Platform',
    'Privacy',
    'Remote Server',
    'Software Engineer',
    'Streaming Service',
    'System',
    'Testing',
    'Tool',
    'Tradeoff',
    'Unsupervised Learning',
    'Supervised Learning',
    'Validation',
  ]

  for (const term of requiredTerms) {
    assert.match(glossary, new RegExp(`term: '${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`))
  }
})

test('permanent glossary does not keep separate plural shorthand or too-similar duplicate terms', () => {
  const glossary = glossarySource()
  const terms = [...glossary.matchAll(/term: '([^']+)'/g)].map((match) => match[1])

  assert.equal(new Set(terms.map((term) => term.toLowerCase())).size, terms.length)

  const duplicateTerms = [
    'AI',
    'Artificial intelligence',
    'AI systems',
    'Agents',
    'APIs',
    'Context',
    'Context windows',
    'Gen AI',
    'Large language model',
    'Large language models',
    'LLM',
    'LLMs',
    'MCP',
    'MCPs',
    'Model Context Protocol',
    'Neural networks',
    'Open-weight model',
    'open AI model',
    'open model',
    'RAG',
    'Retrieval-Augmented Generation',
    'Skills',
    'Tokens',
    'Tools',
    'Vector database',
  ]

  for (const term of duplicateTerms) {
    assert.equal(terms.includes(term), false, `${term} should be folded into one canonical glossary entry`)
  }
})

test('glossary term id helper creates stable glossary anchors', () => {
  const source = appSource()
  assert.match(source, /function glossaryTermId\(term: string\)/)
  assert.match(source, /return `glossary-\$\{slug\}`/)
  assert.match(source, /id=\{glossaryTermId\(term\.term\)\}/)
})

test('article term markup links to permanent glossary anchors while keeping hover definitions', () => {
  const source = appSource()
  assert.match(source, /<a\s+className="term"/)
  assert.match(source, /href=\{`#\$\{glossaryTermId\(term\.term\)\}`\}/)
  assert.match(source, /data-definition=\{term\.definition\}/)
  assert.doesNotMatch(source, /<span className="term"/)
})

test('story rendering links both story terms and permanent terms without duplicates', () => {
  const source = appSource()
  assert.match(source, /function storyTermsWithPermanentTerms\(storyTerms: Term\[\]\)/)
  assert.match(source, /storyTermsWithPermanentTerms\(featuredStory\.terms\)/)
  assert.match(source, /storyTermsWithPermanentTerms\(story\.terms\)/)
  assert.match(source, /term\.term\.toLowerCase\(\)/)
})
