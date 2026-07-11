const stopWords = new Set([
  'the', 'a', 'an', 'to', 'of', 'and', 'or', 'for', 'in', 'on', 'with', 'is', 'are', 'be', 'as', 'at', 'by', 'from', 'its', 'it', 'this', 'that', 'after', 'over', 'new',
  'ai', 'artificial', 'intelligence', 'story', 'report', 'reports', 'says', 'said', 'will', 'would', 'could', 'feature', 'features', 'content', 'people', 'person', 'company', 'companies',
])

function normalizeToken(token) {
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`
  if (token.endsWith('s') && token.length > 4 && !token.endsWith('ss')) return token.slice(0, -1)
  return token
}

function topicTokens({ headline = '', context = '' }) {
  return new Set(
    `${headline} ${headline} ${context}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .map(normalizeToken)
      .filter((token) => token.length > 2 && !stopWords.has(token)),
  )
}

function overlap(left, right) {
  let shared = 0
  left.forEach((token) => {
    if (right.has(token)) shared += 1
  })
  return shared
}

/**
 * Returns true only when two independently sourced articles describe the same
 * event. It intentionally compares the headline plus source excerpt so it can
 * catch rewritten headlines without collapsing broad AI coverage together.
 */
export function isSameTopic(leftStory, rightStory) {
  const left = topicTokens(leftStory)
  const right = topicTokens(rightStory)
  const union = new Set([...left, ...right]).size
  if (!union) return false

  const shared = overlap(left, right)
  return shared >= 3 && shared / union >= 0.1
}
