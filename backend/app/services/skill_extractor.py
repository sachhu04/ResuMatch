import json
import os
import re
from typing import List, Set, Dict, Tuple, Any
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.services.embeddings import EmbeddingService

class SkillExtractor:
    def __init__(self, taxonomy_path: str = None):
        if not taxonomy_path:
            taxonomy_path = os.path.join(os.path.dirname(__file__), "skill_taxonomy.json")
        
        with open(taxonomy_path, 'r') as f:
            self.taxonomy = json.load(f)
            
        self.skill_map = self._build_skill_map()

    def _build_skill_map(self) -> Dict[str, str]:
        """
        Builds a flattened map of lowercased variants to their normalized canonical skill name.
        """
        mapping = {}
        for category, skills in self.taxonomy.items():
            for canonical_name, variants in skills.items():
                for variant in variants:
                    mapping[variant.lower()] = canonical_name
        return mapping

    def extract_skills(self, text: str) -> List[str]:
        """
        Extracts normalized skills from raw text using regex boundaries to avoid partial word matches.
        Returns a unique list of canonical skill names.
        """
        text_lower = text.lower()
        extracted_skills = set()

        for variant, canonical in self.skill_map.items():
            # Escape variant for regex, handle special characters like ++ or .js
            escaped_variant = re.escape(variant)
            
            # Using \b word boundaries, but carefully handling cases where variant ends in non-word char (like C++)
            # If variant ends/starts with non-word char, \b behaves differently, so we use a more robust approach
            # Using negative lookbehind/lookahead for word chars
            pattern = r"(?<!\w)" + escaped_variant + r"(?!\w)"
            
            if re.search(pattern, text_lower):
                extracted_skills.add(canonical)

        return list(extracted_skills)

    def analyze_jd_requirements(self, text: str) -> Dict[str, List[str]]:
        """
        Extracts skills and classifies them based on surrounding text context:
        - required
        - preferred
        - nice_to_have
        """
        skills_found = self.extract_skills(text)
        
        categorized = {
            "required": [],
            "preferred": [],
            "nice_to_have": []
        }

        # Basic context window approach around found skills
        lines = text.lower().split('\n')
        
        for skill in skills_found:
            category_assigned = "required" # default
            
            for line in lines:
                # If skill is mentioned in this line
                # Let's see if there are priority keywords
                variants = []
                for cat, sks in self.taxonomy.items():
                    if skill in sks:
                        variants = sks[skill]
                        break
                
                # We simply check if any of the variants is in the line
                variant_in_line = False
                for variant in [v.lower() for k, vs in self.taxonomy.items() for k2, v2 in vs.items() if k2 == skill for v in v2]:
                   if re.search(r"(?<!\w)" + re.escape(variant) + r"(?!\w)", line):
                       variant_in_line = True
                       break

                if variant_in_line:
                    if any(kw in line for kw in ["preferred", "plus", "bonus", "advantage", "nice to have", "familiarity"]):
                        if "preferred" in line:
                            category_assigned = "preferred"
                        else:
                            category_assigned = "nice_to_have"
                        break
                    if any(kw in line for kw in ["must have", "required", "mandatory"]):
                        category_assigned = "required"
                        break
            
            categorized[category_assigned].append(skill)
            
        return categorized

    def extract_dynamic_requirements(self, jd_text: str, top_n: int = 15) -> List[str]:
        """
        Uses CountVectorizer to extract n-grams (1-3 words) and semantic embeddings
        to find the most relevant phrases (KeyBERT style).
        """
        if not jd_text.strip():
            return []

        # 1. Extract candidate n-grams
        # We use a custom pattern to only extract words, ignoring numbers/symbols
        from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
        custom_stop_words = list(ENGLISH_STOP_WORDS) + [
            'chennai', 'hyderabad', 'bangalore', 'pune', 'mumbai', 'delhi', 'noida', 'gurgaon',
            'india', 'usa', 'remote', 'hybrid', 'onsite', 'years', 'experience', 'requirements',
            'responsibilities', 'role', 'job', 'description', 'company', 'work', 'team',
            'looking', 'join', 'candidate', 'candidates', 'skills', 'required', 'preferred'
        ]
        
        vectorizer = CountVectorizer(
            ngram_range=(1, 3), 
            stop_words=custom_stop_words, 
            token_pattern=r'(?u)\b[a-zA-Z_][a-zA-Z0-9_]+\b'
        )
        try:
            vectorizer.fit([jd_text])
            candidates = vectorizer.get_feature_names_out()
        except ValueError:
            return []

        if len(candidates) == 0:
            return []

        # 2. Embed the entire JD and all candidate phrases
        jd_embedding = EmbeddingService.get_embedding(jd_text).reshape(1, -1)
        candidate_embeddings = EmbeddingService.get_embeddings(list(candidates))

        # 3. Calculate cosine similarity between JD and candidates
        distances = cosine_similarity(jd_embedding, candidate_embeddings)[0]

        # 4. Get top N candidates
        top_indices = distances.argsort()[-top_n:][::-1]
        
        # 5. Filter out overlapping phrases (e.g., if "python developer" and "python" are both in top)
        # Simple heuristic: keep the longer phrase if it contains the shorter one, or vice versa
        # For simplicity, we just return the raw top N here, but filter out pure subsets if needed.
        selected_phrases = []
        for idx in top_indices:
            phrase = candidates[idx]
            # Avoid pure subsets in the top results to diversify
            if not any(phrase in selected and phrase != selected for selected in selected_phrases):
                selected_phrases.append(phrase)
            if len(selected_phrases) >= top_n:
                break
                
        return selected_phrases

    def match_dynamic_requirements(self, resume_text: str, jd_requirements: List[str], similarity_threshold: float = 0.5) -> Dict[str, Any]:
        """
        Matches dynamic JD requirements against resume sentences to find contexts.
        Returns matched and missing requirements with contextual evidence.
        """
        import re
        
        # Split resume into roughly sentences or bullet points
        resume_sentences = [s.strip() for s in re.split(r'[\n\.\•\-\*]', resume_text) if len(s.strip()) > 10]
        if not resume_sentences:
             resume_sentences = [resume_text]
             
        # Embed all resume sentences once
        sentence_embeddings = EmbeddingService.get_embeddings(resume_sentences)
        
        matched_items = []
        missing_items = []
        
        for req in jd_requirements:
            req_emb = EmbeddingService.get_embedding(req).reshape(1, -1)
            
            # Find max similarity across all resume sentences
            similarities = cosine_similarity(req_emb, sentence_embeddings)[0]
            max_sim_idx = similarities.argmax()
            max_sim = similarities[max_sim_idx]
            
            if max_sim >= similarity_threshold:
                matched_items.append({
                    "skill": req.title(),
                    "resume_evidence": resume_sentences[max_sim_idx],
                    "similarity": round(float(max_sim), 2)
                })
            else:
                missing_items.append({
                    "skill": req.title()
                })
                
        return {
            "matched": matched_items,
            "missing": missing_items
        }

