from sqlalchemy.orm import Session
from app.db.models import Business, KBEntry, Message, Escalation, UserSession
from app.services.twilio import send_whatsapp_message
from datetime import datetime
from app.services.ai import get_embedding, generate_answer
from app.services.vector_store import vector_store
from app.services.translation import detect_language, translate_text
from app.services.voice import handle_voice_message
from app.services.places import search_nearby_places
import json

def router(db: Session, from_number: str, body: str, to_number: str, media_url: str = None, latitude: float = None, longitude: float = None):
    """
    Main Router:
    1. Checks if it's an Owner (Business) -> `handle_owner_message`
    2. Checks User Session State -> `handle_customer_flow`
    """
    clean_from = from_number.replace("whatsapp:", "")
    clean_to = to_number.replace("whatsapp:", "")

    # Handle Voice
    if media_url:
        voice_text = handle_voice_message(media_url)
        body = voice_text 
    
    body = body.strip()

    # 1. Check if it's an Owner (Escalation Reply)
    # We need to see if this number matches ANY business's escalation phone
    business_owner = db.query(Business).filter(Business.escalation_phone == clean_from).first()
    if business_owner:
        # It's an owner. Is it a reply to an escalation?
        # Simplification: Assume owner ALWAYS wants to reply to pending escalations for now.
        # Or checking if they are in "Chatting" mode via the generic user session too?
        # For MVP, let's keep the existing logic for owners: they invoke handle_owner_message
        handle_owner_message(db, business_owner, body)
        return

    # 2. It's a Customer (Consumer)
    # Get or Create Session
    session = db.query(UserSession).filter(UserSession.phone_number == clean_from).first()
    if not session:
        session = UserSession(phone_number=clean_from, state="SEARCH_CATEGORY")
        db.add(session)
        db.commit()

    # Log message (Generic log for now, or linked to specific business if in CHATTING state)
    # If not chatting, we don't have a business_id. We might need a "System" bucket or nullable business_id in Message.
    # Current DB Model requires business_id (ForeignKey). 
    # Workaround: If searching, don't log to Message table (which is for Business Chat).
    # OR create a "Platform" dummy business.
    # For MVP: Only log when state == CHATTING.

    handle_customer_flow(db, session, body, latitude, longitude)


