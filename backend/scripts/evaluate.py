import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.similarity import SimilarityService
from app.services.embeddings import EmbeddingService

def run_evaluation():
    print("Running NLP Evaluation: Synthetic Benchmark (TF-IDF vs Transformer Embeddings)\n")
    print("Note: This is a controlled test dataset, not a real-world benchmark.")
    print("=" * 60)
    
    test_cases = [
        {
            "id": 1,
            "type": "exact_lexical",
            "jd": "Experience with Python and Django for backend development.",
            "resume": "Experience with Python and Django for backend development.",
            "expected": "High lexical, High semantic"
        },
        {
            "id": 2,
            "type": "semantic_synonyms",
            "jd": "Looking for a software engineer to build scalable REST APIs.",
            "resume": "Backend developer creating robust web services and microservices.",
            "expected": "Low lexical, High semantic"
        },
        {
            "id": 3,
            "type": "unrelated_context",
            "jd": "Must have experience operating heavy machinery and forklifts.",
            "resume": "Must have experience operating distributed systems and Kafka.",
            "expected": "Medium lexical (shared words), Low semantic"
        }
    ]

    for tc in test_cases:
        print(f"Test Case {tc['id']}: {tc['type']}")
        print(f"JD     : {tc['jd']}")
        print(f"Resume : {tc['resume']}")
        print(f"Expect : {tc['expected']}")
        
        tfidf_score = SimilarityService.calculate_tfidf_similarity(tc['resume'], tc['jd'])
        
        jd_emb = EmbeddingService.get_embedding(tc['jd'])
        res_emb = EmbeddingService.get_embedding(tc['resume'])
        semantic_score = SimilarityService.calculate_embedding_similarity(res_emb, jd_emb)
        
        print(f"TF-IDF Score   : {round(tfidf_score * 100, 2)}%")
        print(f"Semantic Score : {round(semantic_score * 100, 2)}%")
        print("-" * 60)

if __name__ == "__main__":
    run_evaluation()
