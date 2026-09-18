import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Connect to the local docker compose postgres instance
# In production, use environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://resu_user:resu_password@localhost:5432/resumatch")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
