'use client';

import { useEffect, useState } from 'react';
import { fetchTickets } from '../../lib/api';
import { Ticket } from '../../types';

interface UnifiedSchedule {
  id: number;
  ticketId: number;
  companyName: string;
  title: string;
  note?: string;          
  targetDate?: string;    
  owner: string;
}

export default function SchedulePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
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
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-6 text-sm text-slate-500 animate-pulse font-medium">กำลังประมวลผลตารางนัดหมายรวม...</div>;
  }

  // รวมรายการพินนัดหมายทั้งหมดจากแชททุกกลุ่มบริษัท
  const allSchedules: UnifiedSchedule[] = [];
  tickets.forEach(ticket => {
    if (ticket.schedules && ticket.schedules.length > 0) {
      ticket.schedules.forEach(s => {
        allSchedules.push({
          id: s.id,
          ticketId: ticket.id,
          companyName: ticket.account?.company_name || 'แชททั่วไป',
          title: s.title,
          note: s.note,             
          targetDate: s.target_date,
          owner: ticket.account?.owner_agent_id || 'Unassigned'
        });
      });
    }
  });

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 bg-slate-50 overflow-y-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-800">🗓️ Schedule Management (Pins Tracking)</h1>
        <p className="text-xs text-slate-500 mt-1">กระดานปักพินรวบรวมกำหนดวันนัดแนะส่งสินค้า หรือข้อตกลงด่วนที่ดักจับได้จากประโยคสนทนา</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col gap-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">รายการนัดส่งพัสดุ / ข้อตกลงด่วนทั้งหมด ({allSchedules.length})</h2>
        
        {allSchedules.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            ยังไม่มีนัดส่งมอบสินค้าด่วนปักหมุดค้างในระบบขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allSchedules.map((sched) => (
              <div 
                key={sched.id} 
                className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-3xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-800">🏢 {sched.companyName}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      {sched.owner}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-amber-900 mt-2 flex items-center gap-1.5">
                    📌 {sched.title}
                  </h3>
                  {sched.note && (
                    <p className="text-[11px] text-slate-600 mt-2 bg-white/80 p-2 border border-slate-100 rounded-lg break-words italic">
                      "{sched.note}"
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-amber-200/40">
                  <div className="text-[10px] font-bold text-amber-800 bg-amber-100/70 py-1.5 rounded-lg text-center font-mono">
                    🗓️ กำหนด: {sched.targetDate || "ไม่ระบุวันเวลาแน่ชัด"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}