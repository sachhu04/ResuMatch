from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import analyze, history
from app.db.database import engine, Base
from app.models import analysis_model

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResuMatch API",
    description="NLP-powered resume analyzer API",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
app.include_router(history.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to ResuMatch API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
