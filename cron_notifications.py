import os
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models import Business, Message, Escalation
from app.services.twilio import send_whatsapp_message
from datetime import datetime, timedelta

def send_daily_reports():
    db: Session = SessionLocal()
    try:
        businesses = db.query(Business).all()
        
        yesterday = datetime.utcnow() - timedelta(days=1)
        
        print(f"Starting Daily Reports for {len(businesses)} businesses...")
        
        for biz in businesses:
            if not biz.escalation_phone:
                continue
                
            # Stats for last 24h (Simplified to 'all time' or just 'today' for demo)
            # using 'timestamp' column in Message
            
            total_msgs = db.query(Message).filter(
                Message.business_id == biz.id, 
                Message.sender == 'customer',
                Message.timestamp >= yesterday
            ).count()
            
            # AI Handled = Total - Pending Escalations (approx)
            # Or assume escaped = escalations
            escalations = db.query(Escalation).join(Message).filter(
                Message.business_id == biz.id,
                Message.timestamp >= yesterday
            ).count()
            
            ai_count = total_msgs - escalations
            if ai_count < 0: ai_count = 0
            
            time_saved = ai_count * 2 # mins
            
            if total_msgs == 0:
                # Retention hook: Even if 0, send a nudge? 
                # "No queries today, but we're ready for tomorrow!"
                continue
            
            msg = (
                f"📊 *Daily Summary for {biz.name}*\n\n"
                f"🤖 AI Handled: {ai_count}\n"
                f"🚨 Escalations: {escalations}\n"
                f"⏳ Time Saved: ~{time_saved} mins\n\n"
                f"Check your dashboard for details!"
            )
            
            try:
                send_whatsapp_message(biz.escalation_phone, msg)
                print(f"Sent report to {biz.name} ({biz.escalation_phone})")
            except Exception as e:
                print(f"Failed to send to {biz.name}: {e}")
                
    finally:
        db.close()

if __name__ == "__main__":
    send_daily_reports()
