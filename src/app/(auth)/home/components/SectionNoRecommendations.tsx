'use client';

import CardNoRecommendations from '@/app/(auth)/home/components/CardNoRecommendations';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/stores';

export default function SectionNoRecommendations() {
  const isMobile = useIsMobile();
  const { darkMode } = useTheme();

  const noCapacitesSection = isMobile ? (
    //Mobile
    <section
      className={`flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-8 py-8 lg:px-12 ${
        darkMode ? 'bg-capx-dark-bg' : 'bg-[#F6F6F6]'
      }`}
    >
      <div className="flex flex-col items-center justify-center w-full gap-16">
        <div className="flex items-center w-full">
          <CardNoRecommendations alt="Imagem de produto de contatos" />
        </div>
      </div>
    </section>
  ) : (
    //Desktop
    <section
      className={`flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-8 md:mb-[128px] bg-transparent`}
    >
      <div className="flex flex-col items-center justify-between w-full py-16 gap-16">
        <div className="flex items-center w-full">
          <CardNoRecommendations alt="Imagem de produto de contatos" />
        </div>
      </div>
    </section>
  );
  return noCapacitesSection;
}
