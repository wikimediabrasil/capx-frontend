import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

interface MiniBioTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
}

const DEFAULT_MAX_LENGTH = 2000;

export default function MiniBioTextarea({
  value,
  onChange,
  placeholder = '',
  maxLength = DEFAULT_MAX_LENGTH,
  className = '',
  disabled = false,
}: MiniBioTextareaProps) {
  const { darkMode } = useTheme();
  const [charCount, setCharCount] = useState(value.length);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const { pageContent } = useApp();

  useEffect(() => {
    setCharCount(value.length);
    setIsOverLimit(value.length > maxLength);
  }, [value, maxLength]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const remainingChars = maxLength - charCount;
  const isNearLimit = remainingChars <= 100;

  // Styles for custom scrollbar
  const scrollbarStyles = {
    scrollbarWidth: 'thin' as const,
    scrollbarColor: darkMode ? '#4B5563 #1F2937' : '#9CA3AF #F3F4F6',
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={`w-full font-[Montserrat] bg-transparent resize-none rounded-[4px] border-[1px] border-[solid] minibio-textarea ${
            darkMode
              ? 'text-white placeholder-gray-400 border-white'
              : 'text-[#053749] placeholder-[#829BA4] border-[#053749]'
          } ${isOverLimit ? 'border-red-500' : ''} ${className}`}
          style={{
            minHeight: '100px',
            padding: '8px 12px',
            ...scrollbarStyles,
          }}
        />
        <style jsx>{`
          .minibio-textarea::-webkit-scrollbar {
            width: 8px;
          }

          .minibio-textarea::-webkit-scrollbar-track {
            background: ${darkMode ? '#1F2937' : '#F3F4F6'};
            border-radius: 4px;
          }

          .minibio-textarea::-webkit-scrollbar-thumb {
            background: ${darkMode ? '#4B5563' : '#9CA3AF'};
            border-radius: 4px;
            transition: background-color 0.2s ease;
          }

          .minibio-textarea::-webkit-scrollbar-thumb:hover {
            background: ${darkMode ? '#6B7280' : '#6B7280'};
          }

          .minibio-textarea::-webkit-scrollbar-corner {
            background: ${darkMode ? '#1F2937' : '#F3F4F6'};
          }
        `}</style>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-[Montserrat] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            {charCount} / {maxLength}
          </span>
        </div>

        <span
          className={`text-xs font-[Montserrat] font-medium ${
            isOverLimit
              ? 'text-red-500'
              : isNearLimit
                ? 'text-yellow-600'
                : darkMode
                  ? 'text-gray-300'
                  : 'text-gray-600'
          }`}
        >
          {isOverLimit
            ? `${Math.abs(remainingChars)} ${pageContent['edit-profile-mini-bio-exceeded-chars']}`
            : `${remainingChars} ${pageContent['edit-profile-mini-bio-remaining-chars']}`}
        </span>
      </div>
    </div>
  );
}
