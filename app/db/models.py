from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True) 
    name = Column(String, index=True) 
    phone_number = Column(String, unique=True, index=True) 
    escalation_phone = Column(String) 
    auth_code = Column(String) 
    language = Column(String, default="en")

    # New Fields for Discovery
    category = Column(String, index=True, nullable=True) # e.g. bakery, clinic
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String, nullable=True)
    
    # Reliability Control
    ai_enabled = Column(Boolean, default=True)

    full_kb = relationship("KBEntry", back_populates="business")
    messages = relationship("Message", back_populates="business")


class UserSession(Base):
    """
    Tracks the state of a customer's interaction.
    """
    __tablename__ = "user_sessions"

    phone_number = Column(String, primary_key=True, index=True) # The customer's phone
    state = Column(String, default="SEARCH_CATEGORY") # SEARCH_CATEGORY, SEARCH_LOCATION, VERIFY_LOCATION, SELECT_SHOP, CHATTING
    
    # Context for search results
    last_search_results = Column(JSON, nullable=True) # Stores list of suggestions presented to user
    
    # Persist Location
    last_latitude = Column(Float, nullable=True)
    last_longitude = Column(Float, nullable=True)
    last_location_time = Column(DateTime, nullable=True)

    # If chatting with a specific business
    connected_business_id = Column(Integer, ForeignKey("businesses.id"), nullable=True)

    connected_business = relationship("Business")


class KBEntry(Base):
    __tablename__ = "kb_entries"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    question = Column(String, index=True)
    answer = Column(Text)
    confidence = Column(Float, default=1.0)
    source = Column(String, default="manual") 

    business = relationship("Business", back_populates="full_kb")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    sender = Column(String) 
    sender_id = Column(String) 
    text = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    business = relationship("Business", back_populates="messages")
    escalation = relationship("Escalation", back_populates="message", uselist=False)


class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    status = Column(String, default="pending") 
    owner_reply = Column(Text, nullable=True)
    
    message = relationship("Message", back_populates="escalation")
