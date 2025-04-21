"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import FormMessagePage from "@/app/(auth)/message/components/formMessagePage"; //arrumar de onde vem
import SentContactPage from "@/app/(auth)/report_bug/components/SubmissionsList"; //arrumar de onde vem

enum ViewType {
    WRITE = "submit",
    SENT = "submissions",
}

export default function NavBar() {
    const { darkMode } = useTheme();
    const { pageContent } = useApp();
    
    const [currentView, setCurrentView] = useState<ViewType>(ViewType.WRITE);

    return (
        <section className="w-full px-4 py-4 mx-auto flex flex-col md:max-w-full">
            <nav className="flex flex-row justify-between w-full border-b pb-2 md:justify-start md:gap-20">
                <button
                    onClick={() => setCurrentView(ViewType.WRITE)}
                    className={`text-[20px] font-[Montserrat] font-bold md:text-[48px] px-4 py-2
                        ${currentView === ViewType.WRITE
                            ? darkMode 
                                ? "text-capx-light-bg border-b-2 border-capx-light-bg" 
                                : "text-capx-dark-box-bg border-b-2 border-capx-dark-box-bg"
                            : "text-gray-500 border-transparent"}`}
                >
                    {pageContent["contact-write"]}
                </button>
                <button
                    onClick={() => setCurrentView(ViewType.SENT)}
                    className={`text-[20px] font-[Montserrat] font-bold md:text-[48px] px-4 py-2
                        ${currentView === ViewType.SENT
                            ? darkMode 
                                ? "text-capx-light-bg border-b-2 border-capx-light-bg" 
                                : "text-capx-dark-box-bg border-b-2 border-capx-dark-box-bg"
                            : "text-gray-500 border-transparent"}`}
                >
                    {pageContent["contact-sent"]}
                </button>
            </nav>
            <div className="w-full mt-6">
                {currentView === ViewType.WRITE ? <FormMessagePage /> : <SentContactPage />}
            </div>
        </section>
    );
}
