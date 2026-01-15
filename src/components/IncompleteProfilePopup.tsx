import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Popup from './Popup';
import FirstLoginImage from '@/public/static/images/capx_complete_profile.svg';

interface IncompleteProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function IncompleteProfilePopup({
  isOpen,
  onClose,
  onContinue,
}: IncompleteProfilePopupProps) {
  const { pageContent } = useApp();
  const { darkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <Popup
      title={pageContent['profile-incomplete-popup-title'] || 'Complete Your Profile'}
      image={FirstLoginImage}
      onClose={onClose}
      onContinue={onContinue}
      continueButtonLabel={pageContent['profile-incomplete-popup-button-edit'] || 'Edit Profile'}
      closeButtonLabel={pageContent['auth-dialog-button-close'] || 'Close'}
    >
      <p className={`text-center text-lg ${darkMode ? 'text-white' : 'text-[#053749]'}`}>
        {pageContent['profile-incomplete-popup-description'] ||
          'Your profile is missing some important information. Please add your territory, language, and known capacities to help others find you.'}
      </p>
    </Popup>
  );
}
