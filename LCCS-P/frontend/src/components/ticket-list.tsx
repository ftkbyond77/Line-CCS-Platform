import React, { useState } from 'react';
import { Ticket } from '@/types';

interface TicketListProps {
  tickets: Ticket[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  currentAgentFilter: string;
  setCurrentAgentFilter: (agent: string) => void;
}

export default function TicketList({ tickets, selectedId, onSelect, currentAgentFilter, setCurrentAgentFilter }: TicketListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = tickets.filter(ticket => {
    const matchAgent = currentAgentFilter === 'ALL' || ticket.account?.owner_agent_id === currentAgentFilter;
    const companyName = ticket.account?.company_name?.toLowerCase() || '';
    const matchSearch = companyName.includes(searchQuery.toLowerCase());
    return matchAgent && matchSearch;
  });

  return (
    <div className="w-85 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden">
      
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col gap-3">
        <input 
          type="text" 
          placeholder="ค้นหาชื่อบริษัท หรือ กลุ่ม..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white shadow-sm"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">กรองตามผู้รับผิดชอบ:</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-200/60 p-1 rounded-lg text-[11px]">
            <button onClick={() => setCurrentAgentFilter('ALL')} className={`py-1 font-medium rounded ${currentAgentFilter === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>ทั้งหมด</button>
            <button onClick={() => setCurrentAgentFilter('Agent_Boy')} className={`py-1 font-medium rounded ${currentAgentFilter === 'Agent_Boy' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>น้องบอย</button>
            <button onClick={() => setCurrentAgentFilter('Unassigned')} className={`py-1 font-medium rounded ${currentAgentFilter === 'Unassigned' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>ส่วนกลาง</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredTickets.map((ticket) => {
          const isSelected = selectedId === ticket.id;
          const lastMsg = ticket.messages[ticket.messages.length - 1]?.message_text || "ไม่มีข้อความ";
          
          return (
            <div key={ticket.id} onClick={() => onSelect(ticket.id)} className={`p-3.5 cursor-pointer transition-all hover:bg-slate-50/80 flex flex-col gap-1.5 ${isSelected ? 'bg-blue-50/70 border-l-4 border-blue-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 max-w-[70%]">
                  <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${ticket.is_replied ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                  <span className="font-semibold text-xs text-slate-800 truncate">
                    {ticket.account ? ticket.account.company_name : "👥 แชทกลุ่ม"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 truncate pl-4">{lastMsg}</p>

              <div className="flex items-center justify-between mt-1 pl-4 text-[10px]">
                {/* เปลี่ยนจาก Category เป็น Stage คิวงานแทน */}
                <span className="text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                  📦 {ticket.stage || 'รับ order'}
                </span>
                <span className="text-slate-400 font-mono">Owner: {ticket.account?.owner_agent_id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}