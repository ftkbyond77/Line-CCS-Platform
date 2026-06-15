import React from 'react';
import { Ticket } from '@/types';

interface TicketDetailProps {
  ticket: Ticket;
  onStatusChange: (status: string) => Promise<void>;
  onUseAISuggestion: (text: string) => void;
}

export default function TicketDetail({ ticket, onStatusChange, onUseAISuggestion }: TicketDetailProps) {
  return (
    <div className="w-80 border-l border-slate-200 bg-white p-4 flex flex-col gap-4 h-full overflow-y-auto">
      {/* ส่วนควบคุมสถานะและการมอบหมายสไตล์ Jira  */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Workflow Management</h4>
        <div className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div>
            <label className="text-[11px] text-slate-500 font-medium">สถานะตั๋ว:</label>
            <select
              value={ticket.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white text-slate-700 font-medium mt-0.5"
            >
              <option value="Open">Open (เปิดเคสค้าง)</option>
              <option value="In Progress">In Progress (กำลังตามเรื่อง)</option>
              <option value="Resolved">Resolved (ปิดงานเสร็จสิ้น)</option>
            </select>
          </div>
          <div className="mt-1">
            <span className="text-[11px] text-slate-500 block">ผู้รับผิดชอบกลุ่มนี้:</span>
            <span className="text-xs font-bold text-slate-700 font-mono">👤 {ticket.account?.owner_agent_id || 'ไม่มี'}</span>
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* บันทึกช่วยจำนัดหมายส่งมอบสินค้าที่ AI สกัดออกมาจากประโยคแชท 🗓️  */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">🗓️ บันทึกตารางนัดหมายส่งของ</h4>
        {ticket.schedules && ticket.schedules.length > 0 ? (
          <div className="flex flex-col gap-2">
            {ticket.schedules.map((sched) => (
              <div key={sched.id} className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 text-xs shadow-sm">
                <div className="font-bold text-amber-800 flex items-center justify-between">
                  <span>📌 {sched.title}</span>
                </div>
                <p className="text-[11px] text-amber-700/90 mt-1 font-medium bg-amber-100/50 p-1 rounded">
                  🗓️ กำหนด: {sched.target_date || "ไม่ได้ระบุวันชัดเจน"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic text-center p-3 border border-dashed border-slate-100 rounded-xl">
            ยังไม่มีบันทึกข้อตกลงนัดส่งของในห้องแชทนี้
          </p>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* AI Suggestion Box */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Suggested Reply</h4>
        </div>

        {ticket.ai_suggestion ? (
          <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 flex flex-col justify-between gap-2">
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{ticket.ai_suggestion}"
            </p>
            <button
              onClick={() => onUseAISuggestion(ticket.ai_suggestion || '')}
              className="w-full bg-purple-600 text-white rounded-lg py-1.5 text-xs font-medium hover:bg-purple-700 transition-colors shadow-sm"
            >
              ดึงข้อความนี้ไปแก้ไขและส่งออก
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic p-4 text-center border border-dashed border-slate-200 rounded-xl">
            กำลังรอข้อความถัดไปจากลูกค้า...
          </div>
        )}
      </div>
    </div>
  );
}