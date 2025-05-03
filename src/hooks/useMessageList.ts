import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageService } from "@/services/messageService";
import { Message } from "@/types/message";

export function useMessageList() {
  const { data: session } = useSession();
  const token = session?.user?.token;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const data = await MessageService.getMessages(token);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Could not load messages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return {
    messages,
    isLoading,
    error,
    formatDate,
  };
}
