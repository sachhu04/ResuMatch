from sentence_transformers import SentenceTransformer
from typing import List, Union
import numpy as np

# Dense Vector Representation Service
# Uses Sentence-Transformers (all-MiniLM-L6-v2) to map resumes and job descriptions
# into a shared 384-dimensional latent semantic space for cosine similarity calculations.
class EmbeddingService:
    # Singleton model cache to avoid re-allocating weights across multiple API calls
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
            # Pretrained on over 1B sentence pairs; produces 384-dimensional embeddings
            cls._model = SentenceTransformer('all-MiniLM-L6-v2')
        return cls._model

    @classmethod
    def get_embedding(cls, text: str) -> np.ndarray:
        """
        Generates embedding for a single string.
        """
        # Guard clause: return zero-vector for empty or whitespace-only inputs
        if not text or not text.strip():
            return np.zeros(384) # MiniLM-L6-v2 uses 384 dimensions
        
        # Encode single text using cached Transformer model instance
        model = cls.get_model()
        return model.encode(text)

    @classmethod
    def get_embeddings(cls, texts: List[str]) -> np.ndarray:
        """
        Generates embeddings for a list of strings.
        """
        # Return empty numpy array if list of texts is empty
        if not texts:
            return np.array([])
        
        # Perform batched vector inference across candidate sentences
        model = cls.get_model()
        return model.encode(texts)

