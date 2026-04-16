import InfoIcon from '@/public/static/images/info.svg';
import LanguageIcon from '@/public/static/images/language.svg';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { useDarkMode, useIsMobile, useLanguage, usePageContent } from '@/stores';
interface TranslationContributeCTAProps {
  onContribute: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * Call-to-action component shown when a capacity falls back to English translation
 * Encourages users to contribute translations by opening the translate modal
 */
export function TranslationContributeCTA({
  onContribute,
  className = '',
  compact = false,
}: Readonly<TranslationContributeCTAProps>) {
  const pageContent = usePageContent();

  const language = useLanguage();

  const isMobile = useIsMobile();
  const darkMode = useDarkMode();
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside (mobile)
  useEffect(() => {
    if (!showHelpPopup || !isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowHelpPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHelpPopup, isMobile]);

  // Don't show CTA if we're already in English
  if (language === 'en') {
    return null;
  }

  // Help text for Metabase account requirement
  const helpText =
    pageContent['translation-help-text'] ||
    'To contribute translations, you need to create a free account on Metabase. Click the contribute link to get started!';

  // Help icon component
  const HelpIcon = () => (
    <div className="relative inline-block">
      {isMobile ? (
        // Mobile: Click to show popup
        <>
          <button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setShowHelpPopup(!showHelpPopup);
            }}
            className={`inline-flex items-center justify-center w-4 h-4 rounded-full transition-colors ${
              darkMode ? 'hover:bg-blue-800/50 text-blue-300' : 'hover:bg-blue-200 text-blue-600'
            }`}
          >
            <Image
              src={InfoIcon}
              alt={pageContent['translation-alt-help'] || 'Help'}
              width={12}
              height={12}
              className={darkMode ? 'opacity-80' : 'filter invert opacity-80'}
            />
          </button>

          {/* Mobile popup */}
          {showHelpPopup && (
            <div
              ref={popupRef}
              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 rounded-lg shadow-lg border z-50 ${
                darkMode
                  ? 'bg-gray-800 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <div className="text-xs leading-relaxed">{helpText}</div>
              <button
                onClick={() => setShowHelpPopup(false)}
                className={`mt-2 text-xs font-medium ${
                  darkMode ? 'text-blue-300' : 'text-blue-600'
                }`}
              >
                {pageContent['translation-mobile-got-it'] || 'Got it'}
              </button>
              {/* Arrow */}
              <div
                className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                  darkMode ? 'border-t-gray-800' : 'border-t-white'
                }`}
              />
            </div>
          )}
        </>
      ) : (
        // Desktop: Hover tooltip
        <div className="group relative inline-block">
          <div
            className={`inline-flex items-center justify-center w-4 h-4 rounded-full transition-colors cursor-help ${
              darkMode ? 'hover:bg-blue-800/50 text-blue-300' : 'hover:bg-blue-200 text-blue-600'
            }`}
          >
            <Image
              src={InfoIcon}
              alt={pageContent['translation-alt-help'] || 'Help'}
              width={12}
              height={12}
              className={darkMode ? 'opacity-80' : 'filter invert opacity-80'}
            />
          </div>

          {/* Desktop tooltip */}
          <div
            className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${
              darkMode
                ? 'bg-gray-800 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <div className="text-xs leading-relaxed">{helpText}</div>
            {/* Arrow */}
            <div
              className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                darkMode ? 'border-t-gray-800' : 'border-t-white'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <div
        className={`flex flex-col gap-2 mt-3 p-2 rounded-md ${
          darkMode
            ? 'bg-capx-dark-box-bg border border-blue-800/50'
            : 'bg-blue-50 border border-blue-200'
        } ${className}`}
      >
        {isMobile ? (
          // Mobile: Vertical layout
          <>
            <div className="flex items-center gap-2.5">
              <Image
                src={LanguageIcon}
                alt={pageContent['translation-alt-translate'] || 'Translate'}
                width={20}
                height={20}
                className={darkMode ? 'filter invert brightness-75' : 'opacity-75'}
              />
              <div className="flex items-center gap-1 flex-1">
                <span
                  className={`text-capx-text-xs text-left ${
                    darkMode ? 'text-blue-200' : 'text-capx-dark-box-bg'
                  }`}
                >
                  {pageContent['translation-contribute-compact'] ||
                    "Don't see this capacity in your selected language? Help us translate it on Metabase!"}
                </span>
                <HelpIcon />
              </div>
            </div>
            <div className="flex justify-start pl-7">
              <button
                type="button"
                onClick={onContribute}
                className={`flex items-center gap-1 text-xs transition-all duration-200 ${
                  darkMode
                    ? 'text-blue-300 hover:text-blue-200'
                    : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                <span className={`capx-text-xs ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  {pageContent['translation-contribute-link'] || 'Contribute'}
                </span>
              </button>
            </div>
          </>
        ) : (
          // Desktop: Horizontal layout
          <div className="flex items-center gap-2.5 min-w-0">
            <Image
              src={LanguageIcon}
              alt="Translate"
              width={20}
              height={20}
              className={darkMode ? 'filter invert brightness-75' : 'opacity-75'}
            />
            <div
              className={`text-capx-text-xs ${
                darkMode ? 'text-blue-200' : 'text-capx-dark-box-bg'
              }`}
            >
              {pageContent['translation-contribute-compact'] ||
                "Don't see this capacity in your selected language? Help us translate it on Metabase!"}
              <HelpIcon />
            </div>
            <button
              type="button"
              onClick={onContribute}
              className={`flex items-center gap-1 text-xs transition-all duration-200 ${
                darkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              <span className={`capx-text-xs ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                {pageContent['translation-contribute-link'] || 'Contribute'}
              </span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg p-4 mt-4 border-l-4 ${
        darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-box-bg'
      } ${className} ${!isMobile ? 'max-w-md' : ''}`}
    >
      <button
        type="button"
        onClick={onContribute}
        className={`inline-flex items-start gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 w-full text-left ${
          darkMode ? 'text-blue-200' : 'text-white'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div
              className={`p-1.5 rounded-full ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-blue-100'}`}
            >
              <Image
                src={LanguageIcon}
                alt={pageContent['translation-alt-translation-needed'] || 'Translation needed'}
                width={16}
                height={16}
                className={darkMode ? 'filter invert brightness-90' : 'opacity-80'}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <h4
                className={`text-sm font-semibold text-left ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}
              >
                {pageContent['translation-needed'] || 'Translation Needed'}
              </h4>
              <div
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  darkMode ? 'bg-capx-dark-box-bg text-blue-200' : 'bg-blue-200 text-blue-800'
                }`}
              >
                {pageContent['translation-help-wanted'] || 'Help wanted'}
              </div>
            </div>
            <div
              className={`text-sm leading-relaxed mb-3 text-left ${
                darkMode ? 'text-blue-200/90' : 'text-capx-dark-box-bg/90'
              }`}
            >
              {pageContent['translation-contribute-message'] ||
                "Don't see this capacity in your selected language? Help us translate it on Metabase!"}
              <HelpIcon />
            </div>
            <div className="text-left">
              <span className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                {pageContent['translation-contribute-link'] || 'Contribute'}
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
