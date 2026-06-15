from pydantic import BaseModel, ConfigDict
from typing import List, Optional
import datetime

# ─── 1. Schema สำหรับข้อมูลข้อความแชท ───
class MessageSchema(BaseModel):
    id: int
    ticket_id: int
    sender_id: str
    sender_name: Optional[str] = None
    message_text: str
    timestamp: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# ─── 2. Schema สำหรับตารางนัดหมายส่งมอบของ ───
class ScheduleSchema(BaseModel):
    id: int
    ticket_id: int
    title: str
    note: Optional[str] = None
    target_date: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ─── 3. Schema สำหรับกลุ่มบริษัทลูกค้า (Account) ───
class AccountSchema(BaseModel):
    id: int
    line_group_id: Optional[str] = None
    company_name: str
    owner_agent_id: str

    model_config = ConfigDict(from_attributes=True)

# ─── 4. Schema หลักสำหรับตั๋วงาน (Ticket) ขาออกไปยังหน้าเว็บ Dashboard ───
class TicketSchema(BaseModel):
    id: int
    account_id: Optional[int] = None
    status: str
    category: str
    is_replied: bool  # 🌟 เพิ่มเข้ามารองรับระบบดักแชทค้าง/จม
    ai_suggestion: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    
    # 🔗 เชื่อมโยงข้อมูลสัมพันธ์รูปแบบ Object (พาส่งออกไปฝั่ง Next.js ครบเซ็ต)
    account: Optional[AccountSchema] = None
    messages: List[MessageSchema] = []
    schedules: List[ScheduleSchema] = []

    # 🛠️ เอา line_user_id และ line_group_id ออกจากตาราง Ticket ตรงๆ แล้ว 
    # เพื่อป้องกันความผิดพลาด ResponseValidationError 500 ล้างแคชสะอาดเรียบร้อย
    model_config = ConfigDict(from_attributes=True)

# ─── 5. Schemas สำหรับฝั่งรับค่าการอัปเดตข้อมูล (Request Payloads) ───
class TicketUpdate(BaseModel):
    status: Optional[str] = None
    agent_id: Optional[str] = None

class ReplyRequest(BaseModel):
    reply_text: str