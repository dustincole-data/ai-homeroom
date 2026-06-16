import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import test from 'node:test'

const appSource = () => readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

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

  const glossarySource = readFileSync(glossaryFile, 'utf8')
  assert.match(glossarySource, /export const permanentGlossaryTerms/)
  assert.match(glossarySource, /Agentic AI/)
  assert.match(glossarySource, /MCP/)

  const source = appSource()
  assert.match(source, /import \{ permanentGlossaryTerms \}/)
  assert.match(source, /permanentGlossaryTerms\.map/)
})
