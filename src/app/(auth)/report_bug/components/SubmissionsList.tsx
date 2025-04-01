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
  
  const { reports: teste, isLoading, error } = useBugReportSubmissions();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedReports, setPaginatedReports] = useState<BugReport[]>([]);
  
  const itemsPerPage = 5;
  const totalPages = Math.ceil((teste?.length || 0) / itemsPerPage);

  useEffect(() => {
    if (reports) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedReports(reports.slice(startIndex, endIndex));
    }
  }, [currentPage, teste]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  // Mock data for development/testing
  const mockSubmissions: BugReport[] = [
    {
      id: 1,
      author: "user1",
      title: "Saved Profile Not Displayed in Library",
      status: "in-progress",
      description: "A bug is causing saved profiles not to appear in the library section of the application. After saving a profile, it should be added to the library, but the profile is not displayed as expected.",
      type: "new feature",
      created_at: "2023-05-15T10:30:00Z",
      updated_at: "2023-05-15T10:30:00Z"
    },
    {
      id: 2,
      author: "user2",
      title: "Search Function Not Working",
      status: "pending",
      description: "The search function in the application is not returning any results, even when searching for items that definitely exist in the database.",
      type: "bug",
      created_at: "2023-05-16T14:20:00Z",
      updated_at: "2023-05-16T14:20:00Z"
    },
    {
      id: 3,
      author: "user1",
      title: "Add Dark Mode Support",
      status: "completed",
      description: "Implement a dark mode option for the application to improve user experience in low-light environments.",
      type: "enhancement",
      created_at: "2023-05-17T09:15:00Z",
      updated_at: "2023-05-17T09:15:00Z"
    },
    {
      id: 4,
      author: "user3",
      title: "Login Page Crashes on Mobile",
      status: "in-progress",
      description: "The login page crashes when accessed from mobile devices, particularly on iOS devices running version 14 or later.",
      type: "bug",
      created_at: "2023-05-18T16:45:00Z",
      updated_at: "2023-05-18T16:45:00Z"
    },
    {
      id: 5,
      author: "user2",
      title: "Improve Accessibility Features",
      status: "pending",
      description: "Enhance the application's accessibility features to better support users with disabilities, including screen reader compatibility and keyboard navigation.",
      type: "enhancement",
      created_at: "2023-05-19T11:30:00Z",
      updated_at: "2023-05-19T11:30:00Z"
    },
    {
      id: 6,
      author: "user4",
      title: "Performance Issues on Large Datasets",
      status: "pending",
      description: "The application becomes slow and unresponsive when working with large datasets, particularly when generating reports or visualizations.",
      type: "bug",
      created_at: "2023-05-20T13:20:00Z",
      updated_at: "2023-05-20T13:20:00Z"
    }
  ];

  const reports = mockSubmissions;

  // Use mock data for development, real data in production
  const displayReports = reports?.length ? paginatedReports : mockSubmissions.slice(0, itemsPerPage);
  const displayTotalPages = reports?.length ? totalPages : Math.ceil(mockSubmissions.length / itemsPerPage);

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
      ) : displayReports.length === 0 ? (
        <div className={`p-4 rounded-md ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"}`}>
          {pageContent["bug-report-no-submissions"] || "You haven't submitted any reports yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {displayReports.map((report) => (
            <SubmissionCard key={report.id} submission={report} />
          ))}
          
          {/* Pagination */}
          {displayTotalPages > 1 && (
            <PaginationButtons
              currentPage={currentPage}
              totalPages={displayTotalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </section>
  );
}
