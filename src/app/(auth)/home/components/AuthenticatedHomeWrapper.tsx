'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AuthenticatedMainSection from './AuthenticatedMainSection';
import Popup from '@/components/Popup';
import IncompleteProfilePopup from '@/components/IncompleteProfilePopup';
import FirstLoginImage from '@/public/static/images/capx_complete_profile.svg';
import { useApp } from '@/contexts/AppContext';
import { useProfile } from '@/hooks/useProfile';
import { isProfileIncomplete } from '@/utils/checkProfileCompleteness';

interface AuthenticatedHomeWrapperProps {
  isFirstLogin: boolean;
}

const SESSION_STORAGE_KEY = 'incomplete-profile-popup-shown';

export default function AuthenticatedHomeWrapper({ isFirstLogin }: AuthenticatedHomeWrapperProps) {
  const router = useRouter();
  const { pageContent } = useApp();
  const { data: session } = useSession();
  const token = session?.user?.token;
  const userId = session?.user?.id ? Number(session.user.id) : undefined;
  const { profile, isLoading } = useProfile(token, userId);
  const [showIncompleteProfilePopup, setShowIncompleteProfilePopup] = useState(false);

  const handleContinue = () => {
    router.push('/profile/edit');
  };

  const handleCloseIncompletePopup = () => {
    setShowIncompleteProfilePopup(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    }
  };

  const handleContinueIncompletePopup = () => {
    handleCloseIncompletePopup();
    router.push('/profile/edit');
  };

  // Check if profile is incomplete and show popup if needed
  useEffect(() => {
    if (isLoading || !profile) {
      return;
    }

    // Check if popup was already shown in this session
    if (typeof window !== 'undefined') {
      const wasShown = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
      if (wasShown) {
        return;
      }
    }

    // Check if profile is incomplete
    if (isProfileIncomplete(profile)) {
      setShowIncompleteProfilePopup(true);
    }
  }, [profile, isLoading]);

  return (
    <>
      <AuthenticatedMainSection pageContent={pageContent} />
      {isFirstLogin && (
        <Popup
          onContinue={handleContinue}
          onClose={() => {}}
          image={FirstLoginImage}
          title={pageContent['complete-your-profile']}
          closeButtonLabel={pageContent['auth-dialog-button-close']}
          continueButtonLabel={pageContent['auth-dialog-button-continue']}
        />
      )}
      <IncompleteProfilePopup
        isOpen={showIncompleteProfilePopup}
        onClose={handleCloseIncompletePopup}
        onContinue={handleContinueIncompletePopup}
      />
    </>
  );
}
