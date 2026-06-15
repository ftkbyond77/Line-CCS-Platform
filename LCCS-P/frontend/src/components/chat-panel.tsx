import React, { useState } from 'react';
import { Ticket } from '@/types';

interface ChatPanelProps {
  ticket: Ticket;
  onSendReply: (text: string) => Promise<void>; 
  inputFieldValue: string;
  setInputFieldValue: (val: string) => void;
}

export default function ChatPanel({ ticket, onSendReply, inputFieldValue, setInputFieldValue }: ChatPanelProps) {
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputFieldValue.trim() || sending) return;

    try {
      setSending(true);
      await onSendReply(inputFieldValue);
      setInputFieldValue('');
    } catch (err) {
      alert("ไม่สามารถส่งข้อความได้ กรุณาลองใหม่");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#abc1d1]"> {/* สีพื้นหลังห้องแชท LINE คลาสสิก */}
      {/* ส่วนหัวของห้องแชท */}
      <div className="bg-white/90 backdrop-blur-sm p-4 border-b border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">
            {ticket.line_group_id ? `💬 LINE Group (ID: ${ticket.line_group_id.substring(0, 10)}...)` : `👤 LINE 1-on-1 Chat`}
          </h4>
          <p className="text-xs text-slate-500">รหัสลูกค้าต้นทาง: {ticket.line_user_id.substring(0, 12)}...</p>
        </div>
      </div>

      {/* รายการข้อความแชท */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {ticket.messages.map((msg) => {
          const isAgent = msg.sender_id === 'Agent';
          return (
            <div key={msg.id} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-slate-600 mb-0.5 px-1">{msg.sender_name || 'ไม่ระบุชื่อ'}</span>
              <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                isAgent 
                  ? 'bg-[#fee500] text-black rounded-tr-none' // สไตล์กล่องแชทฝั่งเราส่งออก
                  : 'bg-white text-slate-800 rounded-tl-none' // สไตล์กล่องแชทลูกค้าพิมพ์เข้ามา
              }`}>
                <p className="whitespace-pre-wrap break-words">{msg.message_text}</p>
              </div>
              <span className="text-[9px] text-slate-500/80 mt-0.5 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* กล่องพิมพ์พิมพ์ส่งข้อความ */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center">
        <input
          type="text"
          value={inputFieldValue}
          onChange={(e) => setInputFieldValue(e.target.value)}
          placeholder="พิมพ์ข้อความตอบกลับไปยังแชท LINE..."
          className="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-800"
          disabled={sending}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={sending}
        >
          {sending ? "กำลังส่ง..." : "ส่งแชท"}
        </button>
      </form>
    </div>
  );
}