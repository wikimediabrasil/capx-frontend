import { usePageContent } from '@/stores';
import { useTheme } from '@/contexts/ThemeContext';
import UserCheckIcon from '@/public/static/images/user_check.svg';
import UserCheckIconDark from '@/public/static/images/user_check_dark.svg';
import React, { useEffect } from 'react';
import Popup from './Popup';

interface ProfileDeletedSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDeletedSuccessPopup: React.FC<ProfileDeletedSuccessPopupProps> = ({
  isOpen,
  onClose,
}) => {
  const { darkMode } = useTheme();
  const pageContent = usePageContent();

  // Auto-close after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Popup
      image={darkMode ? UserCheckIcon : UserCheckIconDark}
      title={pageContent['profile-deleted-title'] || 'Profile successfully deleted'}
      closeButtonLabel={pageContent['profile-deleted-ok-button'] || 'OK'}
      onClose={onClose}
      imageSize="w-full max-w-[150px] md:max-w-[200px]"
      titleClassName="md:text-right"
      closeButtonClassName="bg-[#851C6A] hover:bg-capx-primary-green text-white font-extrabold rounded-lg text-sm md:text-lg py-2 px-4 md:py-3 md:px-6 min-w-[100px] md:min-w-[150px]"
    >
      <div className="flex flex-col gap-4">
        <p className="text-base md:text-lg font-normal">
          {pageContent['profile-deleted-message'] ||
            'Your profile has been permanently deleted from CapX.'}
        </p>
        <p className="text-sm md:text-base font-normal opacity-80">
          {pageContent['profile-deleted-submessage'] ||
            'Thank you for being part of our community. You can create a new account at any time.'}
        </p>
      </div>
    </Popup>
  );
};

export default ProfileDeletedSuccessPopup;
