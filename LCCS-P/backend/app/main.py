from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import webhook, tickets

# สร้างตารางฐานข้อมูลอัตโนมัติสำหรับเวอร์ชัน PoC
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Line-CCS Platform Backend (Phase 1 PoC)")

# อนุญาตให้ Next.js ฝั่ง Frontend ยิงมาหาได้สะดวก ไม่ติดปัญหา CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ใน Production ค่อยปรับให้ปลอดภัยขึ้นครับ
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook.router)
app.include_router(tickets.router)

@app.get("/")
def root():
    return {"message": "Line-CCS API is running smoothly."}