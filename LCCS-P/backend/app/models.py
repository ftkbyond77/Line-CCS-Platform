from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import datetime
# ใช้ timezone offset สำหรับประเทศไทย (+7 ชั่วโมง)
def bkk_now():
    return datetime.datetime.utcnow() + datetime.timedelta(hours=7)

from app.database import Base

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    line_group_id = Column(String, unique=True, index=True, nullable=True)
    company_name = Column(String, default="บริษัทลูกค้าใหม่")
    owner_agent_id = Column(String, default="Unassigned")
    
    tickets = relationship("Ticket", back_populates="account")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    status = Column(String, default="Open")
    category = Column(String, default="General")
    is_replied = Column(Boolean, default=False)
    ai_suggestion = Column(Text, nullable=True)
    created_at = Column(DateTime, default=bkk_now) # เปลี่ยนเป็นเวลาไทย
    updated_at = Column(DateTime, default=bkk_now, onupdate=bkk_now) # เปลี่ยนเป็นเวลาไทย

    account = relationship("Account", back_populates="tickets")
    messages = relationship("Message", back_populates="ticket")
    schedules = relationship("Schedule", back_populates="ticket")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    sender_id = Column(String)
    sender_name = Column(String, nullable=True)
    message_text = Column(Text)
    timestamp = Column(DateTime, default=bkk_now) # เปลี่ยนเป็นเวลาไทย

    ticket = relationship("Ticket", back_populates="messages")

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    title = Column(String)
    note = Column(Text, nullable=True)
    target_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=bkk_now) # เปลี่ยนเป็นเวลาไทย

    ticket = relationship("Ticket", back_populates="schedules")