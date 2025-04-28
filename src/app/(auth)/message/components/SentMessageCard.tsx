import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Message } from '@/types/message';
import { useApp } from '@/contexts/AppContext';

interface SentMessageCardProps {
  submission: Message;
}

function formatDateLocale(timestamp: string, locale: string = navigator.language): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

const SentMessageCard: React.FC<SentMessageCardProps> = ({ submission }) => {
  const { darkMode } = useTheme();
  const { pageContent, language } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status?: string) => {
    if (!status) return '';
    
    switch (status) {
      case 'sent':
        return 'bg-[#0070B9] text-[#F6F6F6]';
      default:
        return 'bg-gray-500 text-[#F6F6F6]';
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden mb-4 ${
      darkMode 
        ? 'bg-[#053749] border-[#FFFFFF]'
        : 'bg-white border-[#507380]'
      } shadow-sm`}>
      <div className="p-4">
        <div className="mt-3">
          <h4 className={`text-[12px] md:text-[24px] font-[Montserrat] font-bold ${
            darkMode 
              ? 'text-[#FFFFFF]'
              : 'text-[#507380]'
            }`}>
            {pageContent["message-to-from"]}
          </h4>
          <div className={`mt-1 p-3 rounded-md ${
              darkMode
                ? 'bg-[#04222F]'
                : 'bg-[#EFEFEF]'
              }`}>
            <p className={`text-[12px] md:text-[24px] font-light ${
              darkMode 
                ? 'text-[#FFFFFF]'
                : 'text-[#053749]'
              }`}>

                
              {submission.receiver}
            </p>
          </div>
        </div>
        {submission.status && (
          <div className="mt-4 md:mt-12">
            <h4 className={`text-[12px] md:text-[24px] font-[Montserrat] font-bold ${
              darkMode
                ? 'text-[#FFFFFF]'
                : 'text-[#507380]'
              }`}>
              {pageContent["message-form-status"]}
            </h4>
            <div className={`mt-1 p-3 rounded-md ${
              darkMode
                ? 'bg-[#04222F]'
                : 'bg-[#EFEFEF]'
              }`}>
              <span className={`text-[12px] md:text-[24px] font-light px-3 py-1 rounded-md inline-block ${
                getStatusColor(submission.status)}`}>
                {submission.status}
              </span>
            </div>
          </div>
        )}
        {submission.method && isExpanded && (
          <div className="mt-4 md:mt-12">
            <h4 className={`text-[12px] md:text-[24px] font-[Montserrat] font-bold ${
              darkMode
                ? 'text-[#FFFFFF]'
                : 'text-[#507380]'
              }`}>
              {pageContent["message-form-method"]}
            </h4>
            <div className={`mt-1 p-3 rounded-md ${
              darkMode
                ? 'bg-[#04222F]'
                : 'bg-[#EFEFEF]'
              }`}>
              <span className={`text-[12px] md:text-[24px] font-light px-2 py-1 rounded-md ${
                darkMode
                  ? 'bg-[#053749] text-[#FFFFFF]'
                  : 'bg-[#053749] text-[#FFFFFF]'
                }`}>
                {submission.method}
              </span>
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 md:mt-12">
            <h4 className={`text-[12px] md:text-[24px] font-[Montserrat] font-bold ${
              darkMode
                ? 'text-[#FFFFFF]'
                : 'text-[#507380]'
              }`}>
              {pageContent["message-form-date"]}
            </h4>
            <div className={`mt-1 p-3 rounded-md ${
              darkMode
                ? 'bg-[#04222F]'
                : 'bg-[#EFEFEF]'
              }`}>
              <span className={`text-[12px] md:text-[24px] font-light px-2 py-1 rounded-md ${
                darkMode
                  ? 'bg-[#053749] text-[#FFFFFF]'
                  : 'bg-[#053749] text-[#FFFFFF]'
                }`}>
                {formatDateLocale(submission.date, language)}
              </span>
            </div>
          </div>
        )}
        <div className="mt-4 md:mt-12 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full text-[14px] md:text-[24px] font-bold px-[19px] py-[8px] rounded-[8px] font-[Montserrat] ${
              darkMode 
                ? 'bg-[#04222F] text-[#F6F6F6]' 
                : 'bg-[#053749] text-[#F6F6F6]'
            }`}
          >
            {isExpanded ? pageContent["message-form-hide"] : pageContent["message-form-view"]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SentMessageCard;
