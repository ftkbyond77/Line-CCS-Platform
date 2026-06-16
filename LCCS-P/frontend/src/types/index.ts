export interface Message {
  id: number;
  ticket_id: number;
  sender_id: string;
  sender_name?: string;
  message_text: string;
  timestamp: string;
}

export interface Schedule {
  id: number;
  ticket_id: number;
  title: string;
  note?: string;
  target_date?: string;
  created_at: string;
}

export interface Account {
  id: number;
  line_group_id?: string;
  company_name: string;
  owner_agent_id: string;
}

export interface Ticket {
  id: number;
  account_id?: number;
  status: string;           // 'Open' | 'In Progress' | 'Resolved'
  stage: string;            
  is_replied: boolean;     
  created_at: string;
  updated_at: string;
  account?: Account;
  messages: Message[];
  schedules: Schedule[];
}