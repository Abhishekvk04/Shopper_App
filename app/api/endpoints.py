from fastapi import APIRouter, Depends, Form, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.logic import router as core_router

router = APIRouter()

@router.post("/webhook/whatsapp")
async def whatsapp_webhook(
    From: str = Form(...),
    Body: str = Form(None), # Can be empty if it's only media
    To: str = Form(...),
    MediaUrl0: str = Form(None), # Twilio sends MediaUrl0, MediaUrl1 etc.
    Latitude: float = Form(None),
    Longitude: float = Form(None),
    db: Session = Depends(get_db)
):
    """
    Twilio webhook endpoint.
    Twilio sends data as form-encoded.
    """
    print(f"DEBUG: Webhook Received | From: {From} | To: {To} | Body: {Body} | Media: {MediaUrl0}")
    
    try:
        core_router(
            db, 
            From, 
            Body or "", 
            To, 
            media_url=MediaUrl0, 
            latitude=Latitude, 
            longitude=Longitude
        )
        return {"status": "success"}
    except Exception as e:
        print(f"CRITICAL ERROR in Webhook: {e}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
