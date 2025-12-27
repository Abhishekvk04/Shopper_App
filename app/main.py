from fastapi import FastAPI
from app.core.config import settings
from app.api.endpoints import router as api_router
from app.db.session import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(api_router, prefix=settings.API_V1_STR) # e.g., /api/webhook/whatsapp would be incorrect if we want /webhook/whatsapp directly or /api/webhook/whatsapp
# Actually, Twilio webhook URL will process whatever we give it. 
# Let's keep it simple: /webhook/whatsapp. 
# Depending on how I included the router:
# If I use prefix, it will be /api/webhook/whatsapp. This is fine.

@app.get("/")
def read_root():
    return {"message": "AI Front Desk Backend is Running 🚀"}
