export type PermanentGlossaryTerm = {
  term: string
  definition: string
}

// Durable glossary shelf for AI Homeroom.
// Add terms here when Dustin wants a glossary item to stay forever.
// Daily/story-specific terms can change; these terms are always shown.
export const permanentGlossaryTerms: PermanentGlossaryTerm[] = [
  {
    term: 'AI',
    definition:
      'AI, short for artificial intelligence, is software that can do tasks that usually require human thinking, like writing, sorting, finding patterns, or making predictions.',
  },
  {
    term: 'Artificial intelligence',
    definition:
      'Artificial intelligence is the broader category of software that can do tasks that seem to require human thinking.',
  },
  {
    term: 'AI systems',
    definition:
      'AI systems are apps, models, tools, or workflows that use artificial intelligence to make predictions, generate content, classify information, or take actions.',
  },
  {
    term: 'Agentic AI',
    definition:
      'Agentic AI is AI that can work through steps toward a goal, such as planning, using tools, checking results, and deciding what to do next.',
  },
  {
    term: 'Agents',
    definition:
      'Agents are AI systems that can take steps toward a goal, usually by using tools and checking what happened before deciding what to do next.',
  },
  {
    term: 'Algorithm',
    definition:
      'An algorithm is a set of instructions or rules software follows to solve a problem or make a decision.',
  },
  {
    term: 'APIs',
    definition:
      'APIs are doorways that let one piece of software call, send data to, or use another piece of software.',
  },
  {
    term: 'Automation',
    definition:
      'Automation means using software to handle repeatable steps with less human clicking.',
  },
  {
    term: 'Chatbot',
    definition:
      'A chatbot is the interface you type or talk into. It is usually the steering wheel, not the whole AI system.',
  },
  {
    term: 'Coding agents',
    definition:
      'Coding agents are AI agents that can work inside codebases to read files, edit code, run commands, test changes, and sometimes open pull requests.',
  },
  {
    term: 'Context',
    definition:
      'Context is the information an AI can see while it is answering, such as your prompt, chat history, files, search results, or connected data.',
  },
  {
    term: 'Context window',
    definition:
      'A context window is the amount of text or information an AI model can keep in mind at one time while answering.',
  },
  {
    term: 'Context windows',
    definition:
      'Context windows are the limits on how much information an AI model can see at one time.',
  },
  {
    term: 'Deep learning',
    definition:
      'Deep learning is a type of machine learning that uses layered neural networks to learn patterns in complex data like language, images, audio, and code.',
  },
  {
    term: 'Embeddings',
    definition:
      'Embeddings are numbers that represent meaning, so computers can compare ideas instead of only matching exact words.',
  },
  {
    term: 'Fine-tuning',
    definition:
      'Fine-tuning is extra training that changes how a model behaves for a specific style, format, task, or pattern.',
  },
  {
    term: 'Generative AI',
    definition:
      'Generative AI is AI that makes new content, such as text, images, code, music, video, summaries, or voices.',
  },
  {
    term: 'Gen AI',
    definition:
      'Gen AI is shorthand for generative AI, the category of AI that creates new content.',
  },
  {
    term: 'GPUs',
    definition:
      'GPUs are specialized computer chips that are very good at the kind of math modern AI needs.',
  },
  {
    term: 'Guardrails',
    definition:
      'Guardrails are rules or limits meant to keep an AI system from doing things its makers think are unsafe, unwanted, or off-limits.',
  },
  {
    term: 'Hallucinations',
    definition:
      'Hallucinations are confident AI answers that sound real but are wrong, unsupported, or made up.',
  },
  {
    term: 'Inference',
    definition:
      'Inference is the moment a trained model is being used to answer, predict, classify, write, or generate something.',
  },
  {
    term: 'Keyword search',
    definition:
      'Keyword search finds exact or close word matches instead of searching by meaning.',
  },
  {
    term: 'Large language model',
    definition:
      'A large language model is an AI model trained on huge amounts of text so it can work with language.',
  },
  {
    term: 'Large language models',
    definition:
      'Large language models are AI models trained to work with language. GPT, Claude, Gemini, and Llama are examples.',
  },
  {
    term: 'LLM',
    definition:
      'LLM stands for large language model, an AI model trained to read, write, summarize, classify, translate, code, or reason through language tasks.',
  },
  {
    term: 'LLMs',
    definition:
      'LLMs are large language models. They are one type of AI model, not all of AI.',
  },
  {
    term: 'Machine learning',
    definition:
      'Machine learning is AI that learns patterns from data instead of relying on a person to write every rule by hand.',
  },
  {
    term: 'MCP',
    definition:
      'MCP, short for Model Context Protocol, is a standard way for AI assistants to connect to tools, files, apps, and data sources.',
  },
  {
    term: 'MCPs',
    definition:
      'MCPs are Model Context Protocol connections that help AI apps and agents connect to tools and data in a more standard way.',
  },
  {
    term: 'Memory',
    definition:
      'Memory is information an AI system saves or retrieves across interactions so it can use past context later.',
  },
  {
    term: 'Model',
    definition:
      'A model is the trained AI system that makes predictions or writes answers, like the engine behind a chatbot.',
  },
  {
    term: 'Model Context Protocol',
    definition:
      'Model Context Protocol is a newer standard for connecting AI apps and agents to tools, files, apps, and data sources.',
  },
  {
    term: 'Model weights',
    definition:
      'Model weights are the learned settings inside a model. Think of them like millions or billions of tiny knobs adjusted during training.',
  },
  {
    term: 'Multimodal AI',
    definition:
      'Multimodal AI can work with more than text, such as images, audio, video, screenshots, PDFs, charts, code, and voice.',
  },
  {
    term: 'Neural network',
    definition:
      'A neural network is a pattern-learning system loosely inspired by the brain, but it is math, not a tiny digital human.',
  },
  {
    term: 'Neural networks',
    definition:
      'Neural networks are systems loosely inspired by the brain that learn patterns from data.',
  },
  {
    term: 'Open-weight model',
    definition:
      'An open-weight model is an AI model whose learned settings are released so other people can download, run, or build on it more freely.',
  },
  {
    term: 'Prompt',
    definition:
      'A prompt is the instruction, question, file, text, or messy brain dump you give an AI system.',
  },
  {
    term: 'Prompt engineering',
    definition:
      'Prompt engineering means giving AI clearer instructions, context, examples, and constraints so it produces a better result.',
  },
  {
    term: 'RAG',
    definition:
      'RAG, short for Retrieval-Augmented Generation, is a setup where AI searches trusted documents first, then answers with that information in front of it.',
  },
  {
    term: 'Retrieval-Augmented Generation',
    definition:
      'Retrieval-Augmented Generation is the full name for RAG, where AI retrieves relevant information before generating an answer.',
  },
  {
    term: 'Skills',
    definition:
      'Skills are reusable playbooks that tell an AI agent how to do a kind of work, what tone to use, what steps to follow, and what mistakes to avoid.',
  },
  {
    term: 'Supervised learning',
    definition:
      'Supervised learning is machine learning where examples come with labels or answers the model can learn from.',
  },
  {
    term: 'Synthetic data',
    definition:
      'Synthetic data is artificial example data created by software, simulations, or AI instead of collected directly from the real world.',
  },
  {
    term: 'Token',
    definition:
      'A token is a small piece of text an AI model reads or writes. Long prompts and long answers use more tokens.',
  },
  {
    term: 'Tokens',
    definition:
      'Tokens are the chunks of text an AI model reads and writes. A token can be a word, part of a word, a number, or punctuation.',
  },
  {
    term: 'Tools',
    definition:
      'Tools are abilities an AI system can use outside the chatbox, such as web search, a browser, a code runner, a file reader, email, GitHub, or a database.',
  },
  {
    term: 'Training data',
    definition:
      'Training data is the collection of examples used to teach a model patterns.',
  },
  {
    term: 'Transformers',
    definition:
      'Transformers are the design behind modern LLMs. They help models pay attention to relationships between words, ideas, and context.',
  },
  {
    term: 'Unsupervised learning',
    definition:
      'Unsupervised learning is machine learning where the model looks for patterns without being given labeled answers for every example.',
  },
  {
    term: 'Validation',
    definition:
      'Validation means checking an AI answer against sources, files, logs, tests, or other evidence before trusting it.',
  },
  {
    term: 'Vector database',
    definition:
      'A vector database stores embeddings so software can search by meaning instead of only exact words.',
  },
  {
    term: 'Vector search',
    definition:
      'Vector search finds related meaning by comparing embeddings instead of only matching exact words.',
  },
]
