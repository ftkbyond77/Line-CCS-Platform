from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from app.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    line_group_id = Column(String, index=True, nullable=True)  # รองรับ LINE Group
    line_user_id = Column(String, index=True)                  # คนเปิดเคส
    status = Column(String, default="Open")                   # Open, In Progress, Resolved
    category = Column(String, default="General")               # ดึงมาจาก AI
    agent_id = Column(String, nullable=True)                  # Agent ที่ดูแล
    ai_suggestion = Column(Text, nullable=True)                # คำตอบที่ AI แนะนำล่าสุด
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    messages = relationship("Message", back_populates="ticket")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    sender_id = Column(String)                                 # LINE user ID หรือ "Agent"
    sender_name = Column(String, nullable=True)                # ชื่อเล่นใน LINE
    message_text = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    ticket = relationship("Ticket", back_populates="messages")