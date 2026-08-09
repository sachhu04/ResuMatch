from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class SimilarityService:
    @staticmethod
    def calculate_tfidf_similarity(text1: str, text2: str) -> float:
        """
        Calculates lexical similarity using TF-IDF baseline.
        Stop words are removed explicitly via stop_words='english'.
        """
        if not text1.strip() or not text2.strip():
            return 0.0

        # Custom token pattern to preserve technical terms like C++, C#, .NET
        vectorizer = TfidfVectorizer(
            stop_words='english',
            token_pattern=r"(?u)\b\w[\w.#+-]*\b"
        )
        try:
            tfidf_matrix = vectorizer.fit_transform([text1, text2])
            # cosine_similarity returns a matrix, we want the similarity between doc 0 and doc 1
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(sim)
        except ValueError:
            # E.g. if text only contained stop words
            return 0.0

    @staticmethod
    def calculate_embedding_similarity(emb1: np.ndarray, emb2: np.ndarray) -> float:
        """
        Calculates cosine similarity between two transformer embeddings.
        """
        if emb1.size == 0 or emb2.size == 0:
            return 0.0
            
        # Ensure 2D arrays for sklearn cosine_similarity
        if emb1.ndim == 1:
            emb1 = emb1.reshape(1, -1)
        if emb2.ndim == 1:
            emb2 = emb2.reshape(1, -1)
            
        sim = cosine_similarity(emb1, emb2)[0][0]
        # NLP Heuristic: We apply a non-linear scaling (square root) as a monotonic 
        # score calibration. This is intended to expand the narrow range of raw semantic 
        # similarities and improve the interpretability of the scoring scale for humans. 
        # It does NOT correct vector magnitude, as cosine similarity already normalizes magnitude.
        scaled_sim = sim ** 0.5 if sim > 0 else 0.0
        
        return float(max(0.0, min(1.0, scaled_sim)))

    @staticmethod
    def section_level_match(resume_sections: dict, jd_text: str, jd_embedding: np.ndarray, get_embedding_func, get_embeddings_func=None) -> dict:
        """
        Matches individual resume sections to the whole JD (or specific JD sections if extracted)
        using both lexical and semantic methods.
        For semantic matching, the JD is chunked into sentences to avoid asymmetrical matching.
        """
        import re
        results = {}
        
        # Split JD into sentences for chunk-based semantic matching
        jd_sentences = [s.strip() for s in re.split(r'[\n\.\•\-\*]', jd_text) if len(s.strip()) > 10]
        if not jd_sentences:
            jd_sentences = [jd_text.strip()]
            
        jd_sentence_embs = get_embeddings_func(jd_sentences) if get_embeddings_func else get_embedding_func(jd_sentences)
        
        for section_name, section_content in resume_sections.items():
            if not section_content.strip():
                continue
                
            # Lexical (still using whole JD for lexical as TF-IDF handles term frequency well)
            tfidf_score = SimilarityService.calculate_tfidf_similarity(section_content, jd_text)
            
            # Semantic (chunk-based)
            section_emb = get_embedding_func(section_content)
            
            if section_emb.ndim == 1:
                section_emb = section_emb.reshape(1, -1)
                
            similarities = cosine_similarity(section_emb, jd_sentence_embs)[0]
            
            # Aggregate the strongest matches (mean of top 3)
            k = min(3, len(similarities))
            top_k_sims = np.sort(similarities)[-k:]
            mean_top_k_sim = float(np.mean(top_k_sims))
            
            # Apply our monotonic scaling heuristic
            scaled_sim = mean_top_k_sim ** 0.5 if mean_top_k_sim > 0 else 0.0
            semantic_score = float(max(0.0, min(1.0, scaled_sim)))
            
            results[section_name] = {
                "tfidf_score": round(tfidf_score * 100, 2),
                "semantic_score": round(semantic_score * 100, 2)
            }
            
        return results
