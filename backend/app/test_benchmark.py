import sys
import os
import numpy as np
from sentence_transformers import SentenceTransformer
from services.similarity import SimilarityService
from services.scoring import ScoringService

def run_benchmark():
    print("Loading model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Base Job Description
    jd_text = "Looking for a software engineer with strong backend experience. Must know Python, AWS, and REST APIs. Experience building scalable cloud architecture is required."
    jd_emb = model.encode(jd_text)
    
    print("--- SCENARIO 1: Exact Match ---")
    res1_text = "Software engineer with backend experience. I know Python, AWS, and REST APIs. I have experience building scalable cloud architecture."
    res1_emb = model.encode(res1_text)
    
    tfidf_1 = SimilarityService.calculate_tfidf_similarity(res1_text, jd_text) * 100
    bert_1 = SimilarityService.calculate_embedding_similarity(res1_emb, jd_emb) * 100
    print(f"TF-IDF: {tfidf_1:.2f}")
    print(f"ResuMatch (BERT): {bert_1:.2f}\n")
    
    print("--- SCENARIO 2: Synonymous Concepts ---")
    res2_text = "Backend developer working with Django, Amazon Web Services, and microservices. Built highly available server infrastructure."
    res2_emb = model.encode(res2_text)
    
    tfidf_2 = SimilarityService.calculate_tfidf_similarity(res2_text, jd_text) * 100
    bert_2 = SimilarityService.calculate_embedding_similarity(res2_emb, jd_emb) * 100
    print(f"TF-IDF: {tfidf_2:.2f}")
    print(f"ResuMatch (BERT): {bert_2:.2f}\n")

if __name__ == "__main__":
    run_benchmark()
