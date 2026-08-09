import json
import asyncio
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.analysis_model import AnalysisRecord
from app.schemas.analysis import AnalysisResponse
from app.services.parser import DocumentParser
from app.services.extraction import SectionExtractor
from app.services.skill_extractor import SkillExtractor
from app.services.embeddings import EmbeddingService
from app.services.similarity import SimilarityService
from app.services.scoring import ScoringService

router = APIRouter()
skill_extractor = SkillExtractor()

@router.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    jd_title: str = Form(...),
    jd_text: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        file_bytes = await resume.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not read file")

    async def event_generator():
        try:
            # Yield Step 1
            yield json.dumps({"step": 1, "message": "Parsing Document Structure..."}) + "\n"
            await asyncio.sleep(0.5) # Slight delay for UI UX
            
            try:
                resume_text = DocumentParser.parse_document(file_bytes, resume.filename)
            except ValueError as e:
                yield json.dumps({"error": str(e)}) + "\n"
                return

            resume_sections = SectionExtractor.extract_resume_sections(resume_text)
            resume_sections["overall"] = resume_text

            # Yield Step 2
            yield json.dumps({"step": 2, "message": "Dynamically Extracting JD Requirements..."}) + "\n"
            await asyncio.sleep(0.5)
            
            resume_skills = skill_extractor.extract_skills(resume_text)
            jd_requirements = skill_extractor.analyze_jd_requirements(jd_text)
            
            dynamic_reqs = skill_extractor.extract_dynamic_requirements(jd_text, top_n=12)
            dynamic_matches = skill_extractor.match_dynamic_requirements(resume_text, dynamic_reqs, similarity_threshold=0.45)

            # Yield Step 3
            yield json.dumps({"step": 3, "message": "Generating Semantic Embeddings..."}) + "\n"
            await asyncio.sleep(0.5)
            
            jd_embedding = EmbeddingService.get_embedding(jd_text)

            # Yield Step 4
            yield json.dumps({"step": 4, "message": "Computing Cosine Similarity..."}) + "\n"
            
            section_matches = SimilarityService.section_level_match(
                resume_sections, 
                jd_text, 
                jd_embedding, 
                EmbeddingService.get_embedding,
                EmbeddingService.get_embeddings
            )

            # Yield Step 5
            yield json.dumps({"step": 5, "message": "Finalizing Compatibility Score..."}) + "\n"
            
            skill_gap = ScoringService.calculate_skill_gap(resume_skills, jd_requirements)
            
            if len(dynamic_matches["matched"]) > 0 or len(dynamic_matches["missing"]) > 0:
                total_dynamic = len(dynamic_matches["matched"]) + len(dynamic_matches["missing"])
                dynamic_score = (len(dynamic_matches["matched"]) / total_dynamic) * 100 if total_dynamic > 0 else 100
                blended_skill_score = (skill_gap["skill_score"] + dynamic_score) / 2
                skill_gap["skill_score"] = blended_skill_score
                skill_gap["matched"] = dynamic_matches["matched"]
                skill_gap["missing"] = dynamic_matches["missing"]

            overall_scoring = ScoringService.calculate_overall_score(skill_gap["skill_score"], section_matches)
            recommendations = ScoringService.generate_recommendations(skill_gap, overall_scoring["breakdown"])

            # Persist to DB
            record = AnalysisRecord(
                resume_filename=resume.filename,
                job_title=jd_title,
                overall_score=overall_scoring["overall_score"],
                breakdown=overall_scoring["breakdown"],
                matched_skills=skill_gap["matched"],
                missing_skills=skill_gap["missing"],
                recommendations=recommendations,
                section_matches=section_matches
            )
            db.add(record)
            db.commit()
            db.refresh(record)

            response_data = AnalysisResponse(
                overall_score=overall_scoring["overall_score"],
                breakdown=overall_scoring["breakdown"],
                active_weights=overall_scoring.get("active_weights", {}),
                detected_resume_sections=list(section_matches.keys()),
                matched_skills=skill_gap["matched"],
                missing_skills=skill_gap["missing"],
                recommendations=recommendations,
                section_matches=section_matches
            ).model_dump()
            
            yield json.dumps({"step": 6, "message": "Complete", "results": response_data}) + "\n"

        except Exception as e:
            import traceback
            traceback.print_exc()
            yield json.dumps({"error": f"Analysis failed: {str(e)}"}) + "\n"

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")
