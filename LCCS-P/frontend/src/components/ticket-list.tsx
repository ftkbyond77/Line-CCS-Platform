import React from 'react';
import { Ticket } from '@/types';

interface TicketListProps {
  tickets: Ticket[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function TicketList({ tickets, selectedId, onSelect }: TicketListProps) {
  return (
    <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-700">รายการแชทและตั๋วงาน</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">ยังไม่มีประวัติแชทส่งเข้ามา</div>
        ) : (
          tickets.map((ticket) => {
            const lastMsg = ticket.messages[ticket.messages.length - 1]?.message_text || "ไม่มีข้อความ";
            const isSelected = selectedId === ticket.id;

            return (
              <div
                key={ticket.id}
                onClick={() => onSelect(ticket.id)}
                className={`p-4 cursor-pointer transition-all hover:bg-slate-50 flex flex-col gap-1.5 ${
                  isSelected ? 'bg-blue-50/70 border-l-4 border-blue-500 hover:bg-blue-50/70' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-slate-800 truncate max-w-[140px]">
                    {ticket.line_group_id ? `🏢 กลุ่มบริษัท` : `👤 คุยส่วนตัว`}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    ticket.status === 'Open' ? 'bg-amber-100 text-amber-700' :
                    ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 truncate">{lastMsg}</p>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {ticket.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ID: #{ticket.id}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}