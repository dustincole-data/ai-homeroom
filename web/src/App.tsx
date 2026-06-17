import { useEffect, type ReactNode } from 'react'

import { permanentGlossaryTerms } from './content/permanentGlossary'
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
}

const editionDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}).format(new Date())

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

const stories: Story[] = [
  {
    headline: 'Anthropic explains hidden Claude safety blocks',
    badge: 'new',
    summary:
      'Anthropic apologized after people found that Claude Fable had invisible guardrails. Guardrails are hidden rules that can stop an AI from answering certain questions. The problem was not just that the model refused answers, but that users could not clearly see why.',
    whyItMatters:
      'If an AI assistant blocks a normal question, people need a plain explanation instead of a mystery refusal.',
    sourceName: 'The Verge',
    sourceUrl: 'https://www.theverge.com/ai-artificial-intelligence/948280/anthropic-claude-fable-invisible-distillation-guardrail',
    terms: [
      define('Anthropic'),
      define('Claude Fable'),
      define('invisible guardrails'),
      define('guardrails'),
      define('hidden rules'),
      define('AI'),
      define('model'),
    ],
  },
  {
    headline: 'AI music labels may be coming',
    badge: 'new',
    summary:
      'Deezer launched a tool that can detect music likely made with AI. The company wants other streaming services to use it too. The goal is to help platforms separate human-made songs, AI-made songs, and music that mixes both.',
    whyItMatters:
      'Your music app may eventually tell you whether a song was made by a person, an AI tool, or both.',
    sourceName: 'The Verge',
    sourceUrl: 'https://www.theverge.com/ai-artificial-intelligence/948153/deezer-ai-music-detector-spotify-apple',
    terms: [
      define('Deezer'),
      define('tool'),
      define('AI'),
      define('streaming services'),
      define('platforms'),
      define('AI-made songs'),
      define('AI detector'),
    ],
  },
  {
    headline: 'Software engineers are not disappearing overnight',
    badge: 'new',
    summary:
      'A widely discussed essay argues that AI has not replaced software engineers because coding is only part of the job. Engineers also decide what to build, check tradeoffs, debug messy systems, and talk with people. AI can help with pieces of the work, but it still needs human judgment around it.',
    whyItMatters:
      'For normal workers, the near-term lesson is to use AI as a helper, not assume it can own the whole job.',
    sourceName: 'Normal Tech',
    sourceUrl: 'https://www.normaltech.ai/p/why-ai-hasnt-replaced-software-engineers',
    terms: [
      define('AI'),
      define('software engineers'),
      define('coding'),
      define('engineer'),
      define('tradeoffs'),
      define('debug'),
      define('systems'),
      define('human judgment'),
    ],
  },
  {
    headline: 'AI is changing outsourcing work',
    badge: 'new',
    summary:
      'Opendoor’s India exit sparked a broader conversation about how AI may change outsourcing. Companies are looking at whether software can handle some tasks that used to go to lower-cost teams abroad. That does not mean every job vanishes, but it does mean the shape of office work can change quickly.',
    whyItMatters:
      'AI may affect not only tech jobs, but also support, operations, and back-office work around the world.',
    sourceName: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/2026/06/10/opendoors-india-exit-is-fueling-a-bigger-conversation-about-ai-and-outsourcing',
    terms: [
      define('AI'),
      define('outsourcing'),
      define('lower-cost teams'),
      define('operations'),
      define('back-office work'),
    ],
  },
  {
    headline: 'A Grok safety lawsuit hits xAI',
    badge: 'new',
    summary:
      'A lawsuit claims xAI fired an engineer who raised alarms about safety problems with Grok. Safety concerns around AI can include harmful answers, weak testing, or pressure to ship before problems are fixed. xAI will have a chance to respond, but the case shows how tense AI safety work can get inside companies.',
    whyItMatters:
      'The people building AI systems may face pressure when they say a product is not ready or safe enough.',
    sourceName: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/2026/06/10/xai-fired-an-engineer-who-raised-alarms-about-grok-safety-new-lawsuit-claims',
    terms: [
      define('xAI'),
      define('engineer'),
      define('Grok'),
      define('AI'),
      define('testing'),
      define('AI safety'),
      define('AI systems'),
    ],
  },
  {
    headline: 'Google releases a faster local AI model',
    badge: 'new',
    summary:
      'Google DeepMind released DiffusionGemma, an open AI model designed to run faster on local devices. Local AI means the model can run on your own computer or phone instead of sending every request to a company server. Faster local models could make private, low-cost AI tools more practical.',
    whyItMatters:
      'More AI features could run directly on your device, which can help with speed, privacy, and cost.',
    sourceName: 'Ars Technica',
    sourceUrl: 'https://arstechnica.com/google/2026/06/googles-latest-diffusiongemma-open-ai-model-comes-with-a-4x-speed-boost',
    terms: [
      define('DeepMind'),
      define('DiffusionGemma'),
      define('open AI model'),
      define('local devices'),
      define('local AI'),
      define('model'),
      define('company server'),
      define('AI'),
      define('privacy'),
    ],
  },
]

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
          <p>Six sourced stories. Beginner summaries. Glossary cards built in.</p>
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
            Six actual AI stories from today’s ingestion run, rewritten in plain English with direct source links. Full automation comes after Supabase approval.
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
