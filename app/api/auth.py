from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.db.models import Business
from app.services.twilio import send_whatsapp_message
from app.core.security import get_password_hash, verify_password, create_access_token
import random

router = APIRouter()

class SignupRequest(BaseModel):
    username: str
    company_name: str
    phone_number: str
    category: str
    address: str
    latitude: float
    longitude: float

class LoginRequest(BaseModel):
    username: str
    auth_code: str

@router.post("/auth/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    # Check if username or phone exists
    existing = db.query(Business).filter(
        (Business.username == request.username) | (Business.phone_number == request.phone_number)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or Phone already registered")
    
    # Generate Code (6 digits)
    code = str(random.randint(100000, 999999))
    hashed_code = get_password_hash(code)
    
    # Create Business
    new_business = Business(
        username=request.username,
        name=request.company_name,
        phone_number=request.phone_number,
        escalation_phone=request.phone_number, # Default to same number
        auth_code=hashed_code,
        category=request.category.lower(),
        address=request.address,
        latitude=request.latitude,
        longitude=request.longitude
    )
    db.add(new_business)
    db.commit()
    
    # Send Code via Twilio
    msg = f"Your Access Code for {request.company_name} is: {code}. Keep it safe!"
    send_whatsapp_message(request.phone_number, msg)
    
    # Also print to console for MVP/Testing if Twilio fails or is mocked
    print(f"=== SIGNUP CODE for {request.username}: {code} ===")
    
    # MODIFIED: Return code directly for UI display as per user request
    return {
        "status": "success", 
        "message": "Account created.", 
        "code": code # Expose code to frontend
    }

@router.post("/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Business).filter(Business.username == request.username).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid username or code")
    
    if not verify_password(request.auth_code, user.auth_code):
        raise HTTPException(status_code=400, detail="Invalid username or code")
    
    # Create Token
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "username": user.username}

class RecoveryRequest(BaseModel):
    phone_number: str
    type: str # 'username' or 'code'

@router.post("/auth/recover")
def recover(request: RecoveryRequest, db: Session = Depends(get_db)):
    user = db.query(Business).filter(Business.phone_number == request.phone_number).first()
    if not user:
        # Avoid user enumeration attacks in production, but for MVP be helpful
        raise HTTPException(status_code=404, detail="Phone number not registered")
    
    if request.type == 'username':
        msg = f"Your Shopper Username is: {user.username}"
        send_whatsapp_message(user.phone_number, msg)
        print(f"=== RECOVERY USERNAME for {user.phone_number}: {user.username} ===")
        return {"status": "success", "message": f"Username sent to {user.phone_number} (check WhatsApp)"}
    
    elif request.type == 'code':
        # Generate new code
        new_code = str(random.randint(100000, 999999))
        user.auth_code = get_password_hash(new_code)
        db.commit()
        
        msg = f"Your NEW Access Code for {user.name} is: {new_code}. Use this to login."
        send_whatsapp_message(user.phone_number, msg)
        print(f"=== RECOVERY NEW CODE for {user.phone_number}: {new_code} ===")
        return {"status": "success", "message": f"New Access Code sent to {user.phone_number} (check WhatsApp)"}
    
    else:
         raise HTTPException(status_code=400, detail="Invalid recovery type")
