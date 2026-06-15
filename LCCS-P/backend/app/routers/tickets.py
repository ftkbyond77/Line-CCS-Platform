from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Ticket, Message
from app.schemas import TicketSchema, TicketUpdate, ReplyRequest
from app.services.line_service import send_line_message

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("", response_model=List[TicketSchema])
def get_all_tickets(db: Session = Depends(get_db)):
    # ดึงรายการ Ticket ทั้งหมดเพื่อไปแสดงผลฝั่ง Left Panel ของ Dashboard
    return db.query(Ticket).order_by(Ticket.updated_at.desc()).all()

@router.get("/{ticket_id}", response_model=TicketSchema)
def get_ticket_detail(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.put("/{ticket_id}")
def update_ticket(ticket_id: int, payload: TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if payload.status:
        ticket.status = payload.status
    if payload.agent_id:
        ticket.agent_id = payload.agent_id
        
    db.commit()
    return {"message": "Updated successfully"}

@router.post("/{ticket_id}/reply")
def reply_to_line(ticket_id: int, payload: ReplyRequest, db: Session = Depends(get_db)):
    """
    ปุ่มกดส่งคำตอบจากฝั่งหน้าเว็บ (พนักงานคุม) ยิงกลับเข้า LINE ลูกค้าหรือกลุ่ม LINE
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # เลือกว่าจะส่งกลับไปที่ Group ID (ถ้ามี) หรือส่งหา User โดยตรง
    target_id = ticket.line_group_id if ticket.line_group_id else ticket.line_user_id
    is_group = True if ticket.line_group_id else False

    # ส่งหา LINE API
    success = send_line_message(target_id, payload.reply_text, is_group=is_group)
    
    if success:
        # บันทึกข้อความฝั่ง Agent ลง Database ด้วย แชทจะได้ไม่หลุดโฟลว์
        agent_message = Message(
            ticket_id=ticket.id,
            sender_id="Agent",
            sender_name="Customer Service Team",
            message_text=payload.reply_text
        )
        db.add(agent_message)
        db.commit()
        return {"status": "sent"}
    
    raise HTTPException(status_code=500, detail="Failed to send message via LINE API")