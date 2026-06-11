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
      {
        term: 'guardrails',
        definition: 'Guardrails are rules that keep an AI from doing things its makers think are unsafe or unwanted.',
      },
      {
        term: 'model',
        definition: 'A model is the trained AI system that makes predictions or writes answers, like the “brain” behind a chatbot.',
      },
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
      {
        term: 'AI detector',
        definition: 'An AI detector is a tool that looks for clues that something was made by artificial intelligence.',
      },
      {
        term: 'streaming service',
        definition: 'A streaming service is an app or website that plays media from the internet instead of storing it on your device.',
      },
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
      {
        term: 'debug',
        definition: 'To debug means to find and fix what is wrong in software, like tracing where a bad pipe is leaking.',
      },
      {
        term: 'human judgment',
        definition: 'Human judgment means using context, priorities, and common sense instead of only following a pattern.',
      },
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
      {
        term: 'outsourcing',
        definition: 'Outsourcing means hiring another company or team, often in another place, to do work for your business.',
      },
      {
        term: 'back-office work',
        definition: 'Back-office work is behind-the-scenes business work like processing forms, support tasks, or operations.',
      },
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
      {
        term: 'Grok',
        definition: 'Grok is xAI’s chatbot, similar to ChatGPT or Claude.',
      },
      {
        term: 'AI safety',
        definition: 'AI safety is the work of reducing the chance that AI systems cause harm or behave in unwanted ways.',
      },
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
      {
        term: 'local AI',
        definition: 'Local AI runs on your own device instead of depending completely on a remote server.',
      },
      {
        term: 'open model',
        definition: 'An open model is an AI model that outside developers can inspect, download, or build on more freely than a closed product.',
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
          <strong>Real daily news loaded</strong>
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
            Six actual AI stories from today’s ingestion run, rewritten in plain English with direct source links. Full automation comes after Supabase approval.
          </p>
        </div>

        <div className="story-list">
          {stories.map((story) => (
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
          {stories.flatMap((story) => story.terms).map((term) => (
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
