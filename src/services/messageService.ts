import { Message } from "@/types/message";
import axios from "axios";

export interface MessageServiceParams {
  message: Partial<Message>;
  token: string;
}

export class MessageService {
  static async sendMessage({
    message,
    token
  }: MessageServiceParams): Promise<any> {
    try {
      const response = await axios.post(
        "/api/messages",
        {
          receiver: message.receiver,
          subject: message.subject,
          message: message.message,
          method: message.method,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  }

  static async getMessages(token?: string): Promise<Message[]> {
    try {
      const response = await axios.get("/api/messages", {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get messages:", error);
      throw error;
    }
  }
}
