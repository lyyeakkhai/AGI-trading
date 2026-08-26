from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from packages.database.models.base import Base

class KnowledgeEmbeddingModel(Base):
    __tablename__ = "trading_knowledge_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String, index=True, nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(384))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
