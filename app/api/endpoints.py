from fastapi import APIRouter, Depends, Form, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.logic import handle_incoming_message

router = APIRouter()

@router.post("/webhook/whatsapp")
async def whatsapp_webhook(
    From: str = Form(...),
    Body: str = Form(...),
    To: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Twilio webhook endpoint.
    Twilio sends data as form-encoded.
    """
    handle_incoming_message(db, From, Body, To)
    return {"status": "success"}
