'use client';

import { useEffect, useState } from 'react';
import { fetchTickets, updateTicketWorkflow } from '../../lib/api';
import { Ticket } from '../../types';

export default function TasksPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const data = await fetchTickets();
      setTickets(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  // ใช้ updateTicketWorkflow แทนของเดิมที่ถูกลบไปแล้ว
  const handleQuickStatusMove = async (ticketId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Open' ? 'In Progress' : currentStatus === 'In Progress' ? 'Resolved' : 'Open';
    await updateTicketWorkflow(ticketId, { status: nextStatus });
    await loadData();
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-500 animate-pulse font-medium">กำลังเตรียมบอร์ดงานติดตามสถานะ...</div>;
  }

  // ฟิลเตอร์คัดกรองตามเงื่อนไขเป้าหมาย (สถานะการตอบกลับลูกค้า)
  const unrepliedTickets = tickets.filter(t => !t.is_replied && t.status !== 'Resolved');
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress');
  const openRepliedTickets = tickets.filter(t => t.status === 'Open' && t.is_replied);
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved');

  const columns = [
    { id: 'unreplied', title: '🔴 ลูกค้ารอคำตอบ / ยังไม่ได้ตอบ', data: unrepliedTickets, bg: 'bg-rose-50/50 border-rose-100', text: 'text-rose-700' },
    { id: 'progress', title: '📦 กำลังตามเรื่อง (In Progress)', data: inProgressTickets, bg: 'bg-amber-50/50 border-amber-100', text: 'text-amber-700' },
    { id: 'open', title: '💬 ทิ้งคำถามค้าง (Open)', data: openRepliedTickets, bg: 'bg-blue-50/50 border-blue-100', text: 'text-blue-700' },
    { id: 'resolved', title: '✅ เสร็จสิ้น (Resolved)', data: resolvedTickets, bg: 'bg-emerald-50/50 border-emerald-100', text: 'text-emerald-700' }
  ];

  return (
    <div className="w-full h-full p-6 flex flex-col gap-5 bg-slate-50 overflow-hidden">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Task Tracking (สถานะการตอบกลับลูกค้า)</h1>
        <p className="text-xs text-slate-500 mt-1">กระดานตรวจสอบคิวแชทของฝ่ายบริการ เพื่อควบคุมไม่ให้เกิดการข้ามหรือตกหล่น</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden h-[calc(100vh-150px)]">
        {columns.map((col) => (
          <div key={col.id} className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-2xs p-3 h-full overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <span className={`text-xs font-bold ${col.text}`}>{col.title}</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {col.data.length}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
              {col.data.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic text-center py-10">ไม่มีงานค้างอยู่ในหมวดนี้</div>
              ) : (
                col.data.map((t) => {
                  const lastMsg = t.messages?.[t.messages.length - 1]?.message_text || "ไม่มีข้อความ";
                  return (
                    <div key={t.id} className={`p-3 border rounded-xl shadow-3xs flex flex-col gap-2 transition-transform ${col.bg}`}>
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-xs text-slate-800 truncate max-w-[70%]">
                          {t.account?.company_name || '👤 ลูกค้าส่วนตัว'}
                        </span>
                        <button 
                          onClick={() => handleQuickStatusMove(t.id, t.status)}
                          className="text-[9px] bg-white border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 shadow-2xs hover:bg-slate-100 flex-shrink-0"
                        >
                          เปลี่ยนขั้น ➔
                        </button>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 truncate">"{lastMsg}"</p>

                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/40 mt-1">
                        {/* แสดง Stage การลากวาง ควบคู่ไปกับตั๋ว */}
                        <span className="text-slate-600 bg-slate-100 font-medium px-1.5 py-0.5 rounded">
                          📦 {t.stage || 'รับ order'}
                        </span>
                        <span className="text-slate-400 font-mono">Owner: {t.account?.owner_agent_id}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}