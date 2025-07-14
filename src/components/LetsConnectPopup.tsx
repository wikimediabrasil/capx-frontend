import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Popup from './Popup';
import LetsConnectIcon from '@/public/static/images/lets_connect.svg';

interface LetsConnectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LetsConnectPopup({ isOpen, onClose, onConfirm }: LetsConnectPopupProps) {
  const { pageContent } = useApp();
  const { darkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <Popup
      title={pageContent['lets-connect-import-data-title']}
      image={LetsConnectIcon}
      onClose={onClose}
      onContinue={onConfirm}
      continueButtonLabel={pageContent['lets-connect-import-data-confirm']}
      closeButtonLabel={pageContent['lets-connect-import-data-cancel']}
    >
      <p className={`text-center text-lg ${darkMode ? 'text-white' : 'text-[#053749]'}`}>
        {pageContent['lets-connect-import-data-description']}
      </p>
    </Popup>
  );
}
