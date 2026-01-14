'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/stores';
import { ReactNode } from 'react';

interface RecommendationsSectionProps {
  readonly children: ReactNode;
}

export default function RecommendationsSection({ children }: RecommendationsSectionProps) {
  const isMobile = useIsMobile();
  const { darkMode } = useTheme();

  if (isMobile) {
    return (
      <section
        className={`flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-8 py-8 lg:px-12 ${
          darkMode ? 'bg-capx-dark-bg' : 'bg-[#F6F6F6]'
        }`}
      >
        {children}
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-8 md:mb-[128px] bg-transparent">
      <div className="flex flex-col items-center justify-between w-full py-16 gap-16">
        {children}
      </div>
    </section>
  );
}
