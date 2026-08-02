import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import UserProfile
from ..schemas import UserProfileResponse, UserProfileCreate
from ..resume_parser import extract_text_from_pdf, analyze_resume_keywords
from ..config import settings

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("", response_model=UserProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile()
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("", response_model=UserProfileResponse)
def update_profile(data: UserProfileCreate, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile(**data.model_dump())
        db.add(profile)
    else:
        for key, value in data.model_dump().items():
            setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/upload-resume")
def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    save_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text & analyze keywords
    parsed_text = extract_text_from_pdf(save_path)
    strengths, missing = analyze_resume_keywords(parsed_text)

    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile()
        db.add(profile)

    profile.resume_path = save_path
    profile.parsed_resume_text = parsed_text
    profile.key_strengths = ", ".join(strengths)
    profile.missing_keywords = ", ".join(missing)

    db.commit()
    db.refresh(profile)

    return {
        "message": "Resume uploaded and analyzed successfully",
        "parsed_text_length": len(parsed_text),
        "strengths": strengths,
        "missing_keywords": missing,
        "profile": profile
    }
