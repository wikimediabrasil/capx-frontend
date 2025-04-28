"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";

import BaseButton from "@/components/BaseButton";

interface ActionButtonsProps {
    handleAhead: () => void;
    handleBack?: () => void;
    labelButtonAhead: string;
    labelButtonBack: string;
    iconAhead: string;
    iconBack: string;
    iconAltAhead: string;
    iconAltBack: string;
}

export default function ActionButtons({ handleAhead, handleBack, labelButtonAhead, labelButtonBack, iconAhead, iconBack, iconAltAhead, iconAltBack  }: ActionButtonsProps) {
    const router = useRouter();
    const { darkMode } = useTheme();
    const { isMobile } = useApp();
    const defaultBack = () => {
        router.back()
    }

    return (
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-row gap-6 w-3/4 mt-8'}`}>
            <BaseButton
                onClick={handleAhead}
                label={labelButtonAhead}
                customClass={`
                    flex items-center justify-between
                    ${isMobile 
                        ? 'w-full text-[14px] !px-[13px] !py-[6px] pb-[6px]'
                        : 'w-full text-[24px] px-8 py-4'
                    }
                    bg-[#851970] text-white rounded-md font-[Montserrat] font-bold
                `}
                imageUrl={iconAhead}
                imageAlt={iconAltAhead}
                imageWidth={isMobile ? 20 : 30}
                imageHeight={isMobile ? 20 : 30}
            />
            <BaseButton
                onClick={handleBack || defaultBack}
                label={labelButtonBack}
                customClass={`
                    flex items-center justify-between
                    ${isMobile 
                        ? 'w-full text-[14px] !px-[13px] !py-[6px] pb-[6px]'
                        : 'w-full text-[24px] px-8 py-4'
                    }
                    border rounded-md font-[Montserrat] font-bold
                    ${darkMode
                        ? 'bg-[#FFFFFF] text-[#053749] border-[#F6F6F6] border-[2px]'
                        : 'bg-[#F6F6F6] border-[#053749] text-[#053749]'
                    }
                `}
                imageUrl={iconBack}
                imageAlt={iconAltBack}
                imageWidth={isMobile ? 20 : 30}
                imageHeight={isMobile ? 20 : 30}
            />
        </div>
    );
}
