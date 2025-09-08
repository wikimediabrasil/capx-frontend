'use client';

import LoadingState from '@/components/LoadingState';
import ProfilePage from './components/ProfilePage';

import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function ProfileByUserName() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const token = session?.user?.token;
  const userId = session?.user?.id ? Number(session.user.id) : undefined;

  const { profile, isLoading, error } = useProfile(token, userId as number);
  const capacityCache = useCapacityCache();
  const { isLoadingTranslations } = capacityCache;
  const { language } = useApp();

  // Monitor language changes and update capacity cache
  useEffect(() => {
    const updateCacheLanguage = async () => {
      if (language && token) {
        try {
          await capacityCache?.updateLanguage?.(language);
        } catch (error) {
          console.error('Error updating capacity cache language:', error);
        }
      }
    };

    updateCacheLanguage();
  }, [language, token]);

  // Redirect if not authenticated
  if (sessionStatus === 'unauthenticated') {
    router.push('/');
    return null;
  }

  // Show loading while loading the profile, session or capacity translations
  if (isLoading || sessionStatus === 'loading' || !profile || isLoadingTranslations) {
    return <LoadingState fullScreen={true} />;
  }

  // Handle error state
  if (error) {
    console.error('Error loading profile:', error);
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-red-500">Error loading profile. Please try again.</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push('/')}
        >
          Go back
        </button>
      </div>
    );
  }

  return <ProfilePage isSameUser={true} profile={profile} />;
}
