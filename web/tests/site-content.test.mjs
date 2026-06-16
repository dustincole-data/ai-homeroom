import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import test from 'node:test'

const appSource = () => readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const glossarySource = () => readFileSync(new URL('../src/content/permanentGlossary.ts', import.meta.url), 'utf8')

test('newsletter signup uses a real embeddable email form with accessible email input', () => {
  const source = appSource()
  assert.match(source, /<form[^>]+className="signup-form"/)
  assert.match(source, /action=\{EMAIL_SIGNUP_ACTION\}/)
  assert.match(source, /type="email"/)
  assert.match(source, /placeholder="you@example\.com"/)
  assert.match(source, /Send Dustin my email/)
  assert.match(source, /dustincole\.ent@gmail\.com/)
  assert.doesNotMatch(source, /hello@example\.com/)
  assert.doesNotMatch(source, /hello@dustincoledata\.com/)
})

test('site exposes an RSS feed and free RSS-to-email subscribe path', () => {
  const app = appSource()
  assert.match(app, /const RSS_FEED_URL = 'https:\/\/dustincole-data\.github\.io\/ai-homeroom\/feed\.xml'/)
  assert.match(app, /const FEEDRABBIT_SUBSCRIBE_URL = 'https:\/\/feedrabbit\.com\/subscriptions\/new'/)
  assert.match(app, /className="signup-form rss-subscribe-form"/)
  assert.match(app, /name="url" value=\{RSS_FEED_URL\}/)
  assert.match(app, /Email me site updates/)

  const feedFile = new URL('../public/feed.xml', import.meta.url)
  assert.equal(existsSync(feedFile), true)
  const feed = readFileSync(feedFile, 'utf8')
  assert.match(feed, /<rss version="2\.0"/)
  assert.match(feed, /<title>AI Homeroom<\/title>/)
  assert.match(feed, /<atom:link href="https:\/\/dustincole-data\.github\.io\/ai-homeroom\/feed\.xml"/)
  assert.match(feed, /<item>/)

  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  assert.match(html, /rel="alternate" type="application\/rss\+xml"/)
  assert.match(html, /href="\/ai-homeroom\/feed\.xml"/)
})

test('feed update script exists so daily refreshes can trigger notifications', () => {
  const script = readFileSync(new URL('../scripts/update-feed.mjs', import.meta.url), 'utf8')
  assert.match(script, /const SITE_URL = 'https:\/\/dustincole-data\.github\.io\/ai-homeroom\/'/)
  assert.match(script, /writeFileSync\(feedPath, xml\)/)
  assert.match(script, /args\.get\('title'\)/)
  assert.match(script, /args\.get\('description'\)/)

  const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8')
  assert.match(packageJson, /"update-feed": "node scripts\/update-feed\.mjs"/)
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

test('permanent glossary includes the classroom article AI terms', () => {
  const glossary = glossarySource()
  const requiredTerms = [
    'Large language models',
    'Neural networks',
    'Transformers',
    'Tokens',
    'Embeddings',
    'Inference',
    'Training data',
    'Fine-tuning',
    'Hallucinations',
    'Agents',
    'Multimodal AI',
    'Prompt engineering',
    'Context windows',
    'Synthetic data',
    'GPUs',
    'Model weights',
    'RAG',
    'APIs',
    'Automation',
    'MCP',
    'Model Context Protocol',
    'Coding agents',
    'Skills',
    'Vector search',
    'Vector database',
  ]

  for (const term of requiredTerms) {
    assert.match(glossary, new RegExp(`term: '${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`))
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
