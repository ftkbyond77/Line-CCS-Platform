import React from 'react';
import { Ticket } from '@/types';

interface KPICardsProps {
  tickets: Ticket[];
}

export default function KPICards({ tickets }: KPICardsProps) {
  // 1. นับจำนวนกลุ่ม/ตั๋วงานทั้งหมดในระบบสไตล์เดี่ยวหรือกลุ่ม
  const totalTickets = tickets.length;
  
  // 2. เคลียร์เออร์เรอร์: ปรับใช้เฉพาะ .length ในการตรวจนับเคสที่ปิดงานเรียบร้อยแล้ว
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  
  // 3. ดักจับปัญหาแชทจม: นับกลุ่มแชทที่ลูกค้าพิมพ์ทักเข้ามาแต่ "ทีมงานยังไม่ได้ตอบ" (is_replied === false) 
  const pendingReplyCount = tickets.filter(t => t.status !== 'Resolved' && !t.is_replied).length;
  
  // 4. กลุ่มแชทที่มีการพูดคุยและตอบกลับเรียบร้อยแล้วชั่วคราว
  const updatedCount = tickets.filter(t => t.status !== 'Resolved' && t.is_replied).length;

  return (
    <div className="grid grid-cols-4 gap-4 mb-4 flex-shrink-0">
      {/* กล่องที่ 1: ตั๋วงานทั้งหมด */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Accounts / Tickets ทั้งหมด</span>
        <span className="text-2xl font-bold text-slate-800 mt-1 block font-mono">{totalTickets}</span>
      </div>

      {/* กล่องที่ 2: ⚠️ แชทจม/ค้างตอบ (ไฟกระพริบเตือนทีมงาน) */}
      <div className={`border p-4 rounded-xl shadow-sm transition-colors ${pendingReplyCount > 0 ? 'bg-rose-50 border-rose-200 animate-pulse-slow' : 'bg-white border-slate-200'}`}>
        <span className={`text-[11px] font-bold uppercase tracking-wider block ${pendingReplyCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
          ⚠️ แชทค้างตอบ (Unreplied)
        </span>
        <span className={`text-2xl font-bold mt-1 block font-mono ${pendingReplyCount > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
          {pendingReplyCount} กลุ่ม
        </span>
      </div>

      {/* กล่องที่ 3: ตอบกลับแล้ว/คุยต่อเนื่อง */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">ทีมงานตอบแล้ว (Replied)</span>
        <span className="text-2xl font-bold text-emerald-600 mt-1 block font-mono">{updatedCount} เคส</span>
      </div>

      {/* กล่องที่ 4: ปิดตั๋วงานสมบูรณ์ */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">ปิดเคสแล้ว (Resolved)</span>
        <span className="text-2xl font-bold text-slate-700 mt-1 block font-mono">{resolvedCount} เคส</span>
      </div>
    </div>
  );
}