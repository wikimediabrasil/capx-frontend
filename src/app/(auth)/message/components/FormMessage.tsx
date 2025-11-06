'use client';

import ActionButtons from '@/components/ActionButton';
import Popup from '@/components/Popup';
import ArrowDownIcon from '@/public/static/images/arrow_drop_down_circle.svg';
import ArrowDownIconWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';
import SuccessSubmissionSVG from '@/public/static/images/capx_person_12.svg';
import IconChat from '@/public/static/images/chat.svg';
import IconChatWhite from '@/public/static/images/chat_white.svg';
import CleanIcon from '@/public/static/images/cleaning.svg';
import InfoIcon from '@/public/static/images/info.svg';
import InfoIconBlue from '@/public/static/images/info_blue.svg';
import SendIcon from '@/public/static/images/send.svg';
import Image from 'next/image';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useMessage } from '@/hooks/useMessage';
import { Message } from '@/types/message';
import { MessageService } from '@/services/messageService';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
export enum MessageMethod {
  EMAIL = 'email',
  TALKPAGE = 'talkpage',
}

export default function FormMessage() {
  const { darkMode } = useTheme();
  const { data: session } = useSession();
  const { pageContent } = useApp();
  const [formData, setFormData] = useState<Partial<Message>>({
    receiver: '',
    subject: '',
    message: '',
    method: '',
  });

  const searchParams = useSearchParams();
  const username = searchParams?.get('username');

  useEffect(() => {
    if (username) {
      setFormData(prev => ({ ...prev, receiver: username }));
    }
  }, [username]);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showInfoMessagePopup, setShowInfoMessagePopup] = useState(false);
  const [showInfoMethodPopup, setShowInfoMethodPopup] = useState(false);
  const [showNoEmailErrorPopup, setShowNoEmailErrorPopup] = useState(false);
  const [showUserNotFoundPopup, setShowUserNotFoundPopup] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState<string>('');

  const { showSnackbar } = useSnackbar();

  const messageMethodLabels: Record<string, string> = {
    [MessageMethod.EMAIL]: pageContent['message-form-method-email'],
    [MessageMethod.TALKPAGE]: pageContent['message-form-method-talkpage'],
  };

  const { showMethodSelector, setShowMethodSelector, sendMessage } = useMessage();

  const clearFormData = () => {
    setFormData({
      receiver: '',
      subject: '',
      message: '',
      method: '',
    });
  };

  const handleSubmit = async () => {
    setShowInfoMessagePopup(false);

    // Validate email availability before sending if method is email
    if (formData.method === MessageMethod.EMAIL && formData.receiver && session?.user?.token) {
      setIsCheckingEmail(true);
      try {
        const emailCheck = await MessageService.checkEmailable(
          formData.receiver,
          session.user.token
        );

        // Check if email sending is not possible
        if (!emailCheck.can_send_email) {
          setIsCheckingEmail(false);

          // Build descriptive message based on which party cannot use email
          let message = '';
          if (!emailCheck.sender_emailable && !emailCheck.receiver_emailable) {
            message = 'Neither you nor the receiver have email enabled in Wikimedia. Please use Talk Page instead.';
          } else if (!emailCheck.sender_emailable) {
            message = 'You do not have email enabled in your Wikimedia account. Please use Talk Page instead.';
          } else if (!emailCheck.receiver_emailable) {
            message = 'The receiver does not accept emails. Please use Talk Page instead.';
          }

          setEmailCheckMessage(message);
          setShowNoEmailErrorPopup(true);
          return;
        }
      } catch (error: any) {
        setIsCheckingEmail(false);
        console.error('Error checking email availability:', error);
        showSnackbar('Failed to verify email availability. Proceeding with automatic fallback.', 'error');
        // Continue with sending - backend will handle fallback
      }
      setIsCheckingEmail(false);
    }

    try {
      const result = await sendMessage(formData);

      // Check if there was a fallback (method changed from email to talkpage)
      if (result.method === MessageMethod.TALKPAGE &&
          formData.method === MessageMethod.EMAIL &&
          result.error_message) {
        showSnackbar(`⚠️ ${result.error_message}`, 'error');
      }

      setShowSuccessPopup(true);
      setFormData({
        receiver: '',
        subject: '',
        message: '',
        method: '',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      showSnackbar('Failed to send message', 'error');
    }
  };

  const handleContinueSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  const handleCloseInfoMessagePopup = () => {
    setShowInfoMessagePopup(false);
  };

  const handleShowInfoMessagePopup = () => {
    setShowInfoMessagePopup(true);
  };

  const handleShowInfoMethodPopup = () => {
    setShowInfoMethodPopup(true);
  };

  const handleCloseInfoMethodPopup = () => {
    setShowInfoMethodPopup(false);
  };

  const handleCloseNoEmailErrorPopup = () => {
    setShowNoEmailErrorPopup(false);
  };

  const handleSwitchToTalkPage = () => {
    setFormData({ ...formData, method: MessageMethod.TALKPAGE });
    setShowNoEmailErrorPopup(false);
  };

  const handleCloseUserNotFoundPopup = () => {
    setShowUserNotFoundPopup(false);
  };

  return (
    <section className="w-full h-full flex flex-col gap-4 px-4 py-4 md:min-h-41 md:max-w-full">
      <div className="flex items-start gap-2 text-left">
        <Image
          src={darkMode ? IconChatWhite : IconChat}
          alt={pageContent['message-form-icon-alt']}
          className="w-4 h-5 md:w-[42px] md:h-[42px]"
        />
        <h1
          className={`text-[14px] font-[Montserrat] font-bold md:text-[32px]
            ${darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'}`}
        >
          {pageContent['message-form-heading']}
        </h1>
      </div>

      <div className="mt-2 ">
        <h4
          className={`mb-2 text-[12px] font-[Montserrat] font-bold md:text-[24px]
                ${darkMode ? 'text-capx-light-bg' : 'text-[#507380]'}`}
        >
          {pageContent['message-form-from']}
        </h4>
        <div
          className={`flex items-center px-4 py-2 rounded-md border ${
            darkMode ? 'border-white' : 'border-[#053749]'
          }`}
        >
          <span
            className={`px-2 py-1 text-[12px] md:text-[24px] rounded ${
              darkMode ? 'bg-[#FFFFFF] text-[#053749]' : 'bg-[#053749] text-white'
            }`}
          >
            {session?.user?.name ?? ''}
          </span>
        </div>
      </div>

      <div className="mt-2">
        <h4
          className={`mb-2 text-[12px] font-[Montserrat] font-bold md:text-[24px]
                ${darkMode ? 'text-capx-light-bg' : 'text-[#507380]'}`}
        >
          {pageContent['message-to-from']}
        </h4>
        <input
          type="text"
          id="to"
          value={formData.receiver}
          onChange={e => setFormData({ ...formData, receiver: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
            darkMode
              ? 'bg-transparent border-[#FFFFFF] text-white'
              : 'border-[#053749] text-[#829BA4]'
          }`}
          placeholder={pageContent['message-form-to-placeholder']}
        />
      </div>

      <div className="mt-2">
        <h4
          className={`text-[12px] font-[Montserrat] font-bold mb-2 md:text-[24px]
                ${darkMode ? 'text-capx-light-bg' : 'text-[#507380]'}`}
        >
          {pageContent['message-form-method']}
        </h4>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMethodSelector(!showMethodSelector)}
            className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
              darkMode
                ? 'bg-[#04222F] border-[#FFFFFF] text-[#FFFFFF]'
                : 'border-[#053749] text-[#829BA4]'
            } flex justify-between items-center`}
          >
            {formData.method ? formData.method : pageContent['message-form-method-placeholder']}
            <Image
              src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
              alt={pageContent['alt-dropdown-arrow'] || 'Dropdown menu arrow'}
              width={20}
              height={20}
            />
          </button>

          {showMethodSelector && (
            <div
              className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
                darkMode ? 'bg-[#04222F] border-gray-700' : 'bg-[#FFFFFF] border-gray-200'
              } border`}
            >
              {Object.values(MessageMethod).map(method => (
                <button
                  key={method}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    darkMode ? 'text-white hover:bg-[#053749]' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setFormData({ ...formData, method });
                    setShowMethodSelector(false);
                  }}
                >
                  {messageMethodLabels[method]}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <p
            className={`mt-1 text-[10px] md:text-[20px] ${
              darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'
            }`}
          >
            {pageContent['message-form-method-informative-text']}
          </p>
          <Image
            src={darkMode ? InfoIcon : InfoIconBlue}
            alt={pageContent['message-info-alt-icon']}
            width={16}
            height={16}
            className="cursor-pointer"
            onClick={handleShowInfoMethodPopup}
          />
        </div>
      </div>

      <div className="mt-2">
        <h4
          className={`mb-2 text-[12px] font-[Montserrat] font-bold md:text-[24px]
                ${darkMode ? 'text-capx-light-bg' : 'text-[#507380]'}`}
        >
          {pageContent['message-form-subject']}
        </h4>
        <input
          type="text"
          id="subject"
          value={formData.subject}
          onChange={e => setFormData({ ...formData, subject: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
            darkMode
              ? 'bg-transparent border-[#FFFFFF] text-white'
              : 'border-[#053749] text-[#829BA4]'
          }`}
          placeholder={pageContent['message-form-subject-placeholder']}
        />
        <p
          className={`mt-1 text-[10px] md:text-[20px] ${
            darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'
          }`}
        >
          {pageContent['message-form-subject-informative-text']}
        </p>
      </div>

      <div className="mt-2 md:mb-14">
        <h4
          className={`text-[12px] font-[Montserrat] font-bold mb-2 md:text-[24px] ${
            darkMode ? 'text-capx-light-bg' : 'text-[#507380]'
          }`}
        >
          {pageContent['message-form-message']}
        </h4>
        <textarea
          id="message"
          value={formData.message}
          onChange={e => setFormData({ ...formData, message: e.target.value })}
          rows={4}
          className={`w-full h-auto px-3 py-2 m-0 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
            darkMode
              ? 'bg-transparent border-[#FFFFFF] text-white'
              : 'border-[#053749] text-[#829BA4]'
          }`}
          placeholder={pageContent['message-form-message-placeholder']}
        ></textarea>
        <p
          className={`mt-1 text-[10px] md:text-[20px] ${
            darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'
          }`}
        >
          {pageContent['message-form-informative-text']}
        </p>
      </div>

      <ActionButtons
        handleAhead={handleShowInfoMessagePopup}
        labelButtonAhead={pageContent['message-form-submit-button']}
        iconAhead={SendIcon}
        iconAltAhead={pageContent['message-alt-icon']}
        handleBack={clearFormData}
        labelButtonBack={pageContent['message-form-clean-button']}
        iconBack={CleanIcon}
        iconAltBack={pageContent['message-alt-back-to-home']}
      />

      {/* Info Message Popup */}
      {showInfoMessagePopup && (
        <Popup
          title={pageContent['message-info-popup-title']}
          closeButtonLabel={pageContent['message-button-cancel-message']}
          continueButtonLabel={pageContent['message-button-confirme-and-send']}
          onClose={handleCloseInfoMessagePopup}
          onContinue={handleSubmit}
          image={SuccessSubmissionSVG}
        >
          {pageContent['message-info-popup']}
        </Popup>
      )}
      {/* Success Popup */}
      {showSuccessPopup && (
        <Popup
          title={pageContent['snackbar-submit-message-success-title']}
          closeButtonLabel={pageContent['auth-dialog-button-close']}
          continueButtonLabel={pageContent['auth-dialog-button-continue']}
          onClose={handleCloseSuccessPopup}
          onContinue={handleContinueSuccessPopup}
          image={SuccessSubmissionSVG}
        />
      )}
      {/* Info Method Popup */}
      {showInfoMethodPopup && (
        <Popup
          title={pageContent['message-info-popup-title']}
          closeButtonLabel={pageContent['auth-dialog-button-close']}
          onClose={handleCloseInfoMethodPopup}
          image={SuccessSubmissionSVG}
        >
          {pageContent['message-info-popup']}
        </Popup>
      )}
      {/* No Email Error Popup */}
      {showNoEmailErrorPopup && (
        <Popup
          title={pageContent['message-error-no-email-title'] || 'Email Not Available'}
          closeButtonLabel={pageContent['auth-dialog-button-close']}
          continueButtonLabel={pageContent['message-error-use-talkpage-button'] || 'Use Talk Page'}
          onClose={handleCloseNoEmailErrorPopup}
          onContinue={handleSwitchToTalkPage}
          image={InfoIcon}
        >
          {emailCheckMessage || pageContent['message-error-no-email-body']}
        </Popup>
      )}
      {/* User Not Found Error Popup */}
      {showUserNotFoundPopup && (
        <Popup
          title={pageContent['message-error-user-not-found']}
          closeButtonLabel={pageContent['auth-dialog-button-close']}
          onClose={handleCloseUserNotFoundPopup}
          image={InfoIcon}
        >
          {pageContent['message-error-user-not-found-body']}
        </Popup>
      )}
    </section>
  );
}
