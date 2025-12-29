from fastapi import APIRouter, Depends, Form, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Message, Escalation, KBEntry, Business
from app.services.document_processor import process_file_upload
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/dashboard/stats")
def get_stats(db: Session = Depends(get_db), current_user: Business = Depends(get_current_user)):
    """
    Returns summary stats for the dashboard (Scoped to User).
    """
    total_queries = db.query(Message).filter(Message.business_id == current_user.id, Message.sender == "customer").count()
    
    # Escalations (Queries that AI failed to answer)
    escaped_queries = db.query(Escalation).join(Message).filter(Message.business_id == current_user.id).count()
    
    unanswered = db.query(Escalation).join(Message).filter(Message.business_id == current_user.id, Escalation.status == "pending").count()
    kb_size = db.query(KBEntry).filter(KBEntry.business_id == current_user.id).count()
    
    # Metrics Calculation
    ai_handled = total_queries - escaped_queries
    if ai_handled < 0: ai_handled = 0 # Safety
    
    time_saved_mins = ai_handled * 2 # Assume 2 mins saved per query
    
    return {
        "total_queries": total_queries,
        "unanswered": unanswered,
        "kb_size": kb_size,
        "ai_handled": ai_handled,
        "time_saved_mins": time_saved_mins,
        "prevented_escalations": int(ai_handled * 0.8) # Marketing number
    }

@router.get("/dashboard/escalations")
def get_escalations(db: Session = Depends(get_db), current_user: Business = Depends(get_current_user)):
    """
    Returns pending escalations.
    """
    escalations = db.query(Escalation).join(Message).filter(
        Message.business_id == current_user.id, 
        Escalation.status == "pending"
    ).all()
    results = []
    for esc in escalations:
        results.append({
            "id": esc.id,
            "query": esc.message.text,
            "sender": esc.message.sender_id,
            "timestamp": esc.message.timestamp
        })
    return results

@router.get("/dashboard/history")
def get_history(limit: int = 20, db: Session = Depends(get_db), current_user: Business = Depends(get_current_user)):
    """
    Returns recent chat history.
    """
    messages = db.query(Message).filter(Message.business_id == current_user.id).order_by(Message.timestamp.desc()).limit(limit).all()
    return messages

@router.get("/knowledge-base")
def get_kb(db: Session = Depends(get_db), current_user: Business = Depends(get_current_user)):
    """
    Returns all KB entries.
    """
    entries = db.query(KBEntry).filter(KBEntry.business_id == current_user.id).all()
    return entries

@router.post("/knowledge-base")
def add_kb_entry(
    question: str = Form(...),
    answer: str = Form(...),
    db: Session = Depends(get_db),
    current_user: Business = Depends(get_current_user)
):
    """
    Adds a new KB entry manually.
    """

    new_entry = KBEntry(
        business_id=current_user.id,
        question=question,
        answer=answer,
        source="manual",
        confidence=1.0
    )
    db.add(new_entry)
    db.commit()
    
    # Update Vector Store
    from app.services.ai import get_embedding
    from app.services.vector_store import vector_store
    
    emb = get_embedding(question)
    vector_store.add_entry(question, {"answer": answer}, emb)
    
    return {"status": "success", "id": new_entry.id}

@router.post("/knowledge-base/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Business = Depends(get_current_user)
):
    """
    Uploads a document (PDF/TXT) for ingestion.
    """
    content = await file.read()
    count = process_file_upload(content, file.filename, db, current_user)
    return {"status": "success", "chunks_added": count, "filename": file.filename}

@router.get("/documents")
def get_documents(db: Session = Depends(get_db), current_user: Business = Depends(get_current_user)):
    """
    Returns list of unique uploaded documents for user.
    """
    # Query distinct questions where source='document'
    docs = db.query(KBEntry.question).filter(
        KBEntry.business_id == current_user.id, 
        KBEntry.source == "document"
    ).distinct().all()
    # docs is list of tuples [('SOURCE: menu.pdf'), ...]
    filenames = [d[0].replace("SOURCE: ", "") for d in docs]
    return filenames

