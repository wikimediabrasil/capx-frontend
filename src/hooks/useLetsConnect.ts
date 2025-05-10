import { useState } from "react";
import { useSession } from "next-auth/react";
import { LetsConnectService } from "@/services/letsConnectService";
import { LetsConnect } from "@/types/lets_connect";

export function useLetsConnect() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const submitLetsConnectForm = async (letsConnect: Partial<LetsConnect>) => {
    setIsSubmitting(true);
    try {
      const response = await LetsConnectService.submitLetsConnectForm({
        letsConnect,
        token: session?.user.token ?? ""
      });
      if (!response) {
        throw new Error("Invalid lets connect data from server");
      }
      return response;
    } catch (error) {
      console.error("Error sending lets connect data", error);
      setError(error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    showTypeSelector,
    setShowTypeSelector,
    submitLetsConnectForm,
    error,
  };
}
