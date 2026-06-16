import React from 'react';
import { Ticket } from '@/types';

interface TicketDetailProps {
  ticket: Ticket;
  onStageChange: (stage: string) => Promise<void>;
  onAgentChange: (agent: string) => Promise<void>;
}

export default function TicketDetail({ ticket, onStageChange, onAgentChange }: TicketDetailProps) {
  return (
    <div className="w-80 border-l border-slate-200 bg-white p-4 flex flex-col gap-5 h-full overflow-y-auto">
      
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Workflow Management</h4>
        <div className="flex flex-col gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            <label className="text-[11px] text-slate-500 font-medium">ขั้นตอนคิวงาน (Stage):</label>
            <select
              value={ticket.stage || 'รับ order'}
              onChange={(e) => onStageChange(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white text-slate-700 font-bold mt-1 outline-none focus:border-blue-500"
            >
              <option value="รับ order">รับ order</option>
              <option value="เช็ค stocking">เช็ค stocking</option>
              <option value="รอของ">รอของ</option>
              <option value="delivery">delivery</option>
              <option value="feedback">feedback</option>
              <option value="ปิดงาน">ปิดงาน (Resolved)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-medium">มอบหมายให้ (Owner):</label>
            <select
              value={ticket.account?.owner_agent_id || 'Unassigned'}
              onChange={(e) => onAgentChange(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white text-slate-700 font-medium mt-1 outline-none focus:border-blue-500"
            >
              <option value="Unassigned">ยังไม่มีผู้รับผิดชอบ</option>
              <option value="Agent_Boy">น้องบอย (Sales)</option>
              <option value="Agent_Ploy">พี่พลอย (CS)</option>
            </select>
          </div>
        </div>
      </div>
      

    </div>
  );
}