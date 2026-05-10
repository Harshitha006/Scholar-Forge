import { OllamaEmbeddings } from "@langchain/ollama";

export const embeddings = new OllamaEmbeddings({
  model: "all-minilm", // Default embedding model in Ollama
  baseUrl: "http://localhost:11434",
});
