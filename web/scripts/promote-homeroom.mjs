// Promotes a design variant to the site root in the build output.
// The React app's index.html is replaced by the variant's page; the variant
// keeps working at its old /variants/<name>/ URL via a redirect stub, so
// existing links never break.
//
// Runs after `vite build` (and after emit-variant-data.mjs) in the Pages
// workflow. Source files under public/variants/ are never modified.
//
//   node scripts/promote-homeroom.mjs [variant] [baseDir]
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const variant = process.argv[2] ?? 'paper-diorama'
const baseDir = join(webRoot, process.argv[3] ?? 'dist')
const src = join(baseDir, 'variants', variant)

if (!existsSync(join(src, 'index.html'))) {
  console.error(`No built variant at ${src}; nothing to promote.`)
  process.exit(1)
}

// Copy the whole variant to the root. Its refs are all relative (./styles.css,
// ./assets/…, ./vendor/…), so they resolve identically one level up.
cpSync(src, baseDir, { recursive: true })

// Sibling links (../night-school/) were relative to /variants/; from the root
// they must point down into /variants/.
const rootIndex = join(baseDir, 'index.html')
writeFileSync(
  rootIndex,
  readFileSync(rootIndex, 'utf8').replace(/href="\.\.\/(night-school|permanent-record)\//g, 'href="./variants/$1/'),
)

// Leave a redirect where the variant used to live.
writeFileSync(
  join(src, 'index.html'),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>AI Homeroom</title>
<link rel="canonical" href="https://dustincole-data.github.io/ai-homeroom/" />
<meta http-equiv="refresh" content="0; url=../../" />
</head>
<body><p>AI Homeroom has moved to <a href="../../">the front page</a>.</p></body>
</html>
`,
)

console.log(`promoted ${variant} to site root; left a redirect at /variants/${variant}/`)
