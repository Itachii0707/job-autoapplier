from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserProfileBase(BaseModel):
    full_name: str
    email: str
    phone: str
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""
    portfolio_url: Optional[str] = ""
    years_experience: float
    parsed_resume_text: Optional[str] = ""
    key_strengths: Optional[str] = ""
    missing_keywords: Optional[str] = ""

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: int
    resume_path: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class SearchConfigBase(BaseModel):
    job_title: str
    location: str
    is_remote: bool = True
    is_hybrid: bool = False
    easy_apply_only: bool = True
    max_applications_per_day: int = 25
    auto_apply_active: bool = True

class SearchConfigCreate(SearchConfigBase):
    pass

class SearchConfigResponse(SearchConfigBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class JobApplicationBase(BaseModel):
    company: str
    job_title: str
    location: str
    job_url: Optional[str] = None
    match_score: int = 85
    status: str = "APPLIED"
    auto_apply_enabled: bool = True
    ai_response_log: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

class JobApplicationCreate(JobApplicationBase):
    pass

class JobApplicationResponse(JobApplicationBase):
    id: int
    applied_at: datetime

    class Config:
        from_attributes = True

class BotLogResponse(BaseModel):
    id: int
    timestamp: datetime
    level: str
    message: str
    job_title: Optional[str] = None
    company: Optional[str] = None

    class Config:
        from_attributes = True

class StatsSummary(BaseModel):
    applications_sent: int
    interviews_secured: int
    ai_match_rate: int
    jobs_today: int
    active_status: str
