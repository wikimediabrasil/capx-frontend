"use client";

import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useBugReportSubmissions } from "@/hooks/useBugReportSubmissions";

export default function SubmissionsList() {
  const { pageContent } = useApp();
  const { darkMode } = useTheme();
  
  const { reports, isLoading, error, formatDate } = useBugReportSubmissions();

  const statusLabels: Record<string, string> = {
    pending: pageContent["bug-report-status-pending"],
    in_progress: pageContent["bug-report-status-in-progress"],
    resolved: pageContent["bug-report-status-resolved"],
    closed: pageContent["bug-report-status-closed"],
  };

  const statusColors: Record<string, string> = {
    pending: darkMode 
      ? "bg-yellow-800 text-yellow-200" 
      : "bg-yellow-100 text-yellow-800",
    in_progress: darkMode 
      ? "bg-blue-800 text-blue-200" 
      : "bg-blue-100 text-blue-800",
    resolved: darkMode 
      ? "bg-green-800 text-green-200" 
      : "bg-green-100 text-green-800",
    closed: darkMode 
      ? "bg-gray-800 text-gray-200" 
      : "bg-gray-100 text-gray-800",
  };

  const typeLabels: Record<string, string> = {
    bug: pageContent["bug-report-type-bug"],
    feature: pageContent["bug-report-type-feature"],
    improvement: pageContent["bug-report-type-improvement"],
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Reports List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#851970]"></div>
        </div>
      ) : error ? (
        <div className={`p-4 rounded-md ${darkMode ? "bg-red-900 text-white" : "bg-red-100 text-red-800"}`}>
          {error}
        </div>
      ) : reports.length === 0 ? (
        <div className={`p-4 rounded-md ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"}`}>
          {pageContent["bug-report-no-submissions"] || "You haven't submitted any reports yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div 
              key={report.id} 
              className={`p-4 rounded-md ${darkMode ? "bg-gray-800" : "bg-white border border-gray-200"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {report.title}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${statusColors[report.status]}`}>
                  {statusLabels[report.status] || report.status}
                </span>
              </div>
              <p className={`text-sm mb-3 line-clamp-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {report.description}
              </p>
              <div className="flex justify-between text-xs">
                <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  {typeLabels[report.type] || report.type}
                </span>
                <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  {formatDate(report.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
