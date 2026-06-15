import json
from google import genai
from google.genai import types
from app.config import settings


client = genai.Client(api_key=settings.GEMINI_API_KEY)

def analyze_message_with_ai(message_text: str) -> dict:
    """
    วิเคราะห์ข้อความลูกค้าเพื่อแยก Category และเสนอแนะคำตอบ (Suggested Reply)
    """
    if not settings.GEMINI_API_KEY:
        return {"category": "General", "suggested_reply": "โปรดตั้งค่า GEMINI_API_KEY"}

    prompt = f"""
    คุณคือผู้ช่วยอัจฉริยะของทีม Customer Service
    จงวิเคราะห์ข้อความต่อไปนี้ของลูกค้าที่ส่งเข้ามาใน LINE 
    แล้วตอบกลับเป็นรูปแบบ JSON ที่มี key ดังนี้เท่านั้น:
    1. "category": เลือกหมวดหมู่ที่เหมาะสมที่สุดจากกลุ่มนี้เท่านั้น: ['New Order', 'Check Status', 'Billing', 'General Inquiry']
    2. "suggested_reply": ร่างข้อความตอบกลับลูกค้าภาษาไทยที่สุภาพ กระชับ และตรงประเด็นเพื่อช่วยให้ Agent นำไปกดส่งได้ทันที

    ข้อความจากลูกค้า: "{message_text}"
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {"category": "General", "suggested_reply": "ขออภัย ระบบช่วยคิดคำตอบขัดข้อง"}