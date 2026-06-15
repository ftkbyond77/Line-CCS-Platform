import React from 'react';
import { Ticket } from '@/types';

interface TicketDetailProps {
  ticket: Ticket;
  onStatusChange: (status: string) => Promise<void>;
  onUseAISuggestion: (text: string) => void;
}

export default function TicketDetail({ ticket, onStatusChange, onUseAISuggestion }: TicketDetailProps) {
  return (
    <div className="w-80 border-l border-slate-200 bg-white p-4 flex flex-col gap-5 h-full overflow-y-auto">
      {/* จัดการสถานะตั๋วงาน */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">การจัดการ Ticket</h4>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-500 font-medium">เปลี่ยนสถานะปัจจุบัน:</label>
          <select
            value={ticket.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-700 bg-slate-50 font-medium focus:outline-none"
          >
            <option value="Open">Open (เปิดรับเรื่อง)</option>
            <option value="In Progress">In Progress (กำลังดำเนินการ)</option>
            <option value="Resolved">Resolved (ปิดงานเสร็จสิ้น)</option>
          </select>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* พระเอกของเรา: AI Suggestion Box */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Suggested Reply</h4>
        </div>

        {ticket.ai_suggestion ? (
          <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 flex flex-col justify-between gap-3">
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{ticket.ai_suggestion}"
            </p>
            <button
              onClick={() => onUseAISuggestion(ticket.ai_suggestion || '')}
              className="w-full bg-purple-600 text-white rounded-lg py-1.5 text-xs font-medium hover:bg-purple-700 transition-colors shadow-sm"
            >
              ดึงคำตอบนี้ไปใช้งาน (Human-in-the-loop)
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic p-4 text-center border border-dashed border-slate-200 rounded-xl">
            ยังไม่มีข้อเสนอแนะเพิ่มเติมจาก AI ในขณะนี้
          </div>
        )}
      </div>
    </div>
  );
}