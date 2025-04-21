"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import BaseButton from "@/components/BaseButton";
import CancelIcon from "@/public/static/images/cancel.svg";
import CancelIconWhite from "@/public/static/images/cancel_white.svg";
import SendIcon from "@/public/static/images/upload.svg";

interface ActionButtonsProps {
    handleSubmit: () => void;
}

export default function ActionButtons({ handleSubmit }: ActionButtonsProps) {
    const router = useRouter();
    const { darkMode } = useTheme();
    const { pageContent, isMobile } = useApp();

    return (
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-row gap-6 w-3/4 mt-16'}`}>
            <BaseButton
                onClick={handleSubmit}
                label={pageContent["message-form-submit-button"]}
                customClass={`
                    flex items-center justify-between
                    ${isMobile 
                        ? 'w-full text-[14px] !px-[13px] !py-[6px] pb-[6px]'
                        : 'w-full text-[24px] px-8 py-4'
                    }
                    bg-[#851970] text-white rounded-md font-[Montserrat] font-bold
                `}
                imageUrl={SendIcon}
                imageAlt="Send icon"
                imageWidth={isMobile ? 20 : 30}
                imageHeight={isMobile ? 20 : 30}
            />
            <BaseButton
                onClick={() => router.back()}
                label={pageContent["message-form-cancel-button"]}
                customClass={`
                    flex items-center justify-between
                    ${isMobile 
                        ? 'w-full text-[14px] !px-[13px] !py-[6px] pb-[6px]'
                        : 'w-full text-[24px] px-8 py-4'
                    }
                    border rounded-md font-[Montserrat] font-bold
                    ${darkMode
                        ? 'bg-transparent text-[#F6F6F6] border-[#F6F6F6] border-[2px]'
                        : 'bg-[#F6F6F6] border-[#053749] text-[#053749]'
                    }
                `}
                imageUrl={darkMode ? CancelIconWhite : CancelIcon}
                imageAlt="Cancel icon" 
                imageWidth={isMobile ? 20 : 30}
                imageHeight={isMobile ? 20 : 30}
            />
        </div>
    );
}
