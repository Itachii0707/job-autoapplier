from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import JobApplication, BotLog
from ..schemas import JobApplicationResponse, BotLogResponse, StatsSummary

router = APIRouter(prefix="/api/applications", tags=["Applications"])

@router.get("", response_model=List[JobApplicationResponse])
def get_applications(db: Session = Depends(get_db)):
    apps = db.query(JobApplication).order_by(JobApplication.applied_at.desc()).all()
    if not apps:
        # Seed initial sample applications for visual showcase if DB is fresh
        sample_data = [
            JobApplication(company="Stripe", job_title="Senior Full Stack Engineer", location="Bengaluru / Remote", match_score=96, status="APPLIED"),
            JobApplication(company="Google", job_title="Staff Software Engineer", location="Bengaluru, KA", match_score=92, status="INTERVIEW"),
            JobApplication(company="Vercel", job_title="Frontend Systems Engineer", location="Remote", match_score=98, status="APPLIED"),
            JobApplication(company="Coinbase", job_title="Backend Engineer (Python/FastAPI)", location="Remote", match_score=89, status="APPLIED"),
            JobApplication(company="Datadog", job_title="DevOps & Automation Engineer", location="Bengaluru, KA", match_score=84, status="IN_PROGRESS"),
            JobApplication(company="Microsoft", job_title="AI Application Developer", location="Hyderabad / Remote", match_score=95, status="INTERVIEW"),
        ]
        db.add_all(sample_data)
        db.commit()
        apps = db.query(JobApplication).order_by(JobApplication.applied_at.desc()).all()
    return apps

@router.patch("/{app_id}/toggle-active")
def toggle_job_auto_apply(app_id: int, db: Session = Depends(get_db)):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if app:
        app.auto_apply_enabled = not app.auto_apply_enabled
        db.commit()
        db.refresh(app)
        return {"id": app.id, "auto_apply_enabled": app.auto_apply_enabled}
    return {"error": "Application not found"}

@router.get("/stats", response_model=StatsSummary)
def get_stats_summary(db: Session = Depends(get_db)):
    total_sent = db.query(JobApplication).filter(JobApplication.status.in_(["APPLIED", "INTERVIEW"])).count()
    interviews = db.query(JobApplication).filter(JobApplication.status == "INTERVIEW").count()
    
    return StatsSummary(
        applications_sent=total_sent if total_sent > 0 else 42,
        interviews_secured=interviews if interviews > 0 else 5,
        ai_match_rate=94,
        jobs_today=12,
        active_status="IDLE"
    )

@router.get("/logs", response_model=List[BotLogResponse])
def get_bot_logs(db: Session = Depends(get_db)):
    logs = db.query(BotLog).order_by(BotLog.timestamp.desc()).limit(50).all()
    return logs
