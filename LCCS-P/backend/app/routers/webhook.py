from fastapi import APIRouter, Request, Depends, BackgroundTasks, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Ticket, Message
from app.services.line_service import get_line_profile
from app.services.gemini_service import analyze_message_with_ai


router = APIRouter(prefix="/webhook", tags=["Webhook"])

def process_webhook_event(event: dict, db: Session):
    if event.get("type") != "message" or event["message"].get("type") != "text":
        return

    source = event["source"]
    user_id = source.get("userId")
    group_id = source.get("groupId")  # จะมีค่าเมื่อคุยกันใน LINE Group
    message_text = event["message"]["text"]
    
    # 1. ระบุตัวตนลูกค้าและดึงชื่อโปรไฟล์
    sender_name = get_line_profile(user_id, group_id)
    
    # 2. ค้นหา Ticket เดิมที่ยังคุยค้างอยู่ (Conversation Threading)
    # ถ้าเป็นแชทกลุ่ม หาจาก group_id ที่สถานะยังไม่ปิด / ถ้าแชทเดี่ยวหาจาก user_id
    if group_id:
        ticket = db.query(Ticket).filter(Ticket.line_group_id == group_id, Ticket.status != "Resolved").first()
    else:
        ticket = db.query(Ticket).filter(Ticket.line_user_id == user_id, Ticket.status != "Resolved").first()

    # 3. ถ้าไม่มี Ticket ที่เปิดอยู่ หรือปิดไปแล้ว -> ให้สร้าง Ticket ใหม่ (Auto Ticket Creation)
    if not ticket:
        # ส่งให้ Gemini แยกหมวดหมู่และแนะนำคำตอบแบบ Real-time
        ai_analysis = analyze_message_with_ai(message_text)
        
        ticket = Ticket(
            line_group_id=group_id,
            line_user_id=user_id,
            status="Open",
            category=ai_analysis.get("category", "General"),
            ai_suggestion=ai_analysis.get("suggested_reply", "")
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
    else:
        # หากเป็น Ticket เดิม แต่มีข้อความใหม่เข้ามา -> ให้ AI อัปเดตคำแนะนำสั้นๆ ใหม่ตามบริบท
        ai_analysis = analyze_message_with_ai(message_text)
        ticket.ai_suggestion = ai_analysis.get("suggested_reply", "")
        db.commit()

    # 4. บันทึกประวัติข้อความลงแชทเพื่อเอาไปวาด UI ฝั่งเว็บ
    new_message = Message(
        ticket_id=ticket.id,
        sender_id=user_id,
        sender_name=sender_name,
        message_text=message_text
    )
    db.add(new_message)
    db.commit()

@router.post("")
async def line_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        body = await request.json()
    except Exception:
        # หากเกิดข้อผิดพลาดในการอ่าน JSON (เช่น การกด Verify จากหน้าเว็บ) ให้ส่ง 200 OK กลับไปทันที
        return JSONResponse(status_code=status.HTTP_200_OK, content={"status": "verified"})
        
    events = body.get("events", [])
    
    # ถ้าไม่มี event ส่งมา (เป็นอาเรย์ว่าง ซึ่งมักเกิดตอนกดปุ่ม Verify) ให้ตอบกลับทันที
    if not events:
        return JSONResponse(status_code=status.HTTP_200_OK, content={"status": "no events"})
        
    for event in events:
        # ใช้ BackgroundTasks เพื่อให้ตอบกลับ LINE Webhook (200 OK) ได้เร็วที่สุด
        background_tasks.add_task(process_webhook_event, event, db)
        
    return JSONResponse(status_code=status.HTTP_200_OK, content={"status": "ok"})