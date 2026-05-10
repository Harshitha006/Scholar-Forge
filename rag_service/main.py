from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from retriever import Retriever
from embedder import Embedder
import os

app = FastAPI(title="ScholarForge RAG Service")

DATA_DIR = os.getenv("DATA_DIR", "/data")
INDEX_PATH = os.path.join(DATA_DIR, "indices", "corpus.faiss")
METADATA_PATH = os.path.join(DATA_DIR, "indices", "metadata.json")

embedder = Embedder()
retriever = Retriever(index_path=INDEX_PATH, metadata_path=METADATA_PATH, embedder=embedder)

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

@app.post("/search")
def search_literature(req: SearchRequest):
    try:
        results = retriever.search(req.query, req.top_k)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok", "index_loaded": retriever.index is not None}
