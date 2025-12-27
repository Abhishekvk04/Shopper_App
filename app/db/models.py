from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone_number = Column(String, unique=True, index=True) # WhatsApp number of the business logic
    escalation_phone = Column(String) # Owner's phone for escalation
    language = Column(String, default="en")

    full_kb = relationship("KBEntry", back_populates="business")
    messages = relationship("Message", back_populates="business")


class KBEntry(Base):
    __tablename__ = "kb_entries"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    question = Column(String, index=True)
    answer = Column(Text)
    confidence = Column(Float, default=1.0)
    source = Column(String, default="manual") # manual, learned

    business = relationship("Business", back_populates="full_kb")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    sender = Column(String) # customer, bot, owner
    sender_id = Column(String) # Phone number of sender
    text = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    business = relationship("Business", back_populates="messages")
    escalation = relationship("Escalation", back_populates="message", uselist=False)


class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    status = Column(String, default="pending") # pending, resolved
    owner_reply = Column(Text, nullable=True)
    
    message = relationship("Message", back_populates="escalation")
