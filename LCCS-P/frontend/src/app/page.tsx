'use client';

import './globals.css'; 
import { useEffect, useState } from 'react';
import { fetchTickets, updateTicketStatus, sendReplyToLine } from '../lib/api';
import { Ticket } from '../types';
import KPICards from '../components/kpi-cards';
import TicketList from '../components/ticket-list';
import ChatPanel from '../components/chat-panel';
import TicketDetail from '../components/ticket-detail';

export default function TicketsDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch (err) {
      console.error("Error connecting to backend API:", err);
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

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicketId) return;
    await updateTicketStatus(selectedTicketId, newStatus);
    await loadData();
  };

  const handleSendReply = async (text: string) => {
    if (!selectedTicketId) return;
    await sendReplyToLine(selectedTicketId, text);
    await loadData();
  };

  const handleInjectAISuggestion = (aiText: string) => {
    setChatInput(aiText);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-slate-50 h-screen w-screen">
        <p className="text-sm font-medium text-slate-500 animate-pulse-slow">กำลังเปิดประตูเชื่อมต่อข้อมูลระบบ...</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col p-4 bg-slate-50 overflow-hidden">
      <KPICards tickets={tickets} />

      <div className="flex-1 flex bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-[calc(100vh-160px)]">
        <TicketList 
          tickets={tickets} 
          selectedId={selectedTicketId} 
          onSelect={(id) => setSelectedTicketId(id)} 
        />

        {activeTicket ? (
          <>
            <ChatPanel 
              ticket={activeTicket} 
              onSendReply={handleSendReply}
              inputFieldValue={chatInput}
              setInputFieldValue={setChatInput}
            />
            <TicketDetail 
              ticket={activeTicket} 
              onStatusChange={handleStatusChange}
              onUseAISuggestion={handleInjectAISuggestion}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50/50 text-slate-400 text-sm italic">
            ← โปรดเลือกแชทหรือตั๋วงานจากรายการฝั่งซ้าย เพื่อเริ่มต้นสวมบทบาทพนักงานควบคุม
          </div>
        )}
      </div>
    </div>
  );
}