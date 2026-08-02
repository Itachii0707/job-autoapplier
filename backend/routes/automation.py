import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import UserProfile, SearchConfig, BotLog
from ..multi_platform_scraper import MultiPlatformApplierEngine, JobPlatform, PlaywrightApplierEngine

router = APIRouter(prefix="/api/automation", tags=["Automation"])

active_bot_engine: Optional[MultiPlatformApplierEngine] = None
active_connections: List[WebSocket] = []

class StartAutomationRequest(BaseModel):
    platforms: List[str] = ["linkedin"]  # linkedin, indeed, glassdoor, naukri, wellfound

class PlatformStatsResponse(BaseModel):
    total_applications: int
    platforms: dict
    is_running: bool

async def broadcast_log(message: str, level: str = "INFO"):
    """Broadcast log message to active WebSocket frontend clients and DB."""
    payload = {"message": message, "level": level}
    for connection in active_connections:
        try:
            await connection.send_json(payload)
        except Exception:
            pass

@router.websocket("/ws/logs")
async def websocket_logs_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text() # Keep connection alive
    except WebSocketDisconnect:
        if websocket in active_connections:
            active_connections.remove(websocket)

def parse_platforms(platform_strings: List[str]) -> List[JobPlatform]:
    """Parse platform strings to JobPlatform enums."""
    platform_map = {
        "linkedin": JobPlatform.LINKEDIN,
        "indeed": JobPlatform.INDEED,
        "glassdoor": JobPlatform.GLASSDOOR,
        "naukri": JobPlatform.NAUKRI,
        "wellfound": JobPlatform.WELLFOUND,
    }
    return [platform_map[p.lower()] for p in platform_strings if p.lower() in platform_map]

@router.post("/start")
async def start_automation(
    request: StartAutomationRequest,
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    global active_bot_engine
    
    if active_bot_engine and active_bot_engine.is_running:
        return {"status": "already_running", "message": "Automation engine is already running."}

    profile = db.query(UserProfile).first()
    search = db.query(SearchConfig).first()

    profile_dict = profile.__dict__ if profile else {}
    search_dict = search.__dict__ if search else {}

    platforms = parse_platforms(request.platforms)
    if not platforms:
        platforms = [JobPlatform.LINKEDIN]

    active_bot_engine = MultiPlatformApplierEngine(
        user_profile=profile_dict,
        search_config=search_dict,
        platforms=platforms,
        log_callback=broadcast_log
    )

    background_tasks.add_task(active_bot_engine.start)

    return {
        "status": "started", 
        "message": f"Multi-platform automation engine launched for: {', '.join([p.value for p in platforms])}.",
        "platforms": [p.value for p in platforms]
    }

@router.post("/stop")
async def stop_automation():
    global active_bot_engine
    if active_bot_engine and active_bot_engine.is_running:
        await active_bot_engine.stop()
        active_bot_engine = None
        return {"status": "stopped", "message": "Automation engine stopped."}
    return {"status": "not_running", "message": "No active automation engine running."}

@router.get("/status")
def get_bot_status():
    global active_bot_engine
    if active_bot_engine and active_bot_engine.is_running:
        stats = active_bot_engine.get_stats()
        return {
            "running": True, 
            "completed": active_bot_engine.applications_completed,
            "platforms": stats["platforms"]
        }
    return {"running": False, "completed": 0, "platforms": {}}

@router.get("/stats", response_model=PlatformStatsResponse)
def get_detailed_stats():
    global active_bot_engine
    if active_bot_engine:
        return active_bot_engine.get_stats()
    return {"total_applications": 0, "platforms": {}, "is_running": False}

@router.get("/platforms")
def get_available_platforms():
    """Get list of supported job platforms."""
    return {
        "platforms": [
            {"id": "linkedin", "name": "LinkedIn", "description": "Professional network with Easy Apply"},
            {"id": "indeed", "name": "Indeed", "description": "Job board with Indeed Apply"},
            {"id": "glassdoor", "name": "Glassdoor", "description": "Company reviews + job search"},
            {"id": "naukri", "name": "Naukri", "description": "India's leading job portal"},
            {"id": "wellfound", "name": "Wellfound (AngelList)", "description": "Startup jobs"}
        ]
    }
