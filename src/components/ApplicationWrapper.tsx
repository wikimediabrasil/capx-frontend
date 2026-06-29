'use client';

import MainSection from './MainSection';
import FeaturesSection from '@/components/FeaturesSection';
import CallToActionSection from '@/components/CallToActionSection';
import VideoSection from '@/components/VideoSection';
import SafeHydration from './SafeHydration';

/**
 * Wrapper for the application that ensures components are only rendered after the providers are available.
 */
export default function ApplicationWrapper() {
  return (
    <SafeHydration>
      <>
        <MainSection />
        <FeaturesSection />
        <VideoSection />
        <CallToActionSection />
      </>
    </SafeHydration>
  );
}