def handle_customer_flow(db: Session, session: UserSession, body: str, lat: float = None, lon: float = None):
    """
    State Machine for Customer
    """
    print(f"DEBUG: Customer {session.phone_number} State: {session.state} Input: {body}")

    # STATE: SEARCH_CATEGORY (Start)
    
    # GLOBAL COMMANDS (Work in any state)
    if body.lower().strip() in ["exit", "menu", "restart", "cancel", "hi", "hello"]:
        session.state = "SEARCH_CATEGORY"
        session.connected_business_id = None
        db.commit()
        send_whatsapp_message(session.phone_number, 
            "👋 Welcome back! \n\nWhat are you looking for today? (e.g., Bakery, Clinic, Salon)")
        return

    if session.state == "SEARCH_CATEGORY":
        
        if body.lower() in ["hi", "hello", "hey", "start", "menu"]:
             send_whatsapp_message(session.phone_number, 
                "👋 Welcome back to Shopper! \nI can help you find nearby shops.\n\nWhat are you looking for today? (e.g., Bakery, Clinic, Salon)")
             return

        # They typed a category (e.g. "Bakery")
        session.last_search_results = {"category": body}
        
        # KEY CHANGE: Check if we have a saved location
        if session.last_latitude and session.last_longitude:
            session.state = "VERIFY_LOCATION"
            db.commit()
            send_whatsapp_message(session.phone_number, 
                f"📍 I remember your last location.\n\nShould I search for **{body}** around there?\n\nReply **Yes** or **No**.")
            return
        else:
            # No saved location, ask for it
            session.state = "SEARCH_LOCATION"
            db.commit()
            send_whatsapp_message(session.phone_number, 
                f"👍 Finding a **{body}**.\n\nPlease share your **Current Location** 📍 (Tap the + or Paperclip icon -> Location -> Send Your Current Location).")
            return

    # STATE: VERIFY_LOCATION (New)
    if session.state == "VERIFY_LOCATION":
        if body.lower() in ["yes", "y", "yeah", "ok"]:
            # Use stored location
            lat = session.last_latitude
            lon = session.last_longitude
            # Proceed to search (Reuse code or jump to SEARCH_LOCATION logic passing lat/lon?)
            # Let's perform search directly here to avoid state jumping complexity.
            
            category = session.last_search_results.get("category", "general")
            send_whatsapp_message(session.phone_number, f"🔎 Searching for **{category}** near your saved location...")
            
            results = search_nearby_places(db, category, lat, lon)
            
            if not results:
                 send_whatsapp_message(session.phone_number, f"😔 Sorry, no {category} found nearby.")
                 session.state = "SEARCH_CATEGORY"
                 db.commit()
                 return
                 
            # Format Results
            msg = f"🔎 **Top {category}s nearby:**\n\n"
            stored_results = []
            for i, place in enumerate(results):
                idx = i + 1
                icon = "⭐" if place['is_affiliated'] else ""
                tag = "(Chat Available ⚡)" if place['is_affiliated'] else "(Info Only - Call to Order)"
                msg += f"{idx}. *{place['name']}* {icon} {tag}\n   📍 {place['distance']}km away\n\n"
                stored_results.append(place)
                
            msg += "Reply with the **Number** (e.g., '1') to connect."
            
            session.last_search_results = stored_results # List of dicts
            session.state = "SELECT_SHOP"
            db.commit()
            
            send_whatsapp_message(session.phone_number, msg)
            return

        else:
            # User said No (or something else) -> Ask for new location
            session.state = "SEARCH_LOCATION"
            db.commit()
            send_whatsapp_message(session.phone_number, "Okay! Please share your **New Location** 📍.")
            return

    # STATE: SEARCH_LOCATION (Waiting for Lat/Long)
    if session.state == "SEARCH_LOCATION":
        if not lat or not lon:
            if len(body) > 3:
                # Mock: Assume Indiranagar coords
                 lat = 37.7749
                 lon = -122.4194
                 send_whatsapp_message(session.phone_number, "📍 Using assumed location for demo (San Francisco/Mock).")
            else:
                send_whatsapp_message(session.phone_number, "Please share your location using the attachment button 📎 so I can find nearest shops!")
                return
        
        # SAVE LOCATION for future
        session.last_latitude = lat
        session.last_longitude = lon
        session.last_location_time = datetime.utcnow()
        db.commit()

        # Perform Search
        category = session.last_search_results.get("category", "general")
        results = search_nearby_places(db, category, lat, lon)
        
        if not results:
             send_whatsapp_message(session.phone_number, f"😔 Sorry, no {category} found nearby.")
             session.state = "SEARCH_CATEGORY"
             db.commit()
             return
             
        # Format Results
        msg = f"🔎 **Top {category}s nearby:**\n\n"
        stored_results = []
        for i, place in enumerate(results):
            idx = i + 1
            icon = "⭐" if place['is_affiliated'] else ""
            tag = "(Chat Available ⚡)" if place['is_affiliated'] else "(Info Only - Call to Order)"
            msg += f"{idx}. *{place['name']}* {icon} {tag}\n   📍 {place['distance']}km away\n\n"
            stored_results.append(place)
            
        msg += "Reply with the **Number** (e.g., '1') to connect."
        
        session.last_search_results = stored_results # List of dicts
        session.state = "SELECT_SHOP"
        db.commit()
        
        send_whatsapp_message(session.phone_number, msg)
        return

    # STATE: SELECT_SHOP
    if session.state == "SELECT_SHOP":
        try:
            choice = int(body) - 1
            stored_results = session.last_search_results
            if choice < 0 or choice >= len(stored_results):
                raise ValueError
                
            selected_place = stored_results[choice]
            
            if selected_place['is_affiliated']:
                # CONNECT!
                session.connected_business_id = selected_place['id']
                session.state = "CHATTING"
                db.commit()
                
                # Retrieve Business Name
                biz = db.query(Business).filter(Business.id == session.connected_business_id).first()
                
                send_whatsapp_message(session.phone_number, 
                    f"✅ Connected to *{biz.name}*!\n\nHello! How can I help you today? (Ask about products, timings, etc.)")
            else:
                # External
                send_whatsapp_message(session.phone_number, 
                    f"ℹ️ *{selected_place['name']}* is not affiliated with our platform yet.\n\nYou can visit them at: {selected_place['address']}.\n\nType 'hi' to search again.")
                session.state = "SEARCH_CATEGORY"
                db.commit()
                
        except (ValueError, TypeError):
             send_whatsapp_message(session.phone_number, "Please request a valid number (e.g., 1, 2, 3).")
        return

    # STATE: CHATTING (Proxy to Original Logic)
    if session.state == "CHATTING":
        # Check for exit command
        if body.lower() in ["exit", "quit", "menu", "search"]:
            session.state = "SEARCH_CATEGORY"
            session.connected_business_id = None
            db.commit()
            send_whatsapp_message(session.phone_number, "🔌 Disconnected. \n\nWhat are you looking for? (e.g. Bakery, Clinic)")
            return

        # Use the connected business
        business = session.connected_business
        
        # We need to adapt the old logic to work here.
        # The old logic assumed we Just Created a message.
        # Let's recreate the Message object logic here.
        
        db_msg = Message(
            business_id=business.id,
            sender="customer",
            sender_id=session.phone_number, # "whatsapp:..." format isn't here? 'clean_from' is phone.
            text=body,
            timestamp=datetime.utcnow()
        )
        db.add(db_msg)
        db.commit()
        db.refresh(db_msg)
        
        # Populate Vector Store if needed (lazy load for this biz session?)
        # For prototype, we assume Global Vector Store has EVERYTHING? 
        # CAUTION: Vector Store currently mixes everything. 
        # We need to filter search by business_id (metadata filter) or wipe/load on connect.
        # MVP: Load on first message of session? Or just filter results.
        # VectorStore doesn't support easy metadata filtering in `index.search`.
        # WE MUST LOAD context for this business.
        
        # HACK: Clear and Reload Vector Store for this Business every time? (Slow but safe for MVP)
        # Better: Do it once when entering CHATTING state?
        # Let's do a quick optimized reload:
        # Check if vector store has entries for this business? Hard to check.
        # Let's just Reload.
        vector_store.rebuild_index([]) # Clear
        kb_entries = db.query(KBEntry).filter(KBEntry.business_id == business.id).all()
        for entry in kb_entries:
            emb = get_embedding(entry.question)
            vector_store.add_entry(entry.question, {"answer": entry.answer}, emb)
            
        handle_customer_message(db, business, session.phone_number, body, db_msg)


