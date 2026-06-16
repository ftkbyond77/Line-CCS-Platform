'use client';

import './globals.css'; 
import { useEffect, useState } from 'react';
import { fetchTickets, updateTicketWorkflow, sendReplyToLine } from '../lib/api';
import { Ticket } from '../types';
import KPICards from '../components/kpi-cards';
import TicketList from '../components/ticket-list';
import ChatPanel from '../components/chat-panel';
import TicketDetail from '../components/ticket-detail';

export default function WorkspacePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [agentFilter, setAgentFilter] = useState<string>('ALL');

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

  const activeTicket = tickets.find(t => t.id === selectedTicketId) || null;

  // ฟังก์ชันสลับ Stage คิวงาน (รับ order, เช็ค stocking ฯลฯ)
  const handleStageChange = async (newStage: string) => {
    if (!selectedTicketId) return;
    await updateTicketWorkflow(selectedTicketId, { stage: newStage });
    await loadData();
  };

  // ฟังก์ชันเปลี่ยนผู้รับผิดชอบ
  const handleAgentChange = async (newAgent: string) => {
    if (!selectedTicketId) return;
    await updateTicketWorkflow(selectedTicketId, { agent_id: newAgent });
    await loadData();
  };


  const handleSendReply = async (text: string) => {
    if (!selectedTicketId) return;
    await sendReplyToLine(selectedTicketId, text);
    setChatInput(''); // เคลียร์ช่องแชทหลังส่งเสร็จ
    await loadData();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-slate-500 text-sm">กำลังโหลดระบบ Workspace...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col p-4 bg-slate-50 overflow-hidden font-sans">
      <KPICards tickets={tickets} />

      <div className="flex-1 flex bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-[calc(100vh-160px)]">
        <TicketList 
          tickets={tickets} 
          selectedId={selectedTicketId} 
          onSelect={setSelectedTicketId} 
          currentAgentFilter={agentFilter}
          setCurrentAgentFilter={setAgentFilter}
        />

        {activeTicket ? (
          <>
            <ChatPanel 
              ticket={activeTicket} 
              onSendReply={handleSendReply}
              inputFieldValue={chatInput}
              setInputFieldValue={setChatInput}
            />
            {/* ส่ง Props แบบ Manual ล้วนเข้า TicketDetail */}
            <TicketDetail 
              ticket={activeTicket} 
              onStageChange={handleStageChange}
              onAgentChange={handleAgentChange}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic bg-slate-50/50">
            ← โปรดเลือกห้องแชทบริษัทจากฝั่งซ้าย เพื่อเริ่มตอบและจัดการคิวงาน
          </div>
        )}
      </div>
    </div>
  );
}