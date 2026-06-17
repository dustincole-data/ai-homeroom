import { useEffect, type ReactNode } from 'react'

import { permanentGlossaryTerms } from './content/permanentGlossary'
import { generatedAt, storySeeds } from './content/stories'
import './App.css'

type Term = {
  term: string
  definition: string
  aliases?: string[]
}

type Story = {
  headline: string
  badge: 'new' | 'updated'
  summary: string
  whyItMatters: string
  sourceName: string
  sourceUrl: string
  terms: Term[]
  publishedAt: string
}

const editionDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}).format(new Date(generatedAt))

const glossaryByName = new Map(
  permanentGlossaryTerms.flatMap((term) => [
    [term.term.toLowerCase(), term],
    ...(term.aliases ?? []).map((alias) => [alias.toLowerCase(), term] as const),
  ]),
)

const define = (name: string): Term => {
  const term = glossaryByName.get(name.toLowerCase())
  if (!term) throw new Error(`Missing glossary term: ${name}`)
  return term
}

const stories: Story[] = storySeeds.map((story) => ({
  ...story,
  terms: story.termNames.map(define),
}))

const allTerms = Array.from(
  new Map(
    [...permanentGlossaryTerms.map((term) => ({ ...term })), ...stories.flatMap((story) => story.terms)].map((term) => [
      term.term.toLowerCase(),
      term,
    ]),
  ).values(),
).sort((a, b) => a.term.localeCompare(b.term))

function glossaryTermId(term: string) {
  const slug = term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `glossary-${slug}`
}

function glossaryAliasIds(term: Term) {
  const canonicalId = glossaryTermId(term.term)
  return (term.aliases ?? [])
    .map(glossaryTermId)
    .filter((id, index, ids) => id !== canonicalId && ids.indexOf(id) === index)
}

function storyTermsWithPermanentTerms(storyTerms: Term[]) {
  return Array.from(
    new Map(
      [...storyTerms, ...permanentGlossaryTerms].map((term) => [term.term.toLowerCase(), term]),
    ).values(),
  )
}

function markTerms(summary: string, terms: Term[]) {
  let pieces: (string | ReactNode)[] = [summary]
  const candidates = terms
    .flatMap((term) => [term.term, ...(term.aliases ?? [])].map((matchText) => ({ term, matchText })))
    .sort((a, b) => b.matchText.length - a.matchText.length)

  candidates.forEach(({ term, matchText }) => {
    const regex = new RegExp(`(?<![A-Za-z0-9])(${escapeRegExp(matchText)})(?![A-Za-z0-9])`, 'gi')
    pieces = pieces.flatMap((piece, index) => {
      if (typeof piece !== 'string') return [piece]
      return piece.split(regex).map((part, partIndex) => {
        if (part.toLowerCase() !== matchText.toLowerCase()) return part
        return (
          <a
            className="term"
            href={`#${glossaryTermId(term.term)}`}
            data-definition={term.definition}
            key={`${term.term}-${matchText}-${index}-${partIndex}`}
          >
            {part}
          </a>
        )
      })
    })
  })

  return pieces
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function App() {
  useEffect(() => {
    const scrollToCurrentHash = () => {
      const hash = window.location.hash.slice(1)
      if (!hash) return

      const target = document.getElementById(decodeURIComponent(hash))
      target?.scrollIntoView({ block: 'start' })
    }

    scrollToCurrentHash()
    window.addEventListener('hashchange', scrollToCurrentHash)

    return () => window.removeEventListener('hashchange', scrollToCurrentHash)
  }, [])

  const featuredStory = stories[0]
  const remainingStories = stories.slice(1)

  return (
    <main>
      <section className="hero whiteboard" aria-labelledby="site-title">
        <div className="hero-copy">
          <p className="eyebrow">Daily AI news, explained like homeroom notes</p>
          <h1 id="site-title">AI Homeroom</h1>
          <p className="dek">
            The day’s AI stories translated into plain English: what happened, why it matters, and what the weird words mean.
          </p>
          <div className="hero-actions">
            <a href="#today" className="button primary">Read today’s lesson</a>
            <a href="https://github.com/dustincole-data/ai-homeroom" className="button secondary">View the build</a>
          </div>
        </div>
        <aside className="briefing-slip" aria-label="Today’s briefing summary">
          <span className="slip-label">Morning packet</span>
          <strong>{editionDate}</strong>
          <p>{stories.length} sourced stories. Beginner summaries. Glossary cards built in.</p>
        </aside>
      </section>

      <nav className="folder-tabs" aria-label="Briefing categories">
        <a href="#today">Today’s lesson</a>
        <a href="#glossary">Glossary</a>
      </nav>

      <section className="status-card" aria-label="Build status">
        <div>
          <span className="label">Current phase</span>
          <strong>Real daily news loaded</strong>
        </div>
        <div>
          <span className="label">Class rule</span>
          <strong>AI and computing terms get glossary notes</strong>
        </div>
      </section>

      <section id="today" className="edition lesson-handout" aria-labelledby="edition-title">
        <div className="section-heading">
          <p className="eyebrow">Today’s lesson</p>
          <h2 id="edition-title">{editionDate}</h2>
          <p>
            Fresh AI stories from the latest automated refresh, rewritten in plain English with direct source links.
          </p>
        </div>

        <article className="featured-board" aria-label="Featured story">
          <span className="pushpin" aria-hidden="true" />
          <div className="story-topline">
            <span className={`badge ${featuredStory.badge}`}>{featuredStory.badge}</span>
            <span>{featuredStory.sourceName}</span>
          </div>
          <h3>{featuredStory.headline}</h3>
          <p className="summary">{markTerms(featuredStory.summary, storyTermsWithPermanentTerms(featuredStory.terms))}</p>
          <p className="why"><strong>Why it matters:</strong> {featuredStory.whyItMatters}</p>
          <a className="article-link" href={featuredStory.sourceUrl} target="_blank" rel="noreferrer">
            Original source: {featuredStory.sourceName}
          </a>
        </article>

        <div className="story-list">
          {remainingStories.map((story, index) => (
            <article className="story-card notebook-page" key={story.headline}>
              <span className="spiral-edge" aria-hidden="true" />
              <div className="story-topline">
                <span className={`badge ${story.badge}`}>{story.badge}</span>
                <span>{story.sourceName}</span>
              </div>
              <h3>{story.headline}</h3>
              <p className="summary">{markTerms(story.summary, storyTermsWithPermanentTerms(story.terms))}</p>
              <p className="why"><strong>Why it matters:</strong> {story.whyItMatters}</p>
              <div className="card-footer">
                <span className="margin-note">Note {index + 2}</span>
                <a className="article-link" href={story.sourceUrl} target="_blank" rel="noreferrer">
                  Original source: {story.sourceName}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="glossary" className="glossary-preview chalkboard" aria-labelledby="glossary-title">
        <div className="section-heading">
          <p className="eyebrow">Glossary preview</p>
          <h2 id="glossary-title">Every weird word gets explained</h2>
        </div>
        <dl>
          {allTerms.map((term) => (
            <div id={glossaryTermId(term.term)} key={term.term}>
              {glossaryAliasIds(term).map((id) => (
                <span id={id} className="glossary-anchor" aria-hidden="true" key={id} />
              ))}
              <dt>{term.term}</dt>
              <dd>{term.definition}</dd>
            </div>
          ))}
        </dl>
      </section>

    </main>
  )
}

export default App
