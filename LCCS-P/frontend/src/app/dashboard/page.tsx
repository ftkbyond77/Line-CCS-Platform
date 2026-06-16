'use client';

import { useEffect, useState } from 'react';
import { fetchTickets, updateTicketWorkflow } from '../../lib/api';
import { Ticket } from '../../types';

export default function KanbanDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // สถานะเก็บการเปิดดูพรีวิวข้อความแชทกลุ่มค้างไว้
  const [previewTicket, setPreviewTicket] = useState<Ticket | null>(null);

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

  // 🌟 รายการคอลัมน์ความคืบหน้าที่คุณกำหนด คุมง่าย แม่นยำ
  const columnsList = [
    'รับ order',
    'เช็ค stocking',
    'รอของ',
    'delivery',
    'feedback',
    'ปิดงาน'
  ];

  // Logic เมื่อพนักงานเริ่มคลิกค้างจับการ์ดเพื่อ Drag
  const handleDragStart = (e: React.DragEvent, ticketId: number) => {
    e.dataTransfer.setData('text/plain', ticketId.toString());
  };

  // Logic ปลดล็อกให้วางการ์ดลงในช่องได้
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Logic อัปเดตคิวงานลงฐานข้อมูลหลังวางการ์ด (Drop)
  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const ticketIdStr = e.dataTransfer.getData('text/plain');
    if (!ticketIdStr) return;
    
    const ticketId = parseInt(ticketIdStr, 10);
    
    // สั่งอัปเดตระบบหลังบ้านทันที
    await updateTicketWorkflow(ticketId, { stage: targetStage });
    await loadData();
  };

  // ฟังก์ชันสลับเปลี่ยน Flag ตัวกรองงานแบบด่วนด้วยพนักงานเอง
  const toggleFlag = async (ticketId: number, flagName: 'is_angry' | 'is_sales' | 'is_forwarded', currentVal: boolean) => {
    const payload = { [flagName]: !currentVal };
    await updateTicketWorkflow(ticketId, payload);
    await loadData();
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-500 animate-pulse font-medium">กำลังเปิดระบบควบคุม Workflow บอร์ด...</div>;
  }

  return (
    <div className="w-full h-full p-6 flex flex-col gap-5 bg-slate-50 overflow-hidden font-sans select-none">
      
      {/* ส่วนควบคุมภาพรวมสำหรับผู้จัดการคุมงาน */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-black text-slate-800">B2B Order & Service Workflow Board</h1>
          <p className="text-xs text-slate-500 mt-0.5">พนักงานลากวางบอร์ดคัดกรองคิวแชทของกลุ่มบริษัทด้วยมืออย่างแม่นยำ 100%</p>
        </div>
        
        {/* สรุปข้อมูลด่วนสไตล์ที่ Manager อยากรู้แบบ Panoramic View */}
        <div className="flex flex-wrap gap-2 text-[11px] bg-slate-200/50 p-2 rounded-xl border border-slate-200">
          <div className="px-3 py-1 bg-white rounded-lg shadow-3xs font-medium text-slate-700">
            🔴 ค้างตอบ: <span className="font-bold text-rose-600">{tickets.filter(t => !t.is_replied && t.status !== 'Resolved').length}</span>
          </div>
          <div className="px-3 py-1 bg-white rounded-lg shadow-3xs font-medium text-slate-700">
            ⚡ ลูกค้าโกรธ: <span className="font-bold text-amber-600">{tickets.filter(t => t.is_angry && t.status !== 'Resolved').length}</span>
          </div>
          <div className="px-3 py-1 bg-white rounded-lg shadow-3xs font-medium text-slate-700">
            💰 งานขาย: <span className="font-bold text-blue-600">{tickets.filter(t => t.is_sales).length}</span>
          </div>
          <div className="px-3 py-1 bg-white rounded-lg shadow-3xs font-medium text-slate-700">
            ↩️ ต้องส่งต่อ: <span className="font-bold text-purple-600">{tickets.filter(t => t.is_forwarded).length}</span>
          </div>
        </div>
      </div>

      {/* 📊 ส่วนกระดานคานบันหลัก (ลากวางได้ลื่นไหล) */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start h-[calc(100vh-190px)]">
        {columnsList.map((colName) => {
          const colTickets = tickets.filter(t => t.stage === colName);
          
          return (
            <div 
              key={colName}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, colName)}
              className="w-72 bg-slate-100 rounded-2xl border border-slate-200/60 p-3 flex flex-col max-h-full flex-shrink-0 shadow-3xs"
            >
              {/* หัวคอลัมน์สเตจงาน */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-3">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wide">📦 {colName}</span>
                <span className="text-[10px] font-mono bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  {colTickets.length} บจก.
                </span>
              </div>

              {/* รายการแชทกลุ่มที่ติดอยู่ในแต่ละขั้น */}
              <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
                {colTickets.length === 0 ? (
                  <div className="text-[10px] text-slate-400 italic text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    ไม่มีคิวค้างในสเตจนี้
                  </div>
                ) : (
                  colTickets.map((ticket) => {
                    const lastMsg = ticket.messages?.[ticket.messages.length - 1]?.message_text || "ไม่มีข้อความ";
                    
                    return (
                      <div
                        key={ticket.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ticket.id)}
                        onClick={() => setPreviewTicket(ticket)} // คลิกเพื่อเปิด LINE Preview ด้านล่าง
                        className={`bg-white border border-slate-200 rounded-xl p-3 shadow-3xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing border-l-4 ${
                          !ticket.is_replied && ticket.status !== 'Resolved' ? 'border-l-rose-500' : 'border-l-emerald-500'
                        }`}
                      >
                        {/* ชื่อกลุ่มสนทนาจำลองตาม LINE */}
                        <div className="font-bold text-xs text-slate-800 truncate mb-1">
                          {ticket.account?.company_name || "👥 กลุ่มคุยงานลูกค้า"}
                        </div>

                        {/* พรีวิวประโยคสุดท้ายสั้นๆ */}
                        <p className="text-[11px] text-slate-400 truncate italic">"{lastMsg}"</p>

                        {/* แผงปุ่มสำหรับพนักงาน Toggle เปลี่ยนไฟกระพริบสเตตัสด้วยตนเองตอบสนอง Manager */}
                        <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-slate-100 text-[9px] font-bold">
                          {/* แจ้งเตือนแชทจมค้างตอบ */}
                          <span className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 ${!ticket.is_replied ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
                            {!ticket.is_replied ? "🔴 ค้างตอบ" : "🟢 ตอบแล้ว"}
                          </span>

                          {/* สลับสถานะลูกค้าโกรธ */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFlag(ticket.id, 'is_angry', ticket.is_angry); }}
                            className={`px-1.5 py-0.5 rounded transition-colors ${ticket.is_angry ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          >
                            ⚡ โกรธ
                          </button>

                          {/* สลับคิวฝ่ายขาย */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFlag(ticket.id, 'is_sales', ticket.is_sales); }}
                            className={`px-1.5 py-0.5 rounded transition-colors ${ticket.is_sales ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          >
                            💰 งานขาย
                          </button>

                          {/* สลับการส่งต่อทีมหนุน */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFlag(ticket.id, 'is_forwarded', ticket.is_forwarded); }}
                            className={`px-1.5 py-0.5 rounded transition-colors ${ticket.is_forwarded ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          >
                            ↩️ ส่งต่อ
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 📱 🟢 ส่วนแสดงหน้าต่าง Preview กล่องข้อความแชทด้านล่าง (โคลนสไตล์กดค้างหน้าจอ LINE) */}
      {previewTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#abc1d1] w-full max-w-md h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-150">
            
            {/* หัวหน้าต่าง Preview */}
            <div className="bg-white p-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800">📱 Preview Mode ({previewTicket.account?.company_name})</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">ขั้นตอนปัจจุบัน: {previewTicket.stage}</p>
              </div>
              <button 
                onClick={() => setPreviewTicket(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs bg-slate-100 p-1.5 rounded-lg"
              >
                ปิดหน้าต่าง
              </button>
            </div>

            {/* ส่วนกล่องข้อความย้อนหลังย่อขนาดพรีวิวสไตล์แชทไลน์หลัก */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
              {previewTicket.messages && previewTicket.messages.map((msg) => {
                const isAgent = msg.sender_id === 'Agent';
                return (
                  <div key={msg.id} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-slate-600 px-1">{msg.sender_name || 'ลูกค้า'}</span>
                    <div className={`max-w-[80%] p-2 rounded-xl text-xs leading-relaxed shadow-3xs ${
                      isAgent ? 'bg-[#fee500] text-slate-900 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.message_text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400 font-medium">
              💡 จับลากการ์ดบริษัทนี้เปลี่ยนขั้นความคืบหน้าได้ทันทีบนบอร์ดพื้นหลัง
            </div>
          </div>
        </div>
      )}
    </div>
  );
}