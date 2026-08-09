from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class JobDescriptionInput(BaseModel):
    title: str
    text: str

class AnalysisResponse(BaseModel):
    overall_score: float
    breakdown: Dict[str, Optional[float]]
    active_weights: Dict[str, float]
    detected_resume_sections: List[str]
    matched_skills: List[Any]
    missing_skills: List[Any]
    recommendations: List[str]
    section_matches: Dict[str, Any]
