import { Document } from "@langchain/core/documents";
import { addDocumentsToStore } from "./vectorStore";

const MOCK_PAPERS = [
  {
    id: "vaswani2017",
    title: "Attention Is All You Need",
    authors: ["Vaswani et al."],
    year: 2017,
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...",
    content: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely."
  },
  {
    id: "devlin2018",
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: ["Devlin et al."],
    year: 2018,
    abstract: "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers...",
    content: "Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks."
  },
  {
    id: "brown2020",
    title: "Generative Pre-trained Transformer 3 (GPT-3)",
    authors: ["Brown et al."],
    year: 2020,
    abstract: "We train GPT-3, an autoregressive language model with 175 billion parameters...",
    content: "Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of tens or hundreds of thousands of examples. Here we show that scaling up language models greatly improves task-agnostic, few-shot performance."
  }
];

export async function seedMockCorpus() {
  const docs = MOCK_PAPERS.map(paper => new Document({
    pageContent: `${paper.title}. ${paper.abstract} ${paper.content}`,
    metadata: {
      id: paper.id,
      title: paper.title,
      authors: paper.authors,
      year: paper.year,
    }
  }));

  await addDocumentsToStore(docs);
  console.log(`Seeded ${docs.length} mock papers into vector store.`);
}
