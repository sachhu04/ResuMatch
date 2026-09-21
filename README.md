# ResuMatch

## Overview
**Note: This project was developed as part of a Deep Learning course implementation.**

ResuMatch is a production-quality, NLP-powered platform that analyzes resumes against job descriptions (JDs). It moves beyond basic keyword matching by leveraging true Natural Language Processing and Semantic Embeddings to uncover strengths, identify skill gaps, and produce an explainable compatibility score.

## Features
- **Intelligent Document Parsing**: Extracts text from PDF and DOCX files while preserving logical structure.
- **Section Detection**: Automatically identifies logical sections (e.g., Experience, Projects, Education).
- **Skill Extraction**: Normalizes variants of technical skills to their canonical forms (e.g., "k8s" -> "Kubernetes").
- **Semantic Matching**: Uses `SentenceTransformers` to understand contextual meaning beyond exact wording.
- **Explainable Compatibility Score**: Computes a detailed score based on skill match, semantic alignment, and experience.
- **Skill Gap Analysis**: Categorizes skills required by the JD as matched, related, or missing.
- **Dashboard**: Saves past analyses so users can compare their resume across multiple jobs.

## Architecture
- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4.
- **Backend**: Python, FastAPI, SQLAlchemy, Pydantic.
- **Database**: PostgreSQL for persisting analysis history.
- **Deployment**: Fully containerized with Docker Compose.

## NLP Pipeline
1. **Document Parsing**: Utilizes `PyMuPDF` and `python-docx`.
2. **Text Cleaning & Normalization**: Standardizes casing and resolves technology aliases.
3. **Section Detection**: Regex-based heuristic slice-and-dice of resumes.
4. **Skill Extraction**: Boundary-aware string matching against an extensible skill taxonomy JSON.
5. **Text Representation (Baseline)**: TF-IDF vectorization.
6. **Text Representation (Improved)**: Contextual sentence embeddings.
7. **Similarity Calculation**: Cosine similarity.
8. **Scoring**: Weighted rule-based aggregation.

## How Semantic Matching Works
Basic ATS systems scan for exact keywords. ResuMatch instead converts both the resume section and the job requirement into high-dimensional vector embeddings using a Transformer model. By calculating the **cosine similarity** between these two vectors, ResuMatch can determine if two phrases have the same *meaning*, even if they use completely different words (e.g., "Created REST APIs" vs "Developed backend web services").

## TF-IDF Baseline
To demonstrate measurable improvement, ResuMatch first establishes a lexical baseline using Term Frequency-Inverse Document Frequency (TF-IDF). TF-IDF penalizes common words and rewards rare, distinct terms. However, it fails to capture synonyms and context, which is exactly the gap the Transformer model solves. The final analysis provides a direct comparison between the TF-IDF lexical score and the Transformer semantic score.

## Embedding Model
ResuMatch utilizes the `all-MiniLM-L6-v2` model from the `sentence-transformers` library. It was chosen because it provides an excellent balance of speed, size, and semantic accuracy, allowing the entire pipeline to easily run locally on a developer's machine without requiring a dedicated GPU.

## Scoring Methodology
The final "ResuMatch Compatibility Score" is an explainable weighted average (configurable in code):
- **Skill Match**: 40%
- **Experience Match**: 25%
- **Semantic Match**: 15%
- **Project Relevance**: 10%
- **Education Match**: 5%
- **Certifications**: 5%

## Project Structure
- `/backend`: Python FastAPI application containing all NLP logic, routing, and database models.
  - `/backend/app/services`: Contains the core NLP algorithms (`extraction.py`, `similarity.py`, `scoring.py`).
  - `/backend/app/evaluate_system.py`: Standalone evaluation script testing exact lexical vs semantic synonym scenarios.
  - `/backend/scripts`: Additional utility scripts (`test_matching.py`, `evaluate.py`) for benchmarking.
- `/frontend`: React + TypeScript SPA utilizing Vite and Tailwind CSS.
- `ResuMatch_Final_Report.pdf / .html`: The comprehensive academic implementation report detailing the math, logic, and empirical evaluation of the dual-engine pipeline.
- `docker-compose.yml`: Orchestrates the PostgreSQL, Backend, and Frontend containers.
- `test_scoring_script.py`: Root-level sandbox script used for testing the Adaptive Weighting logic.

## Local Setup
1. Clone the repository.
2. Navigate to the `backend` directory and run:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Navigate to the `frontend` directory and run:
   ```bash
   npm install
   ```

## Docker Setup
Ensure you have Docker and Docker Compose installed.
```bash
# Build and start all services (PostgreSQL, FastAPI Backend, React Frontend)
docker-compose up --build
```
- The frontend will be available at `http://localhost:3000`
- The backend API will be available at `http://localhost:8000`

## Evaluation
A standalone script is provided in `backend/app/evaluate_system.py` to benchmark the TF-IDF lexical baseline against the Transformer semantic embeddings using representative test cases.

Run it with:
```bash
source backend/venv/bin/activate
python backend/app/evaluate_system.py
```

## Limitations
- The current rule-based section extractor may degrade if a resume has a highly unusual format (e.g., multi-column graphic resumes without clear logical text flow).
- The skill taxonomy requires manual curation for new or niche technologies.
