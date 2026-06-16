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
    return db.query(Ticket).order_by(Ticket.updated_at.desc()).all()

@router.put("/{ticket_id}")
def update_ticket(ticket_id: int, payload: TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if payload.status:
        ticket.status = payload.status
    if payload.stage:
        ticket.stage = payload.stage
        if payload.stage == "ปิดงาน":
            ticket.status = "Resolved"
    if payload.agent_id and ticket.account:
        ticket.account.owner_agent_id = payload.agent_id
        
    db.commit()
    return {"message": "Updated Workflow"}

@router.post("/{ticket_id}/reply")
def reply_to_line(ticket_id: int, payload: ReplyRequest, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    target_id = ticket.account.line_group_id if (ticket.account and ticket.account.line_group_id) else (ticket.messages[0].sender_id if ticket.messages else "")
    is_group = bool(ticket.account and ticket.account.line_group_id)

    if not target_id:
        raise HTTPException(status_code=400, detail="Target ID Unavailable")

    success = send_line_message(target_id, payload.reply_text, is_group=is_group)
    if success:
        agent_message = Message(ticket_id=ticket.id, sender_id="Agent", sender_name="CS Team", message_text=payload.reply_text)
        db.add(agent_message)
        ticket.is_replied = True # ปลดล็อกไฟแดงเตือนค้างตอบ
        db.commit()
        return {"status": "sent"}
    
    raise HTTPException(status_code=500, detail="Failed to send message")