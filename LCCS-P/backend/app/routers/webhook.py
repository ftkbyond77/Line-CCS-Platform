from fastapi import APIRouter, Request, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Account, Ticket, Message, Schedule
from app.services.line_service import get_line_profile
from app.services.gemini_service import analyze_message_phase2

router = APIRouter(prefix="/webhook", tags=["Webhook"])

def process_webhook_phase2(event: dict, db: Session):
    if event.get("type") != "message" or event["message"].get("type") != "text":
        return

    source = event["source"]
    user_id = source.get("userId")
    group_id = source.get("groupId") 
    message_text = event["message"]["text"]
    
    # 🛠️ ดักจับความปลอดภัยรอบจัด: ป้องกันไม่ให้ฟังก์ชัน get_line_profile ทำระบบแครชจนเกิด 502 Bad Gateway
    try:
        sender_name = get_line_profile(user_id, group_id)
        if not sender_name:
            sender_name = f"ลูกค้า LINE ({user_id[:6]})"
    except Exception as line_err:
        print(f"⚠️ LINE API Profile Fetch Fail (No Group Permission): {line_err}")
        sender_name = f"ลูกค้าในกลุ่ม ({user_id[:5] if user_id else 'Unknown'})"
    
    # 1. จัดการดักจับกลุ่มบริษัทลูกค้า
    account = db.query(Account).filter(Account.line_group_id == group_id).first() if group_id else None
    if group_id and not account:
        account = Account(line_group_id=group_id, company_name=f"🏢 บริษัทจำลอง (Group: {group_id[:5]})")
        db.add(account)
        db.commit()
        db.refresh(account)
        
    # 2. ค้นหาตั๋วงานที่ยังไม่ถูกปิด
    if account:
        ticket = db.query(Ticket).filter(Ticket.account_id == account.id, Ticket.status != "Resolved").first()
    else:
        ticket = None

    # 3. ยิงประมวลผลหมวดหมู่และ Schedule ผ่าน AI Gemini
    ai_res = analyze_message_phase2(message_text)
    categories_str = ", ".join(ai_res.get("categories", ["General Inquiry"]))

    if not ticket:
        ticket = Ticket(
            account_id=account.id if account else None,
            status="Open",
            category=categories_str,
            is_replied=False, # ข้อความลูกค้ามาใหม่ -> สับสวิตช์ขึ้นสีแดงดักแชทจมทันที
            ai_suggestion=ai_res.get("suggested_reply", "")
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
    else:
        ticket.is_replied = False # ตั๋วเดิมมีแชทใหม่ไหลทับ -> เปลี่ยนเป็นค้างตอบ
        ticket.category = categories_str
        ticket.ai_suggestion = ai_res.get("suggested_reply", "")
        db.commit()

    # 4. บันทึกประวัติบทสนทนาลงไทม์ไลน์
    new_msg = Message(
        ticket_id=ticket.id,
        sender_id=user_id if user_id else "Customer",
        sender_name=sender_name,
        message_text=message_text
    )
    db.add(new_msg)
    
    # 5. สกัดข้อมูลตารางโน้ตนัดส่งของ
    sched_data = ai_res.get("schedule")
    if sched_data and sched_data.get("should_create"):
        new_sched = Schedule(
            ticket_id=ticket.id,
            title=sched_data.get("title", "นัดหมายส่งมอบสินค้า"),
            note=message_text,
            target_date=sched_data.get("date_text", "เร็วๆ นี้")
        )
        db.add(new_sched)
        
    db.commit()

@router.post("")
async def line_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(status_code=200, content={"status": "verified"})
        
    events = body.get("events", [])
    if not events:
        return JSONResponse(status_code=200, content={"status": "no events"})
        
    for event in events:
        background_tasks.add_task(process_webhook_phase2, event, db)
        
    return JSONResponse(status_code=200, content={"status": "ok"})