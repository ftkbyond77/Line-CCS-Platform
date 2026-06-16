from fastapi import APIRouter, Request, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Account, Ticket, Message
from app.services.line_service import get_line_profile


router = APIRouter(prefix="/webhook", tags=["Webhook"])

def process_webhook_manual(event: dict, db: Session):
    if event.get("type") != "message" or event["message"].get("type") != "text":
        return

    source = event["source"]
    user_id = source.get("userId")
    group_id = source.get("groupId") 
    message_text = event["message"]["text"]
    
    try:
        sender_name = get_line_profile(user_id, group_id)
        if not sender_name:
            sender_name = f"ลูกค้า LINE"
    except Exception:
        sender_name = f"ลูกค้า"
    
    account = db.query(Account).filter(Account.line_group_id == group_id).first() if group_id else None
    if group_id and not account:
        account = Account(line_group_id=group_id, company_name=f"🏢 กลุ่มลูกค้า ({group_id[:5]})")
        db.add(account)
        db.commit()
        db.refresh(account)
        
    ticket = db.query(Ticket).filter(Ticket.account_id == account.id, Ticket.status != "Resolved").first() if account else None


    if not ticket:
        ticket = Ticket(
            account_id=account.id if account else None,
            status="Open",
            stage="รับ order", # เข้า Workflow สเตจแรก
            is_replied=False   # ติดไฟแดงรอพนักงานตอบ
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
    else:
        # มีแชทเก่าอยู่แล้ว แค่อัปเดตว่ายังไม่ได้ตอบ
        ticket.is_replied = False 
        db.commit()

    # บันทึกข้อความแชทลง Database ตามปกติ
    new_msg = Message(
        ticket_id=ticket.id,
        sender_id=user_id if user_id else "Customer",
        sender_name=sender_name,
        message_text=message_text
    )
    db.add(new_msg)
    
        
    db.commit()

@router.post("")
async def line_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(status_code=200, content={"status": "verified"})
        
    events = body.get("events", [])
    for event in events:
        background_tasks.add_task(process_webhook_manual, event, db)
        
    return JSONResponse(status_code=200, content={"status": "ok"})