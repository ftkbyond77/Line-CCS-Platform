import React from 'react';
import { Ticket } from '@/types';

interface KPICardsProps {
  tickets: Ticket[];
}

export default function KPICards({ tickets }: KPICardsProps) {
  const total = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tickets ทั้งหมด</span>
        <span className="text-2xl font-bold text-slate-800 mt-1">{total}</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
        <span className="text-xs font-medium text-amber-500 uppercase tracking-wider">รอดำเนินการ (Open)</span>
        <span className="text-2xl font-bold text-amber-600 mt-1">{openTickets}</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
        <span className="text-xs font-medium text-blue-500 uppercase tracking-wider">กำลังคุยอยู่ (In Progress)</span>
        <span className="text-2xl font-bold text-blue-600 mt-1">{inProgress}</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
        <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">ปิดเคสแล้ว (Resolved)</span>
        <span className="text-2xl font-bold text-emerald-600 mt-1">{resolved}</span>
      </div>
    </div>
  );
}