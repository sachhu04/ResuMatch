from app.services.scoring import ScoringService

def test_normalization(name, section_matches):
    print(f"--- Running Test: {name} ---")
    skill_score = 80.0
    result = ScoringService.calculate_overall_score(skill_score, section_matches)
    
    print(f"Overall Score: {result['overall_score']}%")
    print("Breakdown:")
    for section, score in result['breakdown'].items():
        if score is not None:
            print(f"  {section}: {score}%")
    print("Active Weights:")
    for section, weight in result.get('active_weights', {}).items():
        print(f"  {section}: {weight}")
    print("=" * 40 + "\n")

if __name__ == "__main__":
    # 1. All sections present
    all_sections = {
        "overall": {"semantic_score": 75.0},
        "experience": {"semantic_score": 85.0},
        "projects": {"semantic_score": 90.0},
        "education": {"semantic_score": 100.0},
        "certifications": {"semantic_score": 50.0}
    }
    test_normalization("All Sections (100% total weight possible)", all_sections)

    # 2. Missing certifications and education
    # Weights should be redistributed
    missing_some = {
        "overall": {"semantic_score": 75.0},
        "experience": {"semantic_score": 85.0},
        "projects": {"semantic_score": 90.0}
    }
    test_normalization("Missing Certs & Education", missing_some)

    # 3. Missing everything but overall/skill
    # Weights should just fall 100% on skills and overall semantics
    barebones = {
        "overall": {"semantic_score": 75.0}
    }
    test_normalization("Barebones Resume (Only Skills & Summary)", barebones)

    # 4. Empty section matches (zero division test)
    empty = {}
    test_normalization("Empty Resume (Zero Division Safety Check)", empty)
