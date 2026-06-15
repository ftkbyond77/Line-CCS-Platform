from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Ticket, Message, Account
from app.schemas import TicketSchema, TicketUpdate, ReplyRequest
from app.services.line_service import send_line_message

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("", response_model=List[TicketSchema])
def get_all_tickets(db: Session = Depends(get_db)):
    """
    ดึงรายการ Ticket ทั้งหมดพร้อมประวัติและข้อมูล Account 
    เพื่อไปแสดงผลฝั่ง Left Panel ของ Dashboard
    """
    return db.query(Ticket).order_by(Ticket.updated_at.desc()).all()

@router.get("/{ticket_id}", response_model=TicketSchema)
def get_ticket_detail(ticket_id: int, db: Session = Depends(get_db)):
    """
    ดึงรายละเอียดเจาะลึกของแต่ละ Ticket
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.put("/{ticket_id}")
def update_ticket(ticket_id: int, payload: TicketUpdate, db: Session = Depends(get_db)):
    """
    อัปเดตสถานะ (Open, In Progress, Resolved) หรืออัปเดตผู้ดูแลเคสสไตล์ Jira
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if payload.status:
        ticket.status = payload.status
    if payload.agent_id:
        if ticket.account:
            ticket.account.owner_agent_id = payload.agent_id
        
    db.commit()
    return {"message": "Updated successfully"}

@router.post("/{ticket_id}/reply")
def reply_to_line(ticket_id: int, payload: ReplyRequest, db: Session = Depends(get_db)):
    """
    ปุ่มกดส่งคำตอบควบคุมโดยพนักงาน ยิงกลับเข้ากลุ่ม LINE ของบริษัทลูกค้านั้นๆ 
    และทำการสับสวิตช์แก้ปัญหาแชทจมให้อัตโนมัติ
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # ค้นหาเป้าหมายปลายทาง: ถ้าผูกกลุ่ม LINE ให้ส่งเข้ากลุ่ม / ถ้าไม่มีให้ส่งหาตัวบุคคลตรงๆ
    if ticket.account and ticket.account.line_group_id:
        target_id = ticket.account.line_group_id
        is_group = True
    else:
        # กรณีหลุดมาเป็น Chat 1-on-1 ส่วนตัว
        target_id = ticket.messages[0].sender_id if ticket.messages else ""
        is_group = False

    if not target_id:
        raise HTTPException(status_code=400, detail="Cannot find target LINE ID to send message")

    # 1. ยิงสัญญาณออกไปหา LINE Messaging API 
    success = send_line_message(target_id, payload.reply_text, is_group=is_group)
    
    if success:
        # 2. บันทึกข้อความฝั่งพนักงานลงตารางแชทเพื่อไทม์ไลน์ที่ต่อเนื่อง
        agent_message = Message(
            ticket_id=ticket.id,
            sender_id="Agent",
            sender_name="Customer Service Team",
            message_text=payload.reply_text
        )
        db.add(agent_message)
        
        # 3. ไฮไลต์เด็ด Phase 2: ปรับสถานะเป็น True ทันทีเมื่อคนในทีมกดตอบ
        # สัญญาณไฟกระพริบสีแดง "แชทค้าง/จม" ฝั่งหน้าจอเว็บจะดับลงกลายเป็นสีเขียวทันที
        ticket.is_replied = True 
        
        db.commit()
        return {"status": "sent"}
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
        detail="Failed to send message via LINE API"
    )