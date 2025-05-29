"use client";

import MainSection from "./MainSection";
import SafeHydration from "./SafeHydration";
import LoadingStateWithFallback from "./LoadingStateWithFallback";
/**
 * Wrapper specific for the MainSection that ensures
 * it is only rendered when all necessary contexts
 * are available.
 */
export default function MainSectionWrapper() {
  return (
    <SafeHydration
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <LoadingStateWithFallback />
        </div>
      }
    >
      <MainSection />
    </SafeHydration>
  );
}
