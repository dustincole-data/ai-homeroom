// Regenerates the static content snapshot (data.js) used by the design
// variants in public/variants/. Run with the target base dir relative to
// web/ (default: dist). In the Pages workflow this runs after `vite build`
// so every deploy ships the same stories the React app was built with.
//
//   node scripts/emit-variant-data.mjs         # writes into dist/variants/*/
//   node scripts/emit-variant-data.mjs public  # refreshes committed snapshots
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(webRoot, 'src', 'content')
const baseDir = join(webRoot, process.argv[2] ?? 'dist')

// Evaluate a TS content module by stripping types (they are data files with
// a single exported array; no imports).
function evalContent(file, exportName) {
  let src = readFileSync(join(contentDir, file), 'utf8').replace(/\r\n/g, '\n')
  src = src.replace(/export type [\s\S]*?\n\}\n/g, '')
  src = src.replace(/: (StorySeed|PermanentGlossaryTerm)\[\]/g, '')
  src = src.replace(/^export /gm, '')
  src += `\n;globalThis.__out = ${exportName};`
  new Function(src)()
  return globalThis.__out
}

const stories = evalContent('stories.ts', 'storySeeds')
const glossary = evalContent('permanentGlossary.ts', 'permanentGlossaryTerms')
const generatedAt = readFileSync(join(contentDir, 'stories.ts'), 'utf8').match(/generatedAt = '([^']+)'/)[1]

const payload = `// AI Homeroom content snapshot — generated ${generatedAt}\nwindow.HOMEROOM = ${JSON.stringify({ generatedAt, stories, glossary }, null, 1)}\n`

const variantsDir = join(baseDir, 'variants')
if (!existsSync(variantsDir)) {
  console.error(`No variants dir at ${variantsDir}; nothing to do.`)
  process.exit(0)
}
for (const name of readdirSync(variantsDir)) {
  const target = join(variantsDir, name, 'data.js')
  if (existsSync(target)) {
    writeFileSync(target, payload)
    console.log(`refreshed ${name}/data.js (${stories.length} stories, ${glossary.length} terms, ${generatedAt})`)
  }
}
