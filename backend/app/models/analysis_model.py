from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime
from app.db.database import Base

class AnalysisRecord(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_filename = Column(String, index=True)
    job_title = Column(String, index=True)
    overall_score = Column(Float)
    
    # Store complex data as JSON
    breakdown = Column(JSON)
    matched_skills = Column(JSON)
    missing_skills = Column(JSON)
    recommendations = Column(JSON)
    section_matches = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
