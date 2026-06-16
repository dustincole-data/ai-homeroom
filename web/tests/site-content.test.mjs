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
  assert.match(source, /Subscribe to AI Homeroom/)
  assert.doesNotMatch(source, /hello@example\.com/)
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
