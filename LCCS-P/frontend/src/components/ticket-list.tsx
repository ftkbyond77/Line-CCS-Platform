import React from 'react';
import { Ticket } from '@/types';

interface TicketListProps {
  tickets: Ticket[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  currentAgentFilter: string;
  setCurrentAgentFilter: (agent: string) => void;
}

export default function TicketList({ tickets, selectedId, onSelect, currentAgentFilter, setCurrentAgentFilter }: TicketListProps) {
  // กรองตามเจ้าของเคส (Jira Style / Workspace Assignment) 
  const filteredTickets = tickets.filter(ticket => {
    if (currentAgentFilter === 'ALL') return true;
    return ticket.account?.owner_agent_id === currentAgentFilter;
  });

  return (
    <div className="w-85 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden">
      {/* แท็บสลับ Workspace เพื่อส่องว่าใครกำลังคุมเคสไหนอยู่  */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase">กรองตามผู้รับผิดชอบบริษัท:</label>
        <div className="grid grid-cols-3 gap-1 bg-slate-200/60 p-1 rounded-lg text-xs">
          <button 
            onClick={() => setCurrentAgentFilter('ALL')}
            className={`py-1 text-center font-medium rounded ${currentAgentFilter === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          >
            ทั้งหมด
          </button>
          <button 
            onClick={() => setCurrentAgentFilter('Agent_Boy')}
            className={`py-1 text-center font-medium rounded ${currentAgentFilter === 'Agent_Boy' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          >
            บอย (Sales)
          </button>
          <button 
            onClick={() => setCurrentAgentFilter('Unassigned')}
            className={`py-1 text-center font-medium rounded ${currentAgentFilter === 'Unassigned' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          >
            งานกลาง
          </button>
        </div>
      </div>

      {/* รายการตั๋วงาน */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">ไม่มีข้อมูลงานในหมวดหมู่นี้</div>
        ) : (
          filteredTickets.map((ticket) => {
            const isSelected = selectedId === ticket.id;
            const lastMsg = ticket.messages[ticket.messages.length - 1]?.message_text || "ไม่มีข้อความ";
            
            return (
              <div
                key={ticket.id}
                onClick={() => onSelect(ticket.id)}
                className={`p-3.5 cursor-pointer transition-all hover:bg-slate-50/80 flex flex-col gap-1.5 ${
                  isSelected ? 'bg-blue-50/70 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    {/* 🔴🟢 ไฟสัญญาณจราจรดักแชทจม  */}
                    <span 
                      className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${ticket.is_replied ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}
                      title={ticket.is_replied ? "ตอบกลับลูกค้าแล้ว" : "⚠️ แชทจม! ลูกค้ารอคำตอบ"}
                    />
                    <span className="font-semibold text-xs text-slate-800 truncate">
                      {ticket.account ? ticket.account.company_name : "👤 แชทส่วนตัว"}
                    </span>
                  </div>
                  <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {ticket.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 truncate pl-4">{lastMsg}</p>

                <div className="flex items-center justify-between mt-1 pl-4 text-[10px]">
                  <span className="text-purple-600 font-medium bg-purple-50 px-1.5 py-0.5 rounded">
                    📂 {ticket.category}
                  </span>
                  <span className="text-slate-400 font-mono">Owner: {ticket.account?.owner_agent_id}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}