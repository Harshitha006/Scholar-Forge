// Local memory-based vector store for RAG
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { embeddings } from "./embeddings";
import { Document } from "@langchain/core/documents";
import { seedMockCorpus } from "./seed";

let vectorStore: MemoryVectorStore | null = null;

export async function getVectorStore() {
  if (!vectorStore) {
    // In a real app, we would load this from disk or a persistent DB
    // For the skeleton, we'll initialize an empty memory store
    vectorStore = new MemoryVectorStore(embeddings);
    await seedMockCorpus();
  }
  return vectorStore;
}

export async function addDocumentsToStore(docs: Document[]) {
  const store = await getVectorStore();
  await store.addDocuments(docs);
}

export async function searchCorpus(query: string, k: number = 5) {
  const store = await getVectorStore();
  const results = await store.similaritySearch(query, k);
  return results;
}
