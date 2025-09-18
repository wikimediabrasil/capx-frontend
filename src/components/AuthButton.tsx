'use client';
import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import axios from 'axios';
import BaseButton from './BaseButton';
import Popup from './Popup';
import capxPersonIcon from '../../public/static/images/capx_person_icon.svg';
import { useApp } from '@/contexts/AppContext';

interface AuthButtonProps {
  message: string;
  isSignOut?: boolean;
  customClass?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  isMobileMenu?: boolean;
}

export default function AuthButton({
  message,
  isSignOut = false,
  customClass,
  imageUrl,
  imageAlt,
  imageWidth,
  imageHeight,
  isMobileMenu = false,
}: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { pageContent } = useApp();
  const handleAuth = async () => {
    setIsLoading(true);

    if (isSignOut) {
      await signOut({ redirect: true, callbackUrl: '/' });
      setShowPopup(false);
      return;
    }

    try {
      // Clean old tokens before starting new flow
      localStorage.removeItem('oauth_token');
      localStorage.removeItem('oauth_token_secret');

      const response = await axios.post('/api/login', null, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.data?.redirect_url) {
        // Store new tokens
        localStorage.setItem('oauth_token', response.data.oauth_token);
        localStorage.setItem('oauth_token_secret', response.data.oauth_token_secret);
        window.location.href = response.data.redirect_url;
      } else {
        throw new Error('Redirect URL not received');
      }
    } catch (error: any) {
      console.error('Error:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      setShowPopup(false);
      alert(`Error on login: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirect = () => {
    if (isSignOut) {
      handleAuth();
    } else {
      setShowPopup(true);
    }
  };

  const baseButtonClass = `
    flex items-center justify-center
    gap-[10px]
    rounded-md
    bg-capx-secondary-purple 
    text-[#F6F6F6]
    text-center 
    font-[Montserrat]
    font-extrabold 
    not-italic 
    leading-[normal]
    text-[14px]
    md:text-[24px]
    transition-all
    ${
      isMobileMenu
        ? 'w-full'
        : `
      min-w-[120px]
      max-w-[200px]
      px-3 py-2.5
      md:w-auto
      md:min-w-[140px]
      md:max-w-[280px]
      md:px-6
      md:py-3
    `
    }
    ${customClass || ''}
  `.trim();

  return (
    <div className={`flex items-center ${isMobileMenu ? '' : 'h-full shrink-0'}`}>
      <BaseButton
        label={message}
        onClick={handleRedirect}
        disabled={isLoading}
        customClass={baseButtonClass}
        imageUrl={imageUrl}
        imageAlt={imageAlt}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
      />
      {showPopup && (
        <Popup
          onContinue={handleAuth}
          onClose={() => setShowPopup(false)}
          image={capxPersonIcon}
          title={pageContent['auth-dialog-content']}
          closeButtonLabel={pageContent['auth-dialog-button-close']}
          continueButtonLabel={pageContent['auth-dialog-button-continue']}
        />
      )}
    </div>
  );
}
