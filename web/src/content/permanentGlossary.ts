export type PermanentGlossaryTerm = {
  term: string
  definition: string
}

// Durable glossary shelf for AI Homeroom.
// Add terms here when Dustin wants a glossary item to stay forever.
// Daily/story-specific terms can change; these terms are always shown.
export const permanentGlossaryTerms: PermanentGlossaryTerm[] = [
  {
    term: 'Agentic AI',
    definition:
      'Agentic AI is AI that can work through steps toward a goal, such as planning, using tools, checking results, and deciding what to do next.',
  },
  {
    term: 'MCP',
    definition:
      'MCP, short for Model Context Protocol, is a standard way for AI assistants to connect to tools, files, apps, and data sources.',
  },
  {
    term: 'Token',
    definition:
      'A token is a small piece of text an AI model reads or writes. Long prompts and long answers use more tokens.',
  },
  {
    term: 'Context window',
    definition:
      'A context window is the amount of text an AI model can keep in mind at one time while answering.',
  },
]
