"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import FormSubmitReportBugPage from "@/app/(auth)/report_bug/components/FormSubmitReportBugPage";
import SubmissionReportBugPage from "@/app/(auth)/report_bug/components/SubmissionsList";

enum ViewType {
    SUBMIT = "submit",
    SUBMISSIONS = "submissions",
}

export default function NavBar() {
    const { darkMode } = useTheme();
    const { pageContent } = useApp();
    
    const [currentView, setCurrentView] = useState<ViewType>(ViewType.SUBMIT);

    return (
        <section className="w-full px-4 py-4 mx-auto flex flex-col md:max-w-full">
            <nav className="flex flex-row justify-between w-full border-b pb-2 md:justify-start md:gap-20">
                <button
                    onClick={() => setCurrentView(ViewType.SUBMIT)}
                    className={`text-[20px] font-[Montserrat] font-bold md:text-[48px] px-4 py-2
                        ${currentView === ViewType.SUBMIT
                            ? darkMode 
                                ? "text-capx-light-bg border-b-2 border-capx-light-bg" 
                                : "text-capx-dark-box-bg border-b-2 border-capx-dark-box-bg"
                            : "text-gray-500 border-transparent"}`}
                >
                    {pageContent["report-bug-submit"]}
                </button>
                <button
                    onClick={() => setCurrentView(ViewType.SUBMISSIONS)}
                    className={`text-[20px] font-[Montserrat] font-bold md:text-[48px] px-4 py-2
                        ${currentView === ViewType.SUBMISSIONS
                            ? darkMode 
                                ? "text-capx-light-bg border-b-2 border-capx-light-bg" 
                                : "text-capx-dark-box-bg border-b-2 border-capx-dark-box-bg"
                            : "text-gray-500 border-transparent"}`}
                >
                    {pageContent["report-bug-submission"]}
                </button>
            </nav>
            <div className="w-full mt-6">
                {currentView === ViewType.SUBMIT ? <FormSubmitReportBugPage /> : <SubmissionReportBugPage />}
            </div>
        </section>
    );
}
