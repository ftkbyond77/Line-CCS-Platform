from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MessageSchema(BaseModel):
    id: int
    ticket_id: int
    sender_id: str
    sender_name: Optional[str] = None
    message_text: str
    timestamp: datetime

    # แก้ไขจาก registrar_mode / from_attributes ให้เป็นแบบนี้เพื่อความชัวร์ใน v2
    model_config = {"from_attributes": True}

class TicketSchema(BaseModel):
    id: int
    line_group_id: Optional[str] = None
    line_user_id: str
    status: str
    category: str
    agent_id: Optional[str] = None
    ai_suggestion: Optional[str] = None
    created_at: datetime
    messages: List[MessageSchema] = []

    model_config = {"from_attributes": True}

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    agent_id: Optional[str] = None

class ReplyRequest(BaseModel):
    reply_text: str