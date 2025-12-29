from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import router as webhook_router
from app.api.dashboard import router as dashboard_router
from app.api.auth import router as auth_router
from app.db.session import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# Enable CORS for Dashboard (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook_router, prefix=settings.API_V1_STR) # /webhook/whatsapp
app.include_router(dashboard_router, prefix=settings.API_V1_STR) # /dashboard/*
app.include_router(auth_router, prefix=settings.API_V1_STR) # /auth/*

@app.get("/")
def read_root():
    return {"message": "AI Front Desk Backend is Running 🚀"}
