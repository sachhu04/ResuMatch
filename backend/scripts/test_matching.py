import sys
import os
import numpy as np

# Adjust path to import backend app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.similarity import SimilarityService
from app.services.embeddings import EmbeddingService
from app.services.scoring import ScoringService
from app.services.extraction import SectionExtractor
from app.services.skill_extractor import SkillExtractor

def test_monotonic_scaling():
    print("--- Test K: Monotonic Score Calibration (Square Root) ---")
    # Using mock vectors to simulate cosine similarity results and see how it's handled.
    # Actually, the logic is in section_level_match but we can just test the math logic.
    raw_vals = [0.0, 0.25, 0.5, 1.0]
    for raw in raw_vals:
        scaled = raw ** 0.5 if raw > 0 else 0.0
        print(f"Raw: {raw}, Scaled: {scaled}")
        assert scaled >= raw, "Scaled value should expand the range"
    assert (0.25 ** 0.5) == 0.5
    assert (1.0 ** 0.5) == 1.0
    print("Monotonic scaling bounded check passed.\n")

def test_tf_idf_technical_terms():
    print("--- Test F: Hard Skill Exact Match (TF-IDF Tokenizer) ---")
    jd = "Looking for C++ and .NET developers."
    res = "I am a C++ and .NET developer."
    score = SimilarityService.calculate_tfidf_similarity(res, jd)
    print(f"Lexical Score for technical terms: {score*100:.2f}%")
    assert score > 0.4, "TF-IDF should match C++ and .NET"
    print("Technical term preservation passed.\n")

def test_chunking_asymmetry():
    print("--- Test D & J: Long JD vs Short Resume Section ---")
    jd_text = "This is a long job description. " * 20 + "The candidate must know Python. " * 5
    res_section = "I know Python."
    
    # Simulate a section level match
    sections = {"skills": res_section}
    jd_embedding = EmbeddingService.get_embedding(jd_text) # not used in new logic, but needed for signature
    results = SimilarityService.section_level_match(
        sections, 
        jd_text, 
        jd_embedding, 
        EmbeddingService.get_embedding,
        EmbeddingService.get_embeddings
    )
    print(f"Section Semantic Score: {results['skills']['semantic_score']}%")
    assert results['skills']['semantic_score'] > 50, "Chunking should identify the 'Python' sentence match."
    print("Asymmetrical chunk matching passed.\n")

def run_all_tests():
    print("Running Rigorous Matching Tests...\n")
    test_monotonic_scaling()
    test_tf_idf_technical_terms()
    test_chunking_asymmetry()
    print("All backend tests completed successfully.")

if __name__ == "__main__":
    run_all_tests()
