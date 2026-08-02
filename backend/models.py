from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, JSON
from datetime import datetime
from .database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, default="Ayush Sharma")
    email = Column(String, default="ayush@example.com")
    phone = Column(String, default="+91 9876543210")
    linkedin_url = Column(String, default="https://linkedin.com/in/ayush-dev")
    github_url = Column(String, default="https://github.com/ayush-dev")
    portfolio_url = Column(String, default="https://ayush-dev.io")
    years_experience = Column(Float, default=4.5)
    resume_path = Column(String, nullable=True)
    parsed_resume_text = Column(Text, nullable=True)
    key_strengths = Column(Text, default="Python, React, TypeScript, FastAPI, System Architecture, SQL, Docker, Playwright, Node.js")
    missing_keywords = Column(Text, default="Kubernetes, AWS Lambda, GraphQL, Terraform")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SearchConfig(Base):
    __tablename__ = "search_configs"

    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String, default="Full Stack Engineer")
    location = Column(String, default="Bengaluru, India")
    is_remote = Column(Boolean, default=True)
    is_hybrid = Column(Boolean, default=False)
    easy_apply_only = Column(Boolean, default=True)
    max_applications_per_day = Column(Integer, default=25)
    auto_apply_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, index=True)
    job_title = Column(String, index=True)
    location = Column(String)
    job_url = Column(String, nullable=True)
    match_score = Column(Integer, default=85) # e.g. 92% Match
    status = Column(String, default="APPLIED") # APPLIED, INTERVIEW, IN_PROGRESS, FAILED, SKIPPED
    auto_apply_enabled = Column(Boolean, default=True)
    applied_at = Column(DateTime, default=datetime.utcnow)
    ai_response_log = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)

class BotLog(Base):
    __tablename__ = "bot_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    level = Column(String, default="INFO") # INFO, SUCCESS, WARN, ERROR
    message = Column(Text)
    job_title = Column(String, nullable=True)
    company = Column(String, nullable=True)
