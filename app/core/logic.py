from sqlalchemy.orm import Session
from app.db.models import Business, KBEntry, Message, Escalation
from app.services.twilio import send_whatsapp_message
from datetime import datetime

def handle_incoming_message(db: Session, from_number: str, body: str, to_number: str):
    """
    Orchestrates the handling of an incoming WhatsApp message.
    """
    clean_from = from_number.replace("whatsapp:", "")
    clean_to = to_number.replace("whatsapp:", "")
    
    # 1. Identify Business
    business = db.query(Business).first() 
    if not business:
        business = Business(name="Demo Clinic", phone_number=clean_to, escalation_phone=clean_to)
        db.add(business)
        db.commit()
        db.refresh(business)
        
    is_owner = (clean_from == business.escalation_phone)
    
    # Store message
    db_msg = Message(
        business_id=business.id,
        sender="owner" if is_owner else "customer",
        sender_id=clean_from,
        text=body,
        timestamp=datetime.utcnow()
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    
    if is_owner:
        handle_owner_message(db, business, body)
    else:
        handle_customer_message(db, business, clean_from, body, db_msg)

def handle_customer_message(db: Session, business: Business, customer_phone: str, query: str, db_msg: Message):
    """
    Search KB and reply or escalate.
    """
    kb_entries = db.query(KBEntry).filter(KBEntry.business_id == business.id).all()
    
    best_match = None
    # Simple logic: check if ANY keyword from question tokens is in entry question
    # This is very basic MVP logic.
    for entry in kb_entries:
        if entry.question.lower() in query.lower() or query.lower() in entry.question.lower():
            best_match = entry
            break
            
    if best_match:
        send_whatsapp_message(customer_phone, best_match.answer)
        bot_msg = Message(business_id=business.id, sender="bot", sender_id="system", text=best_match.answer)
        db.add(bot_msg)
        db.commit()
    else:
        # Escalate
        send_whatsapp_message(customer_phone, "Let me confirm this and get back to you 😊")
        bot_msg = Message(business_id=business.id, sender="bot", sender_id="system", text="Let me confirm this and get back to you 😊")
        db.add(bot_msg)
        
        # Notify Owner
        escalation_text = f"🚨 New Customer Query from {customer_phone}:\n\n'{query}'\n\nReply to this message to answer the customer."
        send_whatsapp_message(business.escalation_phone, escalation_text)

        # Create Escalation Record
        escalation = Escalation(message_id=db_msg.id, status="pending")
        db.add(escalation)
        db.commit()

def handle_owner_message(db: Session, business: Business, reply_text: str):
    """
    Owner replies. Identify the last pending escalation.
    """
    pending_escalation = db.query(Escalation).join(Message).filter(
        Escalation.status == "pending",
        Message.business_id == business.id
    ).order_by(Escalation.id.desc()).first()
    
    if pending_escalation:
        original_msg = pending_escalation.message
        customer_phone = original_msg.sender_id
        
        # 1. Reply to customer
        send_whatsapp_message(customer_phone, reply_text)
        
        # 2. Update Escalation
        pending_escalation.status = "resolved"
        pending_escalation.owner_reply = reply_text
        
        # 3. Learn (Add to KB)
        new_kb = KBEntry(
            business_id=business.id,
            question=original_msg.text,
            answer=reply_text,
            source="learned",
            confidence=1.0
        )
        db.add(new_kb)
        db.commit()
        
        send_whatsapp_message(business.escalation_phone, "Reply sent to customer and saved to knowledge base! ✅")
    else:
        # If no escalation, maybe owner is just testing or adding manual KB?
        # For now, just echo.
        send_whatsapp_message(business.escalation_phone, "No pending questions to reply to. You're all caught up! 😎")
