import faiss
import json
import numpy as np
from pathlib import Path
from embedder import Embedder

class Retriever:
    def __init__(self, index_path: str, metadata_path: str, embedder: Embedder):
        self.embedder = embedder
        self.index_path = Path(index_path)
        self.metadata_path = Path(metadata_path)
        self.index = None
        self.metadata = []
        self._load()

    def _load(self):
        if self.index_path.exists() and self.metadata_path.exists():
            self.index = faiss.read_index(str(self.index_path))
            with open(self.metadata_path, 'r', encoding='utf-8') as f:
                self.metadata = json.load(f)

    def search(self, query: str, top_k: int = 5):
        if not self.index or not self.metadata:
            return []
        
        query_vector = np.array([self.embedder.encode([query])[0]]).astype('float32')
        distances, indices = self.index.search(query_vector, top_k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.metadata) and idx != -1:
                meta = self.metadata[idx]
                results.append({
                    "score": float(distances[0][i]),
                    "chunk_id": idx,
                    "paper_id": meta.get("paper_id", ""),
                    "title": meta.get("title", "Unknown"),
                    "authors": meta.get("authors", []),
                    "year": meta.get("year", None),
                    "abstract": meta.get("abstract", ""),
                    "text": meta.get("text", "")
                })
        return results
