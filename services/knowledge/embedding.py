from typing import List
try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

class LocalEmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        if SentenceTransformer:
            self.model = SentenceTransformer(model_name)
        else:
            self.model = None

    def chunk_text(self, text: str, chunk_size: int = 500) -> List[str]:
        # Simple chunking for demonstration
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size):
            chunks.append(" ".join(words[i:i+chunk_size]))
        return chunks

    def embed(self, text: str) -> List[float]:
        if not self.model:
            return [0.0] * 384
        return self.model.encode(text).tolist()

    def embed_chunks(self, chunks: List[str]) -> List[List[float]]:
        if not self.model:
            return [[0.0] * 384 for _ in chunks]
        return self.model.encode(chunks).tolist()

embedding_service = LocalEmbeddingService()
