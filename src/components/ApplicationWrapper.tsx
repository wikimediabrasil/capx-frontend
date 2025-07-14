'use client';
import BaseWrapper from './BaseWrapper';
import MainSection from './MainSection';
import FeaturesSection from '@/components/FeaturesSection';
import CallToActionSection from '@/components/CallToActionSection';
import VideoSection from '@/components/VideoSection';
import SafeHydration from './SafeHydration';
import LoadingStateWithFallback from './LoadingStateWithFallback';
import StatisticsSection from '@/components/StatisticsSection';

/**
 * Wrapper for the application that ensures components are only rendered after the providers are available.
 */
export default function ApplicationWrapper() {
  return (
    <SafeHydration
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingStateWithFallback />
        </div>
      }
    >
      <>
        <MainSection />
        <FeaturesSection />
        <VideoSection />
        <StatisticsSection />
        <CallToActionSection />
      </>
    </SafeHydration>
  );
}
