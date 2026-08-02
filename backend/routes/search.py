from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import SearchConfig
from ..schemas import SearchConfigResponse, SearchConfigCreate

router = APIRouter(prefix="/api/search", tags=["Search Configuration"])

@router.get("", response_model=SearchConfigResponse)
def get_search_config(db: Session = Depends(get_db)):
    config = db.query(SearchConfig).first()
    if not config:
        config = SearchConfig()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("", response_model=SearchConfigResponse)
def update_search_config(data: SearchConfigCreate, db: Session = Depends(get_db)):
    config = db.query(SearchConfig).first()
    if not config:
        config = SearchConfig(**data.model_dump())
        db.add(config)
    else:
        for key, value in data.model_dump().items():
            setattr(config, key, value)
    db.commit()
    db.refresh(config)
    return config
