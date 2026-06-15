export interface Message {
  id: number;
  ticket_id: number;
  sender_id: string;
  sender_name: string | null;
  message_text: string;
  timestamp: string;
}

export interface Schedule {
  id: number;
  ticket_id: number;
  title: string;
  note: string | null;
  target_date: string | null;
}

export interface Account {
  id: number;
  line_group_id: string | null;
  company_name: string;
  owner_agent_id: string; 
}

export interface Ticket {
  id: number;
  account_id: number | null;
  status: 'Open' | 'In Progress' | 'Resolved';
  category: string;
  is_replied: boolean; // ดักแชทค้าง [cite: 206]
  ai_suggestion: string | null;
  created_at: string;
  account: Account | null;
  messages: Message[];
  schedules: Schedule[]; 
}