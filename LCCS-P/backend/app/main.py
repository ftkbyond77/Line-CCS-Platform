from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import webhook, tickets

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Line-CCS Platform Backend", version="2.0")

# ─── บล็อกสำคัญ: เปิดประตูให้ Next.js พอร์ต 3000 ยิงเข้ามาขอข้อมูลได้ ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # ยอมรับหน้าเว็บพอร์ต 3000
    allow_credentials=True,
    allow_methods=["*"], # ยอมรับทุก HTTP Method (GET, POST, PUT)
    allow_headers=["*"],
)

# ลงทะเบียนท่อรับสัญญาณ
app.include_router(webhook.router)
app.include_router(tickets.router)

@app.get("/")
def root():
    return {"status": "Backend Server is running perfectly in Phase 2"}