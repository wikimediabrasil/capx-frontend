import React, { useState } from 'react';
import { BugReport } from '@/types/report';

import { useDarkMode, useLanguage, usePageContent } from '@/stores';
interface SubmissionCardProps {
  submission: BugReport;
}

function formatDateLocale(timestamp: string, locale: string = navigator.language): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission }) => {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();

  const language = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`border rounded-lg overflow-hidden mb-4 ${
        darkMode ? 'bg-[#053749] border-[#FFFFFF]' : 'bg-white border-[#507380]'
      } shadow-sm`}
    >
      <div className="p-4">
        <div className="mt-3">
          <h4
            className={`text-[12px] md:text-[24px] font-[Montserrat] font-bold ${
              darkMode ? 'text-[#FFFFFF]' : 'text-[#507380]'
            }`}
          >
            {pageContent['report-bug-title']}
          </h4>
          <div className={`mt-1 p-3 rounded-md ${darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'}`}>
            <p
              className={`text-[12px] md:text-[24px] font-light ${
                darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'
              }`}
            >
              {submission.title}
            </p>
          </div>
        </div>

        <div className="mt-4 md:mt-6">
          <h4
            className={`text-[12px] md:text-[24px] font-[Montserrat] font-bold ${
              darkMode ? 'text-[#FFFFFF]' : 'text-[#507380]'
            }`}
          >
            {pageContent['report-bug-description']}
          </h4>
          <div className={`mt-1 p-3 rounded-md ${darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'}`}>
            <p
              className={`text-[12px] md:text-[24px] font-light whitespace-pre-wrap ${
                darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'
              }`}
            >
              {submission.description}
            </p>
          </div>
        </div>

        {submission.bug_type && isExpanded && (
          <div className="mt-4 md:mt-12">
            <h4
              className={`text-[12px] md:text-[24px] font-[Montserrat] font-bold ${
                darkMode ? 'text-[#FFFFFF]' : 'text-[#507380]'
              }`}
            >
              {pageContent['report-bug-type']}
            </h4>
            <div className={`mt-1 p-3 rounded-md ${darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'}`}>
              <span
                className={`text-[12px] md:text-[24px] font-light px-2 py-1 rounded-md ${'bg-[#053749] text-[#FFFFFF]'}`}
              >
                {submission.bug_type}
              </span>
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 md:mt-12">
            <h4
              className={`text-[12px] md:text-[24px] font-[Montserrat] font-bold ${
                darkMode ? 'text-[#FFFFFF]' : 'text-[#507380]'
              }`}
            >
              {pageContent['report-bug-submitted-at']}
            </h4>
            <div className={`mt-1 p-3 rounded-md ${darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'}`}>
              <span
                className={`text-[12px] md:text-[24px] font-light px-2 py-1 rounded-md ${'bg-[#053749] text-[#FFFFFF]'}`}
              >
                {formatDateLocale(submission.created_at, language)}
              </span>
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 md:mt-12">
            <h4
              className={`text-[12px] md:text-[24px] font-[Montserrat] font-bold ${
                darkMode ? 'text-[#FFFFFF]' : 'text-[#507380]'
              }`}
            >
              {pageContent['report-bug-updated-at']}
            </h4>
            <div className={`mt-1 p-3 rounded-md ${darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'}`}>
              <span
                className={`text-[12px] md:text-[24px] font-light px-2 py-1 rounded-md ${'bg-[#053749] text-[#FFFFFF]'}`}
              >
                {formatDateLocale(submission.updated_at, language)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 md:mt-12 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full text-[14px] md:text-[24px] font-bold px-[19px] py-[8px] rounded-[8px] font-[Montserrat] ${
              darkMode ? 'bg-[#04222F] text-[#F6F6F6]' : 'bg-[#053749] text-[#F6F6F6]'
            }`}
          >
            {isExpanded ? pageContent['report-bug-hide'] : pageContent['report-bug-view']}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionCard;
