from sqlalchemy import create_engine, select
from app.db.models import KBEntry, Base
from app.db.session import SessionLocal

def inspect_db():
    db = SessionLocal()
    try:
        entries = db.query(KBEntry).filter(KBEntry.source == "document").all()
        print(f"Found {len(entries)} document entries.")
        for e in entries:
            print(f"ID: {e.id}, Question: '{e.question}', Source: '{e.source}'")
            # Print first 50 chars of answer to verify it's not empty
            print(f"   Answer (Preview): {e.answer[:50]}...")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    inspect_db()
