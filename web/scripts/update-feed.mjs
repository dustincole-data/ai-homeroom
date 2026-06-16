#!/usr/bin/env node
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_URL = 'https://dustincole-data.github.io/ai-homeroom/'
const FEED_URL = `${SITE_URL}feed.xml`

const args = new Map()
for (let index = 2; index < process.argv.length; index += 1) {
  const key = process.argv[index]
  const value = process.argv[index + 1]
  if (key?.startsWith('--') && value && !value.startsWith('--')) {
    args.set(key.slice(2), value)
    index += 1
  }
}

const now = new Date()
const dateStamp = now.toISOString().slice(0, 10)
const title = args.get('title') ?? `AI Homeroom update: ${dateStamp}`
const description =
  args.get('description') ??
  'AI Homeroom has a fresh plain-English AI briefing with source links and glossary notes.'
const guid = args.get('guid') ?? `ai-homeroom-${dateStamp}`
const link = args.get('link') ?? `${SITE_URL}#today`
const pubDate = now.toUTCString()

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI Homeroom</title>
    <link>${SITE_URL}</link>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
    <description>Daily AI news explained in plain English with glossary notes for normal people.</description>
    <language>en-us</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <generator>AI Homeroom static site</generator>
    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>
  </channel>
</rss>
`

const scriptDir = dirname(fileURLToPath(import.meta.url))
const feedPath = resolve(scriptDir, '../public/feed.xml')
writeFileSync(feedPath, xml)
console.log(`Updated ${feedPath}`)
