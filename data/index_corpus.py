import os
import faiss
import json
import numpy as np
import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).parent.parent
DATA_DIR = ROOT_DIR / "data"
CORPUS_DIR = DATA_DIR / "corpus"
INDICES_DIR = DATA_DIR / "indices"

CORPUS_DIR.mkdir(parents=True, exist_ok=True)
INDICES_DIR.mkdir(parents=True, exist_ok=True)

INDEX_PATH = INDICES_DIR / "corpus.faiss"
METADATA_PATH = INDICES_DIR / "metadata.json"

CHUNK_SIZE = 600
CHUNK_OVERLAP = 100

def extract_text_from_pdf(pdf_path: Path):
    text = ""
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text += page.get_text()
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
    return text

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP):
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def build_index():
    print("Loading embedding model...")
    embedder = SentenceTransformer('all-MiniLM-L6-v2')
    
    metadata_list = []
    texts_to_embed = []
    
    pdf_files = list(CORPUS_DIR.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDFs found in {CORPUS_DIR}. Please add PDFs and run again.")
        return

    print(f"Found {len(pdf_files)} PDFs. Processing...")
    
    for pdf_path in pdf_files:
        print(f"Processing {pdf_path.name}...")
        text = extract_text_from_pdf(pdf_path)
        chunks = chunk_text(text)
        
        for i, chunk in enumerate(chunks):
            texts_to_embed.append(chunk)
            metadata_list.append({
                "paper_id": pdf_path.stem,
                "title": pdf_path.stem.replace("_", " ").title(),
                "authors": ["Unknown"],
                "year": 2024,
                "abstract": "Abstract not available for " + pdf_path.stem,
                "text": chunk,
                "chunk_index": i
            })

    print(f"Embedding {len(texts_to_embed)} chunks...")
    embeddings = embedder.encode(texts_to_embed)
    
    # Create FAISS index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    
    print("Building FAISS index...")
    index.add(np.array(embeddings).astype('float32'))
    
    faiss.write_index(index, str(INDEX_PATH))
    
    with open(METADATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(metadata_list, f, indent=2)
        
    print(f"Index built successfully! Saved to {INDEX_PATH}")
    print(f"Metadata saved to {METADATA_PATH}")

if __name__ == "__main__":
    build_index()
