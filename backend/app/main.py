from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import analyze, history
from app.db.database import engine, Base
from app.models import analysis_model

# Initialize SQLite database tables automatically on startup
Base.metadata.create_all(bind=engine)

# Application Entry Point & OpenAPI Metadata Definition
app = FastAPI(
    title="ResuMatch API",
    description="NLP-powered resume analyzer API",
    version="1.0.0"
)

# Cross-Origin Resource Sharing (CORS) Middleware Configuration
# Enables seamless decoupled frontend communication (React / Vite on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to verified frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register modular sub-routers under the /api namespace
app.include_router(analyze.router, prefix="/api")
app.include_router(history.router, prefix="/api")

# Root and health-check monitoring probes for container orchestration
@app.get("/")
def read_root():
    return {"message": "Welcome to ResuMatch API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

