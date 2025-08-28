'use client';

import { useState } from 'react';
import { useBugReport, ReportType } from '@/hooks/useBugReport';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useRouter } from 'next/navigation';
import { BugReport } from '@/types/report';
import Popup from '@/components/Popup';

import Image from 'next/image';
import IconBug from '@/public/static/images/bug_icon.svg';
import IconBugWhite from '@/public/static/images/bug_icon_white.svg';
import BaseButton from '@/components/BaseButton';
import CancelIcon from '@/public/static/images/cancel.svg';
import Uploadicon from '@/public/static/images/upload.svg';
import ArrowDownIcon from '@/public/static/images/arrow_drop_down_circle.svg';
import ArrowDownIconWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';
import ButtonDesktopReportBugPage from './ButtonDesktop';
import SuccessSubmissionSVG from '@/public/static/images/capx_person_12.svg';

export default function FormSubmitReportBugPage() {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const [formData, setFormData] = useState<Partial<BugReport>>({
    title: '',
    description: '',
    author: '',
    bug_type: '',
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const reportTypeLabels: Record<string, string> = {
    [ReportType.ERROR]: pageContent['report-bug-type-error'],
    [ReportType.FEATURE]: pageContent['report-bug-type-feature'],
    [ReportType.IMPROVEMENT]: pageContent['report-bug-type-improvement'],
    [ReportType.TEST_CASE]: pageContent['report-bug-type-test-case'],
  };

  const { showTypeSelector, setShowTypeSelector, submitBugReport } = useBugReport();

  const handleSubmit = async () => {
    try {
      await submitBugReport(formData);
      setShowSuccessPopup(true);
      setFormData({
        title: '',
        description: '',
        bug_type: '',
      });
    } catch (error) {
      console.error('Error submitting bug report:', error);
      showSnackbar(pageContent['snackbar-submit-report-bug-failed-generic'], 'error');
    }
  };

  const handleContinue = () => {
    setShowSuccessPopup(false);
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
  };

  return (
    <section className="w-full h-full flex flex-col gap-4 px-4 py-4 md:min-h-41 mx-auto md:max-w-full">
      <div className="flex items-start gap-2 text-left">
        <Image
          src={darkMode ? IconBugWhite : IconBug}
          alt={pageContent['report-bug-icon']}
          className="w-4 h-5 md:w-[42px] md:h-[42px]"
        />
        <h1
          className={`text-[14px] font-[Montserrat] font-bold md:text-[32px] 
          ${darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'}`}
        >
          {pageContent['report-bug-heading']}
        </h1>
      </div>
      <div className="mt-4 md:mb-14 ">
        <h4
          className={`mb-2 text-[12px] font-[Montserrat] font-bold md:text-[24px]
          ${darkMode ? 'text-capx-light-bg' : 'text-[#507380]'}`}
        >
          {pageContent['report-bug-title']}
        </h4>
        <input
          type="text"
          id="title"
          value={formData.title}
          aria-label={pageContent['aria-label-report-bug-title'] || 'Report bug title'}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
            darkMode
              ? 'bg-transparent border-[#FFFFFF] text-white'
              : 'border-[#053749] text-[#829BA4]'
          }`}
          placeholder={pageContent['report-bug-title-placeholder']}
        />
      </div>
      <div className="mt-4 md:mb-14">
        <h4
          className={`text-[12px] font-[Montserrat] font-bold mb-2 md:text-[24px] ${
            darkMode ? 'text-capx-light-bg' : 'text-[#507380]'
          }`}
        >
          {pageContent['report-bug-description']}
        </h4>
        <textarea
          id="description"
          value={formData.description}
          aria-label={pageContent['aria-label-report-bug-description'] || 'Report bug description'}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className={`w-full px-3 py-2 m-0 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
            darkMode
              ? 'bg-transparent border-[#FFFFFF] text-white'
              : 'border-[#053749] text-[#829BA4]'
          }`}
          placeholder={pageContent['report-bug-description-placeholder']}
        ></textarea>
        <p
          className={`mt-1 text-[10px] md:text-[20px] ${
            darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'
          }`}
        >
          {pageContent['report-bug-description-informative-text']}
        </p>
      </div>

      <div className="mt-4">
        <h4
          className={`text-[12px] font-[Montserrat] font-bold mb-2 md:text-[24px]
            ${darkMode ? 'text-capx-light-bg' : 'text-[#507380]'}`}
        >
          {pageContent['report-bug-types-of-reports']}
        </h4>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTypeSelector(!showTypeSelector)}
            className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
              darkMode
                ? 'bg-[#04222F] border-[#FFFFFF] text-[#FFFFFF]'
                : 'border-[#053749] text-[#829BA4]'
            } flex justify-between items-center`}
          >
            {formData.bug_type
              ? reportTypeLabels[formData.bug_type]
              : pageContent['report-bug-types-of-reports-placeholder']}
            <Image
              src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
              alt={pageContent['alt-dropdown-arrow'] || 'Dropdown menu arrow'}
              width={20}
              height={20}
            />
          </button>

          {showTypeSelector && (
            <div
              className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
                darkMode ? 'bg-[#04222F] border-gray-700' : 'bg-[#FFFFFF] border-gray-200'
              } border`}
            >
              {Object.values(ReportType).map(bug_type => (
                <button
                  key={bug_type}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    darkMode ? 'text-white hover:bg-[#053749]' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setFormData({ ...formData, bug_type });
                    setShowTypeSelector(false);
                  }}
                >
                  {reportTypeLabels[bug_type]}
                </button>
              ))}
            </div>
          )}
        </div>
        <p
          className={`mt-1 text-[10px] md:text-[20px] ${
            darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'
          }`}
        >
          {pageContent['report-bug-types-of-reports-informative-text']}
        </p>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex flex-col gap-2 md:hidden">
        <BaseButton
          onClick={handleSubmit}
          label={pageContent['report-bug-submit-button']}
          customClass="flex border w-full rounded-md border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#851970]  items-center justify-between text-white !px-[13px] !py-[6px] rounded-md font-[Montserrat] text-[14px] font-bold pb-[6px]"
          imageUrl={Uploadicon}
          imageAlt="Upload icon"
          imageWidth={20}
          imageHeight={20}
        />
        <BaseButton
          onClick={() => router.back()}
          label={pageContent['report-bug-submit-cancel-button']}
          customClass="flex border w-full rounded-md border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#FFF] items-center justify-between text-capx-dark-box-bg !px-[13px] !py-[6px] rounded-md font-[Montserrat] text-[14px] font-bold pb-[6px]"
          imageUrl={CancelIcon}
          imageAlt="Cancel icon"
          imageWidth={20}
          imageHeight={20}
        />
      </div>
      <div className="hidden md:block">
        <ButtonDesktopReportBugPage handleSubmit={handleSubmit} />
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <Popup
          title={pageContent['snackbar-submit-report-bug-success-title']}
          closeButtonLabel={pageContent['auth-dialog-button-close']}
          continueButtonLabel={pageContent['auth-dialog-button-continue']}
          onClose={handleClosePopup}
          onContinue={handleContinue}
          image={SuccessSubmissionSVG}
        />
      )}
    </section>
  );
}
