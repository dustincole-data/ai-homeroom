import type { ReactNode } from 'react'

import { permanentGlossaryTerms } from './content/permanentGlossary'
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

const glossary: Record<string, string> = {
  AI: 'AI, short for artificial intelligence, is software that can do tasks that usually require human thinking, like writing, sorting, or recognizing patterns.',
  'AI detector': 'An AI detector is a tool that looks for clues that something was made by artificial intelligence.',
  'AI-made songs': 'AI-made songs are tracks where software created much or all of the music, lyrics, singing, or sound.',
  'AI safety': 'AI safety is the work of reducing the chance that AI systems cause harm or behave in unwanted ways.',
  'AI systems': 'AI systems are apps or tools that use artificial intelligence to make decisions, write, classify, or take actions.',
  Anthropic: 'Anthropic is the AI company that makes Claude, one of the major chatbot families.',
  'back-office work': 'Back-office work is behind-the-scenes business work like processing forms, support tasks, or operations.',
  chatbot: 'A chatbot is software you talk to by typing or speaking, like texting a very fast assistant.',
  'Claude Fable': 'Claude Fable is a version or test variant of Claude, Anthropic’s AI chatbot.',
  coding: 'Coding means writing instructions that tell software what to do.',
  'company server': 'A company server is a computer owned or rented by a business that handles data or runs software for users.',
  'DeepMind': 'DeepMind is Google’s AI research lab, known for building advanced AI systems.',
  Deezer: 'Deezer is a music streaming service, similar to Spotify or Apple Music.',
  debug: 'To debug means to find and fix what is wrong in software, like tracing where a bad pipe is leaking.',
  DiffusionGemma: 'DiffusionGemma is Google DeepMind’s open AI model that uses a different method for generating answers quickly.',
  engineer: 'An engineer is a worker who designs, builds, tests, or fixes technical systems.',
  Grok: 'Grok is xAI’s chatbot, similar to ChatGPT or Claude.',
  guardrails: 'Guardrails are rules that keep an AI from doing things its makers think are unsafe or unwanted.',
  'hidden rules': 'Hidden rules are instructions inside software that affect what it does but are not clearly shown to users.',
  'human judgment': 'Human judgment means using context, priorities, and common sense instead of only following a pattern.',
  'invisible guardrails': 'Invisible guardrails are AI safety rules that affect answers without clearly telling the user what happened.',
  'local AI': 'Local AI runs on your own device instead of depending completely on a remote server.',
  'local devices': 'Local devices are the computers, phones, or tablets you personally use instead of machines in a data center.',
  'lower-cost teams': 'Lower-cost teams are groups hired in places where wages or business costs are cheaper for the company.',
  model: 'A model is the trained AI system that makes predictions or writes answers, like the “brain” behind a chatbot.',
  'open AI model': 'An open AI model is an AI system that outside developers can download, inspect, or build on more freely than a closed product.',
  'open model': 'An open model is an AI model that outside developers can inspect, download, or build on more freely than a closed product.',
  operations: 'Operations are the everyday tasks that keep a business running, such as support, scheduling, billing, or process work.',
  outsourcing: 'Outsourcing means hiring another company or team, often in another place, to do work for your business.',
  platforms: 'Platforms are services or systems that many people or companies build on or use, like app stores, social networks, or streaming apps.',
  privacy: 'Privacy means keeping personal data or activity from being seen, shared, or used without a good reason.',
  'remote server': 'A remote server is a powerful computer somewhere else that your device connects to over the internet.',
  'software engineers': 'Software engineers are people who design, build, test, and maintain software.',
  'streaming services': 'Streaming services are apps or websites that play media from the internet instead of storing it all on your device.',
  systems: 'Systems are connected pieces of software, hardware, people, or rules that work together.',
  testing: 'Testing means checking software to see whether it works correctly before people rely on it.',
  tool: 'A tool is software or hardware made to help someone do a specific job.',
  tradeoffs: 'Tradeoffs are the choices you make when improving one thing means giving up something else.',
  xAI: 'xAI is Elon Musk’s artificial intelligence company, which makes the Grok chatbot.',
}

const define = (term: string): Term => ({ term, definition: glossary[term] })

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

function storyTermsWithPermanentTerms(storyTerms: Term[]) {
  return Array.from(
    new Map(
      [...storyTerms, ...permanentGlossaryTerms].map((term) => [term.term.toLowerCase(), term]),
    ).values(),
  )
}

function markTerms(summary: string, terms: Term[]) {
  let pieces: (string | ReactNode)[] = [summary]

  terms
    .slice()
    .sort((a, b) => b.term.length - a.term.length)
    .forEach((term) => {
      const regex = new RegExp(`(?<![A-Za-z0-9])(${escapeRegExp(term.term)})(?![A-Za-z0-9])`, 'gi')
      pieces = pieces.flatMap((piece, index) => {
        if (typeof piece !== 'string') return [piece]
        return piece.split(regex).map((part, partIndex) => {
          if (part.toLowerCase() !== term.term.toLowerCase()) return part
          return (
            <a
              className="term"
              href={`#${glossaryTermId(term.term)}`}
              data-definition={term.definition}
              key={`${term.term}-${index}-${partIndex}`}
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