@router.get("/documents/{filename}")
def get_document_content(filename: str, db: Session = Depends(get_db), current_user: Business = Depends(get_current_user)):
    """
    Returns reconstructed content of a document.
    """
    # Find all chunks for this file
    chunks = db.query(KBEntry).filter(
        KBEntry.business_id == current_user.id,
        KBEntry.source == "document",
        KBEntry.question == f"SOURCE: {filename}"
    ).all()
    
    full_text = "\n\n".join([c.answer for c in chunks])
    return {"filename": filename, "content": full_text}

@router.delete("/documents")
def delete_document(filename: str, db: Session = Depends(get_db), current_user: Business = Depends(get_current_user)):
    """
    Deletes a document (and its chunks) from the DB via Query Param.
    Success even if file not found (returns success).
    """
    # Delete from DB
    db.query(KBEntry).filter(
        KBEntry.business_id == current_user.id,
        KBEntry.source == "document",
        KBEntry.question == f"SOURCE: {filename}"
    ).delete(synchronize_session=False)
    db.commit()
    
    return {"status": "success", "deleted": filename}

@router.delete("/documents/{filename}")
def delete_document_legacy(filename: str, db: Session = Depends(get_db)):
    """
    Legacy endpoint for backward compatibility (in case frontend is cached).
    Redirects logic to query param style.
    """
    return delete_document(filename, db)

@router.post("/dashboard/reply")
def reply_to_escalation(
    escalation_id: int = Form(...),
    reply_text: str = Form(...),
    db: Session = Depends(get_db),
    current_user: Business = Depends(get_current_user)
):
    """
    Owner replies to an escalation via Dashboard.
    """
    # 1. Verify Escalation exists and belongs to user
    escalation = db.query(Escalation).join(Message).filter(
        Escalation.id == escalation_id,
        Message.business_id == current_user.id,
        Escalation.status == "pending"
    ).first()
    
    if not escalation:
        # Check if already resolved?
        check = db.query(Escalation).filter(Escalation.id == escalation_id).first()
        if check and check.status == "resolved":
             return {"status": "success", "message": "Already resolved."}
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Escalation not found or already resolved")

    # 2. Logic similar to handle_owner_message
    from app.services.twilio import send_whatsapp_message
    from app.services.translation import detect_language, translate_text
    from app.services.ai import get_embedding
    from app.services.vector_store import vector_store

    original_msg = escalation.message
    customer_phone = original_msg.sender_id
    
    # 3. Reply to customer
    send_whatsapp_message(customer_phone, reply_text)
    
    # 4. Update Escalation
    escalation.status = "resolved"
    escalation.owner_reply = reply_text
    
    # 5. Learn (Add to KB)
    new_kb = KBEntry(
        business_id=current_user.id,
        question=original_msg.text, 
        answer=reply_text,
        source="learned",
        confidence=1.0
    )
    db.add(new_kb)
    db.commit()
    
    # 6. Add to Vector Store
    try:
        lang = detect_language(original_msg.text)
        question_en = original_msg.text
        if lang != "en":
            question_en = translate_text(original_msg.text, "en")

        emb = get_embedding(question_en)
        vector_store.add_entry(question_en, {"answer": reply_text}, emb)
    except Exception as e:
        print(f"Vector Store Update Failed (Non-critical): {e}")

    # 7. Notify Owner on WhatsApp (Confirmation)
    # Optional: We can skip this since they are on the dashboard, 
    # but it's good to have a record on their phone too.
    try:
        send_whatsapp_message(current_user.escalation_phone, f"✅ Resolved via Dashboard: '{original_msg.text}' -> '{reply_text}'")
    except:
        pass

    return {"status": "success"}
