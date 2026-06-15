import json
from google import genai
from google.genai import types
from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def analyze_message_phase2(message_text: str) -> dict:
    """
    ใช้ Gemini 2.5 Flash ทำการสกัดข้อมูลหมวดหมู่แบบหลายหมวดหมู่, 
    ร่างคำตอบ และสกัดข้อมูลบันทึกตารางนัดหมายส่งของ (Entity Extraction)
    """
    if not settings.GEMINI_API_KEY:
        return {
            "categories": ["General"], 
            "suggested_reply": "กรุณาตั้งค่า API Key", 
            "schedule": None
        }

    prompt = f"""
    คุณคือผู้ช่วยบริหารจัดการแชทกลุ่มลูกค้าอัจฉริยะ (B2B Customer Support)
    จงอ่านข้อความของลูกค้าในกลุ่ม LINE ต่อไปนี้ แล้ววิเคราะห์ข้อมูลส่งกลับมาเป็นรูปแบบ JSON ที่มี Key ดังนี้เท่านั้น:
    1. "categories": อาเรย์ของหมวดหมู่ (เลือกได้มากกว่า 1 อันหากลูกค้าพิมพ์หลายเรื่อง) จากกลุ่มนี้เท่านั้น: ['New Order', 'Check Status', 'Billing', 'General Inquiry']
    2. "suggested_reply": ร่างข้อความตอบกลับภาษาไทยที่สุภาพและเป็นทางการ
    3. "schedule": หากลูกค้ามีการพูดถึงวัน เวลา หรือการนัดหมายส่งมอบของ ให้สรุปออกมาใน Key ย่อย:
        - "should_create": true (หากตรวจพบนัดหมายจริง) หรือ false
        - "title": ข้อความสรุปสั้นๆ เช่น "นัดรับสินค้าออเดอร์ใหม่"
        - "date_text": ข้อความวันที่หรือเวลาที่ลูกค้าพูดถึง เช่น "วันศุกร์นี้ช่วงบ่ายโมง"

    ข้อความจากลูกค้า: "{message_text}"
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini Phase 2 Error: {e}")
        return {
            "categories": ["General"], 
            "suggested_reply": "ขออภัย ระบบช่วยคิดคำตอบขัดข้อง", 
            "schedule": None
        }