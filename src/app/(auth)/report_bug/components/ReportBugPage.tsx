'use client';

import { useApp } from '@/contexts/AppContext';

import NavBarReportBugPage from './NavBar';
import Banner from '@/components/Banner';
import BugReport from '@/public/static/images/bug_reports.svg';

export default function ReportBugPage() {
  const { pageContent } = useApp();

  return (
    <section className="w-full flex flex-col min-h-screen pt-24 md:pt-8 gap-4 mx-auto md:max-w-[1200px]">
      <Banner
        image={BugReport}
        title={pageContent['report-bug-banner-page']}
        alt={pageContent['report-bug-alt-banner']}
      />
      <NavBarReportBugPage />
    </section>
  );
}
