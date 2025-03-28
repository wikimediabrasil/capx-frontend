import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSnackbar } from "@/app/providers/SnackbarProvider";
import { useApp } from "@/contexts/AppContext";
import { BugReportService } from "@/services/bugReportService";

export enum ReportType {
  BUG = "bug",
  FEATURE = "feature",
  IMPROVEMENT = "improvement",
}

export interface BugReportFormData {
  title: string;
  description: string;
  type: ReportType | "";
}

export function useBugReport() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showSnackbar } = useSnackbar();
  const { pageContent } = useApp();
  const token = session?.user?.token;

  const [formData, setFormData] = useState<BugReportFormData>({
    title: "",
    description: "",
    type: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      title: e.target.value,
    }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  const handleTypeChange = (type: ReportType) => {
    setFormData((prev) => ({
      ...prev,
      type,
    }));
    setShowTypeSelector(false);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.type) {
      showSnackbar(
        pageContent["bug-report-fill-all-fields"] || "Por favor, preencha todos os campos", 
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await BugReportService.submitReport(
        formData.title,
        formData.description,
        formData.type,
        token
      );

      showSnackbar(
        pageContent["bug-report-success"] || "Relatório enviado com sucesso", 
        "success"
      );
      router.push("/bug_report/submissions");
    } catch (error) {
      console.error("Erro ao enviar relatório:", error);
      showSnackbar(
        pageContent["bug-report-error"] || "Erro ao enviar relatório", 
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return {
    formData,
    isSubmitting,
    showTypeSelector,
    setShowTypeSelector,
    handleTitleChange,
    handleDescriptionChange,
    handleTypeChange,
    handleSubmit,
    handleCancel,
  };
}