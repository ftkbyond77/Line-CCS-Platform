'use client';

import { useState } from 'react';
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

const isGroupChat = !!ticket.account?.line_group_id;
const chatHeaderName = ticket.account?.company_name || "👤 LINE 1-on-1 Chat";

// สกัดหา User ID ของลูกค้าจากข้อความแรกสุดที่มีการบันทึกไว้ในตั๋วใบนี้
const fallbackUserId = ticket.messages && ticket.messages.length > 0 
  ? ticket.messages[0].sender_id 
  : "Unknown_User";

const displaySubId = ticket.account?.line_group_id 
  ? `Group ID: ${ticket.account.line_group_id.substring(0, 10)}...` 
  : `User ID: ${fallbackUserId.substring(0, 12)}...`;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#abc1d1]"> {/* สีพื้นหลังห้องแชท LINE คลาสสิก */}
      
      {/* ส่วนหัวของห้องแชท (จำลอง UI LINE) */}
      <div className="bg-white/95 backdrop-blur-sm p-4 border-b border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            {isGroupChat ? "🏢" : "👤"} {chatHeaderName}
          </h4>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{displaySubId}</p>
        </div>
      </div>

      {/* รายการข้อความแชท */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {ticket.messages && ticket.messages.map((msg) => {
          const isAgent = msg.sender_id === 'Agent';
          return (
            <div key={msg.id} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-slate-600 mb-0.5 px-1 font-medium">
                {msg.sender_name || 'ไม่ระบุชื่อ'}
              </span>
              <div className={`max-w-[70%] p-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                isAgent 
                  ? 'bg-[#fee500] text-slate-900 rounded-tr-none' // กล่องแชทฝั่งเราส่งออก (เหลือง LINE)
                  : 'bg-white text-slate-800 rounded-tl-none'     // กล่องแชทฝั่งลูกค้า
              }`}>
                <p className="whitespace-pre-wrap break-words">{msg.message_text}</p>
              </div>
              <span className="text-[9px] text-slate-500/80 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* กล่องพิมพ์ส่งข้อความ */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center">
        <input
          type="text"
          value={inputFieldValue}
          onChange={(e) => setInputFieldValue(e.target.value)}
          placeholder={isGroupChat ? "พิมพ์โต้ตอบกลับไปยังบริษัทในกลุ่ม LINE..." : "พิมพ์โต้ตอบส่วนตัว..."}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-800 bg-slate-50"
          disabled={sending}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          disabled={sending}
        >
          {sending ? "กำลังส่ง..." : "ส่งแชท"}
        </button>
      </form>
    </div>
  );
}