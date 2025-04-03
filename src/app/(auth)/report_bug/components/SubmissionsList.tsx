"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useBugReportSubmissions } from "@/hooks/useBugReportSubmissions";
import SubmissionCard from "./SubmissionCard";
import { BugReport } from "@/types/report";
import { PaginationButtons } from "@/components/PaginationButtons";

export default function SubmissionsList() {
  const { pageContent } = useApp();
  const { darkMode } = useTheme();
  
  const { reports, isLoading, error } = useBugReportSubmissions();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedReports, setPaginatedReports] = useState<BugReport[]>([]);
  
  const itemsPerPage = 5;
  const totalPages = Math.ceil((reports?.length || 0) / itemsPerPage);

  useEffect(() => {
    if (reports) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedReports(reports.slice(startIndex, endIndex));
    }
  }, [currentPage, reports]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <section className="w-full h-full flex flex-col gap-4 px-4 py-4 md:min-h-41 mx-auto md:max-w-full">
      {/* Reports List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#851970]"></div>
        </div>
      ) : error ? (
        <div className={`p-4 rounded-md ${darkMode ? "bg-red-900 text-white" : "bg-red-100 text-red-800"}`}>
          {error}
        </div>
      ) : paginatedReports.length === 0 ? (
        <div className={`p-4 rounded-md ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"}`}>
          {pageContent["bug-report-no-submissions"] || "You haven't submitted any reports yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedReports.map((report) => (
            <SubmissionCard key={report.id} submission={report} />
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <PaginationButtons
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </section>
  );
}
