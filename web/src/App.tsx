import type { ReactNode } from 'react'

import './App.css'

type Term = {
  term: string
  definition: string
}

type Story = {
  headline: string
  badge: 'new' | 'updated'
  summary: string
  whyItMatters: string
  sourceName: string
  sourceUrl: string
  terms: Term[]
}

const editionDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}).format(new Date())

const sampleStories: Story[] = [
  {
    headline: 'AI safety rules can be hard to see',
    badge: 'new',
    summary:
      'Some AI companies are adding quiet safety rules inside their chatbots. These rules can block answers when the system thinks a request is risky. The tricky part is that users and researchers may not know which rule caused the block.',
    whyItMatters:
      'If a chatbot refuses normal questions, people need a clear reason instead of guessing what went wrong.',
    sourceName: 'Phase 1 dry run',
    sourceUrl: 'https://github.com/dustincole-data/ai-homeroom',
    terms: [
      {
        term: 'chatbot',
        definition: 'A chatbot is software that talks with you in text, like a digital help desk worker.',
      },
      {
        term: 'safety rules',
        definition: 'Safety rules are limits that tell an AI what it should avoid doing or saying.',
      },
    ],
  },
  {
    headline: 'AI music detectors are getting serious',
    badge: 'new',
    summary:
      'Music services are trying to spot songs made by AI. A detector looks for patterns that may show a track was generated instead of recorded by people. This could help artists, labels, and listeners understand what they are hearing.',
    whyItMatters:
      'Your music app may soon label whether a song was made by a person, an AI tool, or both.',
    sourceName: 'Phase 1 dry run',
    sourceUrl: 'https://github.com/dustincole-data/ai-homeroom',
    terms: [
      {
        term: 'AI detector',
        definition: 'An AI detector is a tool that looks for clues that something was made by artificial intelligence.',
      },
      {
        term: 'generated',
        definition: 'Generated means created by a computer system instead of directly written, drawn, or recorded by a person.',
      },
    ],
  },
]

function markTerms(summary: string, terms: Term[]) {
  let pieces: (string | ReactNode)[] = [summary]

  terms.forEach((term) => {
    const regex = new RegExp(`(${escapeRegExp(term.term)})`, 'gi')
    pieces = pieces.flatMap((piece, index) => {
      if (typeof piece !== 'string') return [piece]
      return piece.split(regex).map((part, partIndex) => {
        if (part.toLowerCase() !== term.term.toLowerCase()) return part
        return (
          <span className="term" tabIndex={0} data-definition={term.definition} key={`${term.term}-${index}-${partIndex}`}>
            {part}
          </span>
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
  return (
    <main>
      <section className="hero" aria-labelledby="site-title">
        <p className="eyebrow">Daily AI news, explained like homeroom notes</p>
        <h1 id="site-title">AI Homeroom</h1>
        <p className="dek">
          The day’s AI stories translated into plain English: what happened, why it matters, and what the weird words mean.
        </p>
        <div className="hero-actions">
          <a href="#today" className="button primary">Read today’s lesson</a>
          <a href="https://github.com/dustincole-data/ai-homeroom" className="button secondary">View the build</a>
        </div>
      </section>

      <section className="status-card" aria-label="Build status">
        <div>
          <span className="label">Current phase</span>
          <strong>Static shell live on GitHub Pages</strong>
        </div>
        <div>
          <span className="label">Next</span>
          <strong>Connect Supabase daily editions</strong>
        </div>
      </section>

      <section id="today" className="edition" aria-labelledby="edition-title">
        <div className="section-heading">
          <p className="eyebrow">Today’s lesson</p>
          <h2 id="edition-title">{editionDate}</h2>
          <p>
            Placeholder stories below show the final reading experience. The ingestion pipeline is already in the repo; production publishing comes after Supabase approval.
          </p>
        </div>

        <div className="story-list">
          {sampleStories.map((story) => (
            <article className="story-card" key={story.headline}>
              <div className="story-topline">
                <span className={`badge ${story.badge}`}>{story.badge}</span>
                <a href={story.sourceUrl}>{story.sourceName}</a>
              </div>
              <h3>{story.headline}</h3>
              <p className="summary">{markTerms(story.summary, story.terms)}</p>
              <p className="why"><strong>Why it matters:</strong> {story.whyItMatters}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glossary-preview" aria-labelledby="glossary-title">
        <div className="section-heading">
          <p className="eyebrow">Glossary preview</p>
          <h2 id="glossary-title">Terms should stay simple</h2>
        </div>
        <dl>
          {sampleStories.flatMap((story) => story.terms).map((term) => (
            <div key={term.term}>
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
