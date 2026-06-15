export interface Message {
  id: number;
  ticket_id: number;
  sender_id: string;
  sender_name: string | null;
  message_text: string;
  timestamp: string;
}

export interface Ticket {
  id: number;
  line_group_id: string | null;
  line_user_id: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  category: string;
  agent_id: string | null;
  ai_suggestion: string | null;
  created_at: string;
  messages: Message[];
}