import React from 'react';
import { Ticket } from '@/types';

export default function KPICards({ tickets }: { tickets: Ticket[] }) {
  const total = tickets.length;
  const unreplied = tickets.filter(t => !t.is_replied).length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-800">{total}</span>
        <span className="text-xs text-slate-500 font-medium uppercase mt-1">บริษัท/เคสทั้งหมด</span>
      </div>
      <div className={`p-4 rounded-xl border shadow-sm flex flex-col items-center ${unreplied > 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
        <span className={`text-3xl font-bold ${unreplied > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{unreplied}</span>
        <span className={`text-xs font-medium uppercase mt-1 ${unreplied > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`}>
          {unreplied > 0 ? '⚠️ แชทค้าง / ลูกค้ารอ' : 'ไม่มีแชทค้าง'}
        </span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
        <span className="text-3xl font-bold text-emerald-600">{resolved}</span>
        <span className="text-xs text-slate-500 font-medium uppercase mt-1">งานที่ปิดเคสแล้ว</span>
      </div>
    </div>
  );
}