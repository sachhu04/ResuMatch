from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.analysis_model import AnalysisRecord

router = APIRouter()

@router.get("/history")
def get_analysis_history(db: Session = Depends(get_db)):
    records = db.query(AnalysisRecord).order_by(AnalysisRecord.created_at.desc()).all()
    return records

@router.get("/history/{record_id}")
def get_analysis_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id).first()
    return record

@router.delete("/history/{record_id}")
def delete_analysis_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id).first()
    if record:
        db.delete(record)
        db.commit()
        return {"status": "deleted"}
    return {"status": "not_found"}
