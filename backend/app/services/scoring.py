from typing import Dict, List, Any

class ScoringService:
    @staticmethod
    def calculate_skill_gap(resume_skills: List[str], jd_requirements: Dict[str, List[str]]) -> Dict[str, Any]:
        """
        Classifies skills into matched, related, and missing.
        Uses exact normalization matches. For related, in a real system we'd use embedding similarity 
        threshold between missed skills and found skills. For this implementation we'll simulate 
        'related' if they share a common category in the taxonomy (would need taxonomy passed in).
        """
        resume_skills_set = set(resume_skills)
        jd_required = set(jd_requirements.get("required", []))
        jd_preferred = set(jd_requirements.get("preferred", []))
        jd_nice = set(jd_requirements.get("nice_to_have", []))
        
        all_jd_skills = jd_required | jd_preferred | jd_nice
        
        matched = list(resume_skills_set & all_jd_skills)
        missing = list(all_jd_skills - resume_skills_set)
        
        # Here we just treat them all as missing initially, 
        # but in a more advanced step we'd check similarities.
        
        # Calculate skill match score
        total_weight = len(jd_required) * 2 + len(jd_preferred) * 1.5 + len(jd_nice) * 1.0
        if total_weight == 0:
            skill_score = 100.0 # No skills required
        else:
            earned = 0
            for skill in matched:
                if skill in jd_required:
                    earned += 2
                elif skill in jd_preferred:
                    earned += 1.5
                else:
                    earned += 1.0
            
            skill_score = min(100.0, (earned / total_weight) * 100)
            
        return {
            "matched": matched,
            "missing": missing,
            "related": [], # Placeholder for semantic related skills
            "skill_score": round(skill_score, 2)
        }

    @staticmethod
    def calculate_overall_score(skill_score: float, section_matches: dict) -> dict:
        """
        Calculates explainable overall match score using configurable weights.
        Skill Match          45%
        Experience Match     25%
        Semantic Match       15%  (Overall JD vs Resume, or aggregated section matches)
        Project Relevance    10%
        Education Match       5%
        Certifications        5%
        """
        
        # Extract individual semantic scores
        experience_score = section_matches.get("experience", {}).get("semantic_score", 0)
        project_score = section_matches.get("projects", {}).get("semantic_score", 0)
        education_score = section_matches.get("education", {}).get("semantic_score", 0)
        cert_score = section_matches.get("certifications", {}).get("semantic_score", 0)
        
        # We also want an overall semantic score.
        overall_semantic = section_matches.get("overall", {}).get("semantic_score", 0)
        
        base_weights = {
            "Skill Match": 0.40,
            "Experience Match": 0.25,
            "Semantic Match": 0.15,
            "Project Relevance": 0.10,
            "Education Match": 0.05,
            "Certifications": 0.05
        }
        assert abs(sum(base_weights.values()) - 1.0) < 1e-5, "Base weights must sum exactly to 1.0"
        
        # Dynamic Weight Normalization
        # Only include weights for sections that actually exist in the parsed resume
        active_weights = {
            "Skill Match": base_weights["Skill Match"],
            "Semantic Match": base_weights["Semantic Match"]
        }
        
        if "experience" in section_matches:
            active_weights["Experience Match"] = base_weights["Experience Match"]
        if "projects" in section_matches:
            active_weights["Project Relevance"] = base_weights["Project Relevance"]
        if "education" in section_matches:
            active_weights["Education Match"] = base_weights["Education Match"]
        if "certifications" in section_matches:
            active_weights["Certifications"] = base_weights["Certifications"]
            
        total_active_weight = sum(active_weights.values())
        
        # Normalize weights so they exactly sum to 1.0 (100%)
        if total_active_weight > 0:
            normalized_weights = {k: v / total_active_weight for k, v in active_weights.items()}
        else:
            normalized_weights = {k: 0.0 for k in active_weights.keys()}
        
        final_score = (
            skill_score * normalized_weights.get("Skill Match", 0) +
            overall_semantic * normalized_weights.get("Semantic Match", 0) +
            experience_score * normalized_weights.get("Experience Match", 0) +
            project_score * normalized_weights.get("Project Relevance", 0) +
            education_score * normalized_weights.get("Education Match", 0) +
            cert_score * normalized_weights.get("Certifications", 0)
        )
        
        breakdown = {
            "Skill Match": round(skill_score, 2),
            "Semantic Match": round(overall_semantic, 2),
            "Experience": round(experience_score, 2) if "experience" in section_matches else None,
            "Projects": round(project_score, 2) if "projects" in section_matches else None,
            "Education": round(education_score, 2) if "education" in section_matches else None,
            "Certifications": round(cert_score, 2) if "certifications" in section_matches else None
        }

        return {
            "overall_score": round(final_score, 2),
            "breakdown": breakdown,
            "active_weights": {k: round(v, 4) for k, v in normalized_weights.items()}
        }

    @staticmethod
    def generate_recommendations(skill_gap: dict, breakdown: dict) -> List[str]:
        recommendations = []
        
        exp_score = breakdown.get("Experience")
        if exp_score is not None and exp_score < 50:
            recommendations.append("Your experience section semantic match is low. Consider rewriting bullet points to better align with the JD's responsibilities.")
            
        if len(skill_gap["missing"]) > 0:
            # Handle both list of strings and list of dicts
            missing_items = skill_gap["missing"]
            if isinstance(missing_items[0], dict):
                missing_str = ", ".join([item.get("skill", "") for item in missing_items[:3]])
            else:
                missing_str = ", ".join(missing_items[:3])
            
            recommendations.append(f"The JD emphasizes skills you seem to be missing: {missing_str}. If you have these skills, ensure they are explicitly mentioned.")
            
        if breakdown["Skill Match"] > 80 and breakdown["Semantic Match"] < 60:
            recommendations.append("You have the right skills, but the context in which they are used doesn't strongly align with the JD. Add more detail to your projects and experience.")
            
        if len(recommendations) == 0:
            recommendations.append("Your resume is a strong match! Ensure formatting is clean and error-free before submitting.")
            
        return recommendations
