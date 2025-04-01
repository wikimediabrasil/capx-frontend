import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { BugReport } from '@/types/report';
import { useApp } from '@/contexts/AppContext';

interface SubmissionCardProps {
  submission: BugReport;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission }) => {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status?: string) => {
    if (!status) return '';
    
    switch (status) {
      case 'in-progress':
        return 'bg-blue-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden mb-4 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } shadow-sm`}>
      <div className="p-4">
        <div className="mt-3">
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            {pageContent["report-bug-title"]}
          </h3>
          <div className={`mt-1 p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {submission.title}
            </p>
          </div>
        </div>

        {submission.status && (
          <div className="mt-3">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              {pageContent["report-bug-status"]}
            </h3>
            <div className={`mt-1 p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <span className={`px-3 py-1 text-sm font-medium rounded-md inline-block ${getStatusColor(submission.status)}`}>
                {submission.status}
              </span>
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="mt-3">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              {pageContent["report-bug-description"]}
            </h3>
            <div className={`mt-1 p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {submission.description}
              </p>
            </div>
          </div>
        )}

        {submission.type && isExpanded && (
          <div className="mt-3">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              {pageContent["report-bug-type"]}
            </h3>
            <div className={`mt-1 p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <span className={`text-xs font-medium px-2 py-1 rounded-md ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                {submission.type}
              </span>
            </div>
          </div>
        )}

        {submission.type && isExpanded && (
          <div className="mt-3">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              {pageContent["report-bug-created-at"]}
            </h3>
            <div className={`mt-1 p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <span className={`text-xs font-medium px-2 py-1 rounded-md ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                {submission.created_at}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-1 text-sm font-medium rounded-md ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-[#002B3D] hover:bg-[#003b52] text-white'
            }`}
          >
            {isExpanded ? pageContent["report-bug-hide"] : pageContent["report-bug-view"]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionCard;
