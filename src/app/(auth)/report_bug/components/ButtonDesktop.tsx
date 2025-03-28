"use client"

import { useBugReport, ReportType } from "@/hooks/useBugReport";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";

import CancelIcon from "@/public/static/images/cancel.svg";
import CancelIconWhite from "@/public/static/images/cancel_white.svg";
import Uploadicon from "@/public/static/images/upload.svg";
import BaseButton from "@/components/BaseButton";

export default function ButtonDesktopReportBugPage(){
    const { darkMode } = useTheme();
    const { pageContent } = useApp();
    const router = useRouter();

      const {
        formData,
        isSubmitting,
        showTypeSelector,
        setShowTypeSelector,
        handleTitleChange,
        handleDescriptionChange,
        handleTypeChange,
        handleSubmit,
        handleCancel,
      } = useBugReport();

return(
    <div className="flex flex-row gap-6 mt-0 w-3/4">
        <BaseButton
        onClick={handleSubmit}
        label={pageContent["report-bug-submit-button"]}
        customClass="w-full flex items-center text-[24px] px-8 py-4 bg-[#851970] text-white rounded-md py-3 font-bold mb-0"
        imageUrl={Uploadicon}
        imageAlt="Upload icon"
        imageWidth={30}
        imageHeight={30}
        />
        <BaseButton
        onClick={() => router.back()}
        label={pageContent["report-bug-submit-cancel-button"]}
        customClass={`w-full flex items-center text-[24px] px-8 py-4 border border-[#053749] text-[#053749] rounded-md py-3 font-bold mb-0 ${
            darkMode
            ? "bg-transparent text-[#F6F6F6] border-[#F6F6F6] border-[2px]"
            : "bg-[#F6F6F6] border-[#053749] text-[#053749]"
        }`}
        imageUrl={darkMode ? CancelIconWhite : CancelIcon}
        imageAlt="Cancel icon"
        imageWidth={30}
        imageHeight={30}
        />
    </div>
)}