def handle_customer_message(db: Session, business: Business, customer_phone: str, query: str, db_msg: Message):
    """
    Search KB (Vector + AI) and reply or escalate.
    Handles Multilingual logic.
    """
    # 1. Detect Language
    lang = detect_language(query)
    
    # 2. Translate to English if needed
    query_en = query
    if lang != "en":
        query_en = translate_text(query, "en")

    # 3. Vector Search (using English query)
    query_emb = get_embedding(query_en)
    results = vector_store.search(query_emb, k=3)
    
    context = ""
    for res in results:
        if res['distance'] < 1.0: 
            context += f"- A: {res['entry']['answer']}\n"
    
    # 4. AI Generation
    # START RELIABILITY CHECK
    if not business.ai_enabled:
         print(f"[{customer_phone}] AI Disabled. Escalating.")
         confidence = 0.0
         answer_en = "AI Disabled"
    elif context:
        answer_en, confidence = generate_answer(context, query_en)
    else:
        answer_en, confidence = "I don't know", 0.0
    
    # Check for "I don't know" explicitly from prompt
    if "I don't know" in answer_en:
        confidence = 0.0

    if confidence > 0.7:
        # 5. Translate Response back to User Language
        final_answer = translate_text(answer_en, lang) if lang != "en" else answer_en
        
        send_whatsapp_message(customer_phone, final_answer)
        bot_msg = Message(business_id=business.id, sender="bot", sender_id="system", text=final_answer)
        db.add(bot_msg)
        db.commit()
    else:
        # Escalate
        escalation_msg = "Let me confirm this and get back to you 😊"
        if not business.ai_enabled:
             escalation_msg = "I've forwarded your request to the owner."

        final_escalation_msg = translate_text(escalation_msg, lang) if lang != "en" else escalation_msg
        
        send_whatsapp_message(customer_phone, final_escalation_msg)
        bot_msg = Message(business_id=business.id, sender="bot", sender_id="system", text=final_escalation_msg)
        db.add(bot_msg)
        
        # Notify Owner
        reason = "AI Disabled" if not business.ai_enabled else "Low Confidence"
        escalation_text = f"🚨 New Customer Query ({reason}) from {customer_phone}:\n\n'{query}'\n\nReply to answer."
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
        
        # Vector update happens dynamically in CHATTING loop now
        
        send_whatsapp_message(business.escalation_phone, "Reply sent to customer and saved to knowledge base! ✅")
    else:
        send_whatsapp_message(business.escalation_phone, "No pending questions to reply to. You're all caught up! 😎")
