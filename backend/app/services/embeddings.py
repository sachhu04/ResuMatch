from sentence_transformers import SentenceTransformer
from typing import List, Union
import numpy as np

class EmbeddingService:
    _model = None

    @classmethod
    def get_model(cls) -> SentenceTransformer:
        """
        Lazy-loads the SentenceTransformer model to avoid blocking start-up
        and wasting memory if not used immediately.
        Using a lightweight model to ensure it runs easily locally.
        """
        if cls._model is None:
            # all-MiniLM-L6-v2 is fast and small, yet effective for semantic matching
            cls._model = SentenceTransformer('all-MiniLM-L6-v2')
        return cls._model

    @classmethod
    def get_embedding(cls, text: str) -> np.ndarray:
        """
        Generates embedding for a single string.
        """
        if not text or not text.strip():
            return np.zeros(384) # MiniLM-L6-v2 uses 384 dimensions
        model = cls.get_model()
        return model.encode(text)

    @classmethod
    def get_embeddings(cls, texts: List[str]) -> np.ndarray:
        """
        Generates embeddings for a list of strings.
        """
        if not texts:
            return np.array([])
        model = cls.get_model()
        return model.encode(texts)
