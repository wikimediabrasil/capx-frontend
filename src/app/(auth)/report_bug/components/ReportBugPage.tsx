"use client"

import Image from "next/image";
import BugReportsDesktop from "@/public/static/images/bug_reports_desktop.svg";
import NavBarReportBugPage from "./NavBar";
import BugReports from "@/public/static/images/bug_reports.svg";
import { useApp } from "@/contexts/AppContext";

export default function ReportBugPage() {
    const { pageContent } = useApp();

    return (
        <section className="w-full flex flex-col min-h-screen gap-4 px-4 py-8 mx-auto md:max-w-[1200px]">
            <div className="w-full mx-auto pt-14 md:max-w-[1200px] md:pt-0 relative">
                <div className="hidden md:block relative">
                    <Image
                        src={BugReportsDesktop}
                        alt={pageContent["report-bug-banner-desktop"]}
                        className="w-full h-auto md:max-h-[600px]"
                    />
                    <h1 className="absolute left-[55%] top-[40%] text-[#FFFFFF] text-[48px] font-[Montserrat] font-bold">
                        {pageContent["report-bug-banner-page"]}
                    </h1>
                </div>
                <div className="block md:hidden relative">
                    <Image
                        src={BugReports}
                        alt={pageContent["report-bug-banner-mobile"]}
                        className="w-full h-auto md:max-h-[600px]"
                    />
                    <h1 className="absolute bottom-[8%] left-[30%] text-[#FFFFFF] text-center text-[20px] font-[Montserrat] font-bold ">
                        {pageContent["report-bug-banner-page"]}
                    </h1>
                </div>
            </div>
            <NavBarReportBugPage />
        </section>
    )
}
