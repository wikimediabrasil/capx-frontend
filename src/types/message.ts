export interface Message {
  id: number;
  message: string;
  subject: string;
  receiver: string;
  method: string;
  status: string;
  error_message?: string;
  date: string;
}
