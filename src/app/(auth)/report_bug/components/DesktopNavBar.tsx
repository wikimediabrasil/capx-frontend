"use client"

import { useState } from "react";

import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";


enum ViewType {
    SUBMIT = "submit",
    SUBMISSIONS = "submissions",
  }

export default function NavBarReportBugPage(){
    const { darkMode } = useTheme();
    const { pageContent } = useApp();

    const [currentView, setCurrentView] = useState<ViewType>(ViewType.SUBMIT);

    return (
        <section className="w-full px-4 py-4 mx-auto flex md:max-w-full md:justify-start">
            <div className="flex w-full px-4">
                <nav className="flex flex-row justify-between w-full">
                    <button
                        onClick={() => setCurrentView(ViewType.SUBMIT)}
                        className={`text-[20px] font-[Montserrat] font-bold md:text-[48px]
                            ${
                                currentView === ViewType.SUBMIT
                                    ? darkMode 
                                        ? "text-capx-light-bg" 
                                        : "text-capx-dark-box-bg"
                                    : "border-transparent"    
                            }`}
                    >
                        {pageContent["report-bug-submit"]}
                    </button>
                    <button
                        onClick={() => setCurrentView(ViewType.SUBMIT)}
                        className={`text-[20px] font-[Montserrat] font-bold md:text-[48px]
                            ${
                                currentView === ViewType.SUBMIT
                                    ? darkMode 
                                        ? "text-capx-light-bg" 
                                        : "text-capx-dark-box-bg"
                                    : "border-transparent"    
                            }`}
                    >
                        {pageContent["report-bug-submission"]}
                    </button>
                </nav>
            </div>
        </section>
    )}
