"use client"
import Image from "next/image";
import BugReportsDesktop from "@/public/static/images/bug_reports_desktop.svg";
import NavBarReportBugPage from "./DesktopNavBar";
import FormSubmitReportBugPage from "./ReportSubmitForm";


import BugReports from "@/public/static/images/bug_reports.svg";

import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";

export default function ReportBugPage(){
    const { darkMode } = useTheme();
    const { pageContent } = useApp();

    return (
        <section className="w-full flex flex-col min-h-screen gap-4 px-4 py-8 mx-auto md:max-w-[1200px]">
            <div className="w-full mx-auto pt-14 md:max-w-[1200px] md:pt-0">
                <Image
                    src={BugReportsDesktop}
                    alt={pageContent["report-bug-banner-desktop"]}
                    className="hidden md:block w-full h-auto md:max-h-[600px]"
                />
                <Image
                    src={BugReports}
                    alt={pageContent["eport-bug-banner-mobile"]}
                    className="block md:hidden w-full h-auto md:max-h-[600px]"
                />
            </div>
            <NavBarReportBugPage />
            <FormSubmitReportBugPage />
        </section>
    )}
