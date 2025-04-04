import { useState } from "react";
import { useSession } from "next-auth/react";
import { BugReportService } from "@/services/bugReportService";
import { BugReport } from "@/types/report";

export enum ReportType {
  ERROR = "error",
  FEATURE = "feature",
  IMPROVEMENT = "improvement",
  TEST_CASE = 'test_case'
}

export interface BugReportFormData {
  title: string;
  author: string;
  description: string;
  type: ReportType | "";
}

export function useBugReport() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const submitBugReport = async (bugReport: Partial<BugReport>) => {
    setIsSubmitting(true);
    try {
      const response = await BugReportService.submitReport({
        bugReport,
        token: session?.user.token ?? ""
      });
      if (!response || !response.id) {
        throw new Error("Invalid project response from server");
      }
      return response;
    } catch (error) {
      console.error("Error reporting bug", error);
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
    submitBugReport,
    error,
  };
}
