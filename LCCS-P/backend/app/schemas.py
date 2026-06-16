from pydantic import BaseModel, ConfigDict
from typing import List, Optional
import datetime

class MessageSchema(BaseModel):
    id: int
    ticket_id: int
    sender_id: str
    sender_name: Optional[str] = None
    message_text: str
    timestamp: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class ScheduleSchema(BaseModel):
    id: int
    ticket_id: int
    title: str
    note: Optional[str] = None
    target_date: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AccountSchema(BaseModel):
    id: int
    line_group_id: Optional[str] = None
    company_name: str
    owner_agent_id: str
    model_config = ConfigDict(from_attributes=True)

class TicketSchema(BaseModel):
    id: int
    account_id: Optional[int] = None
    status: str
    stage: str
    is_replied: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime
    
    account: Optional[AccountSchema] = None
    messages: List[MessageSchema] = []
    schedules: List[ScheduleSchema] = []
    model_config = ConfigDict(from_attributes=True)

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    stage: Optional[str] = None
    agent_id: Optional[str] = None

class ReplyRequest(BaseModel):
    reply_text: str