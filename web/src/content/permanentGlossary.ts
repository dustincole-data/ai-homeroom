export type PermanentGlossaryTerm = {
  term: string
  definition: string
  aliases?: string[]
}

// Durable glossary shelf for AI Homeroom.
// Everything shown here is permanent. When adding new terms, first check for
// duplicates, plural-only variants, shorthand-only variants, and too-similar
// concepts that should be folded into one stronger definition.
export const permanentGlossaryTerms: PermanentGlossaryTerm[] = [
  {
    term: 'Agentic AI',
    aliases: ['agentic AI'],
    definition:
      'Agentic AI is AI that can work through steps toward a goal, such as planning, using tools, checking results, and deciding what to do next.',
  },
  {
    term: 'AI Agent',
    aliases: ['agent', 'agents'],
    definition:
      'An AI agent is an AI system that can take steps toward a goal, usually by using tools and checking what happened before deciding what to do next.',
  },
  {
    term: 'AI Detector',
    aliases: ['AI detector'],
    definition:
      'An AI detector is a tool that looks for clues that something was made by artificial intelligence.',
  },
  {
    term: 'AI-Generated Music',
    aliases: ['AI-made songs', 'AI-generated music'],
    definition:
      'AI-generated music is music where software created much or all of the music, lyrics, singing, or sound.',
  },
  {
    term: 'AI Safety',
    aliases: ['AI safety'],
    definition:
      'AI safety is the work of reducing the chance that AI systems cause harm or behave in unwanted ways.',
  },
  {
    term: 'Anthropic',
    aliases: ['Anthropic'],
    definition:
      'Anthropic is the AI company that makes Claude, one of the major chatbot families.',
  },
  {
    term: 'Algorithm',
    aliases: ['algorithm'],
    definition:
      'An algorithm is a set of instructions or rules software follows to solve a problem or make a decision.',
  },
  {
    term: 'API',
    aliases: ['API', 'APIs'],
    definition:
      'An API is a doorway that lets one piece of software call, send data to, or use another piece of software.',
  },
  {
    term: 'Artificial Intelligence (AI)',
    aliases: ['AI', 'artificial intelligence', 'AI system', 'AI systems', 'Gen AI', 'generative AI'],
    definition:
      'Artificial intelligence, or AI, is software that can do tasks that usually require human thinking, like writing, sorting, finding patterns, generating content, or making predictions.',
  },
  {
    term: 'Automation',
    aliases: ['automation'],
    definition:
      'Automation means using software to handle repeatable steps with less human clicking.',
  },
  {
    term: 'Back-Office Work',
    aliases: ['back-office work'],
    definition:
      'Back-office work is behind-the-scenes business work like processing forms, support tasks, operations, scheduling, or billing.',
  },
  {
    term: 'Chatbot',
    aliases: ['chatbot'],
    definition:
      'A chatbot is the interface you type or talk into. It is usually the steering wheel, not the whole AI system.',
  },
  {
    term: 'Claude Fable',
    aliases: ['Claude Fable'],
    definition:
      'Claude Fable is a version or test variant of Claude, Anthropic’s AI chatbot.',
  },
  {
    term: 'Coding',
    aliases: ['coding'],
    definition:
      'Coding means writing instructions that tell software what to do.',
  },
  {
    term: 'Coding Agent',
    aliases: ['coding agent', 'coding agents'],
    definition:
      'A coding agent is an AI agent that can work inside codebases to read files, edit code, run commands, test changes, and sometimes open pull requests.',
  },
  {
    term: 'Company Server',
    aliases: ['company server'],
    definition:
      'A company server is a computer owned or rented by a business that handles data or runs software for users.',
  },
  {
    term: 'Context Window',
    aliases: ['context', 'context window', 'context windows'],
    definition:
      'A context window is the amount of text or information an AI model can keep in mind at one time, including your prompt, chat history, files, search results, or connected data.',
  },
  {
    term: 'Debugging',
    aliases: ['debug', 'debugging'],
    definition:
      'Debugging means finding and fixing what is wrong in software, like tracing where a bad pipe is leaking.',
  },
  {
    term: 'Deep Learning',
    aliases: ['deep learning'],
    definition:
      'Deep learning is a type of machine learning that uses layered neural networks to learn patterns in complex data like language, images, audio, and code.',
  },
  {
    term: 'DeepMind',
    aliases: ['DeepMind'],
    definition:
      'DeepMind is Google’s AI research lab, known for building advanced AI systems.',
  },
  {
    term: 'Deezer',
    aliases: ['Deezer'],
    definition:
      'Deezer is a music streaming service, similar to Spotify or Apple Music.',
  },
  {
    term: 'DiffusionGemma',
    aliases: ['DiffusionGemma'],
    definition:
      'DiffusionGemma is Google DeepMind’s open AI model that uses a different method for generating answers quickly.',
  },
  {
    term: 'Embedding',
    aliases: ['embedding', 'embeddings'],
    definition:
      'An embedding is a set of numbers that represents meaning, so computers can compare ideas instead of only matching exact words.',
  },
  {
    term: 'Engineer',
    aliases: ['engineer'],
    definition:
      'An engineer is a worker who designs, builds, tests, or fixes technical systems.',
  },
  {
    term: 'Fine-Tuning',
    aliases: ['fine-tuning'],
    definition:
      'Fine-tuning is extra training that changes how a model behaves for a specific style, format, task, or pattern.',
  },
  {
    term: 'GPU',
    aliases: ['GPU', 'GPUs'],
    definition:
      'A GPU is a specialized computer chip that is very good at the kind of math modern AI needs.',
  },
  {
    term: 'Grok',
    aliases: ['Grok'],
    definition:
      'Grok is xAI’s chatbot, similar to ChatGPT or Claude.',
  },
  {
    term: 'Guardrails',
    aliases: ['guardrails', 'invisible guardrails'],
    definition:
      'Guardrails are rules or limits meant to keep an AI system from doing things its makers think are unsafe, unwanted, or off-limits.',
  },
  {
    term: 'Hallucination',
    aliases: ['hallucination', 'hallucinations'],
    definition:
      'A hallucination is a confident AI answer that sounds real but is wrong, unsupported, or made up.',
  },
  {
    term: 'Hidden Rules',
    aliases: ['hidden rules'],
    definition:
      'Hidden rules are instructions inside software that affect what it does but are not clearly shown to users.',
  },
  {
    term: 'Human Judgment',
    aliases: ['human judgment'],
    definition:
      'Human judgment means using context, priorities, and common sense instead of only following a pattern.',
  },
  {
    term: 'Image Recognition',
    aliases: ['image recognition', 'image recognition AI'],
    definition:
      'Image recognition is AI that looks at a picture and identifies what is in it, such as objects, faces, text, scenes, or patterns.',
  },
  {
    term: 'Inference',
    aliases: ['inference'],
    definition:
      'Inference is the moment a trained model is being used to answer, predict, classify, write, or generate something.',
  },
  {
    term: 'Keyword Search',
    aliases: ['keyword search'],
    definition:
      'Keyword search finds exact or close word matches instead of searching by meaning.',
  },
  {
    term: 'Large Language Model (LLM)',
    aliases: ['large language model', 'large language models', 'LLM', 'LLMs'],
    definition:
      'A large language model, or LLM, is an AI model trained on huge amounts of text so it can read, write, summarize, classify, translate, code, or reason through language tasks.',
  },
  {
    term: 'Local AI',
    aliases: ['local AI'],
    definition:
      'Local AI runs on your own device instead of depending completely on a remote server.',
  },
  {
    term: 'Local Device',
    aliases: ['local device', 'local devices'],
    definition:
      'A local device is the computer, phone, or tablet you personally use instead of a machine in a data center.',
  },
  {
    term: 'Lower-Cost Team',
    aliases: ['lower-cost team', 'lower-cost teams'],
    definition:
      'A lower-cost team is a group hired in a place where wages or business costs are cheaper for the company.',
  },
  {
    term: 'Machine Learning',
    aliases: ['machine learning'],
    definition:
      'Machine learning is AI that learns patterns from data instead of relying on a person to write every rule by hand.',
  },
  {
    term: 'Memory',
    aliases: ['memory'],
    definition:
      'Memory is information an AI system saves or retrieves across interactions so it can use past context later.',
  },
  {
    term: 'Model',
    aliases: ['model'],
    definition:
      'A model is the trained AI system that makes predictions or writes answers, like the engine behind a chatbot.',
  },
  {
    term: 'Model Context Protocol (MCP)',
    aliases: ['Model Context Protocol', 'MCP', 'MCPs'],
    definition:
      'Model Context Protocol, or MCP, is a standard way for AI assistants to connect to tools, files, apps, and data sources.',
  },
  {
    term: 'Model Weights',
    aliases: ['model weights'],
    definition:
      'Model weights are the learned settings inside a model. Think of them like millions or billions of tiny knobs adjusted during training.',
  },
  {
    term: 'Multimodal AI',
    aliases: ['multimodal AI'],
    definition:
      'Multimodal AI can work with more than text, such as images, audio, video, screenshots, PDFs, charts, code, and voice.',
  },
  {
    term: 'Neural Network',
    aliases: ['neural network', 'neural networks'],
    definition:
      'A neural network is a pattern-learning system loosely inspired by the brain, but it is math, not a tiny digital human.',
  },
  {
    term: 'Open Model',
    aliases: ['open model', 'open AI model', 'open-weight model'],
    definition:
      'An open model is an AI model whose learned settings or design are released so other people can download, run, inspect, or build on it more freely than a closed product.',
  },
  {
    term: 'Operations',
    aliases: ['operations'],
    definition:
      'Operations are the everyday tasks that keep a business running, such as support, scheduling, billing, or process work.',
  },
  {
    term: 'Outsourcing',
    aliases: ['outsourcing'],
    definition:
      'Outsourcing means hiring another company or team, often in another place, to do work for your business.',
  },
  {
    term: 'Platform',
    aliases: ['platform', 'platforms'],
    definition:
      'A platform is a service or system that many people or companies build on or use, like an app store, social network, or streaming app.',
  },
  {
    term: 'Privacy',
    aliases: ['privacy'],
    definition:
      'Privacy means keeping personal data or activity from being seen, shared, or used without a good reason.',
  },
  {
    term: 'Prompt',
    aliases: ['prompt'],
    definition:
      'A prompt is the instruction, question, file, text, or messy brain dump you give an AI system.',
  },
  {
    term: 'Prompt Engineering',
    aliases: ['prompt engineering'],
    definition:
      'Prompt engineering means giving AI clearer instructions, context, examples, and constraints so it produces a better result.',
  },
  {
    term: 'Remote Server',
    aliases: ['remote server'],
    definition:
      'A remote server is a powerful computer somewhere else that your device connects to over the internet.',
  },
  {
    term: 'Retrieval-Augmented Generation (RAG)',
    aliases: ['RAG', 'Retrieval-Augmented Generation'],
    definition:
      'Retrieval-Augmented Generation, or RAG, is a setup where AI searches trusted documents first, then answers with that information in front of it.',
  },
  {
    term: 'Skill',
    aliases: ['skill', 'skills'],
    definition:
      'A skill is a reusable playbook that tells an AI agent how to do a kind of work, what tone to use, what steps to follow, and what mistakes to avoid.',
  },
  {
    term: 'Software Engineer',
    aliases: ['software engineer', 'software engineers'],
    definition:
      'A software engineer is a person who designs, builds, tests, and maintains software.',
  },
  {
    term: 'Speech-to-Text',
    aliases: ['speech to text', 'speech-to-text', 'speech recognition', 'voice recognition'],
    definition:
      'Speech-to-text is AI that turns spoken words from audio into written text, such as captions, transcripts, or searchable notes.',
  },
  {
    term: 'Streaming Service',
    aliases: ['streaming service', 'streaming services'],
    definition:
      'A streaming service is an app or website that plays media from the internet instead of storing it all on your device.',
  },
  {
    term: 'Supervised Learning',
    aliases: ['supervised learning'],
    definition:
      'Supervised learning is machine learning where examples come with labels or answers the model can learn from.',
  },
  {
    term: 'Synthetic Data',
    aliases: ['synthetic data'],
    definition:
      'Synthetic data is artificial example data created by software, simulations, or AI instead of collected directly from the real world.',
  },
  {
    term: 'System',
    aliases: ['system', 'systems'],
    definition:
      'A system is a set of connected software, hardware, people, or rules that work together.',
  },
  {
    term: 'Testing',
    aliases: ['testing'],
    definition:
      'Testing means checking software to see whether it works correctly before people rely on it.',
  },
  {
    term: 'Token',
    aliases: ['token', 'tokens'],
    definition:
      'A token is a small chunk of text an AI model reads or writes. It can be a word, part of a word, a number, or punctuation.',
  },
  {
    term: 'Tool',
    aliases: ['tool', 'tools'],
    definition:
      'A tool is software or hardware made to help someone do a specific job, including abilities an AI system can use outside the chatbox.',
  },
  {
    term: 'Tradeoff',
    aliases: ['tradeoff', 'tradeoffs'],
    definition:
      'A tradeoff is a choice where improving one thing means giving up something else.',
  },
  {
    term: 'Training Data',
    aliases: ['training data'],
    definition:
      'Training data is the collection of examples used to teach a model patterns.',
  },
  {
    term: 'Transformer',
    aliases: ['transformer', 'transformers'],
    definition:
      'A transformer is the design behind modern LLMs. It helps models pay attention to relationships between words, ideas, and context.',
  },
  {
    term: 'Unsupervised Learning',
    aliases: ['unsupervised learning'],
    definition:
      'Unsupervised learning is machine learning where the model looks for patterns without being given labeled answers for every example.',
  },
  {
    term: 'Validation',
    aliases: ['validation'],
    definition:
      'Validation means checking an AI answer against sources, files, logs, tests, or other evidence before trusting it.',
  },
  {
    term: 'Vector Database',
    aliases: ['vector database'],
    definition:
      'A vector database stores embeddings so software can search by meaning instead of only exact words.',
  },
  {
    term: 'Vector Search',
    aliases: ['vector search'],
    definition:
      'Vector search finds related meaning by comparing embeddings instead of only matching exact words.',
  },
  {
    term: 'xAI',
    aliases: ['xAI'],
    definition:
      'xAI is Elon Musk’s artificial intelligence company, which makes the Grok chatbot.',
  },
]
