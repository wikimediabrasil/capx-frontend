import { useState } from "react";
import { useSession } from "next-auth/react";
import { MessageService } from "@/services/messageService";
import { Message } from "@/types/message";

export function useMessage() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMethodSelector, setShowMethodSelector] = useState(false);

  const sendMessage = async (message: Partial<Message>) => {
    setIsSubmitting(true);
    try {
      const response = await MessageService.sendMessage({
        message,
        token: session?.user.token ?? ""
      });
      if (!response || !response.id) {
        throw new Error("Invalid message response from server");
      }
      return response;
    } catch (error) {
      console.error("Error sending message", error);
      setError(error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    showMethodSelector,
    setShowMethodSelector,
    sendMessage,
    error,
  };
}

