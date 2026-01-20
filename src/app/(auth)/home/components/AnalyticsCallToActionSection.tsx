'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import BaseButton from '@/components/BaseButton';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useStatistics } from '@/hooks/useStatistics';

interface StatisticItem {
  text: string;
  value: number;
  key: string;
}

export default function AnalyticsCallToActionSection() {
  const { data: session } = useSession();
  const router = useRouter();
  const { pageContent, isMobile } = useApp();
  const { darkMode } = useTheme();
  const { data, isLoading } = useStatistics();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate statistics
  const languagesWithUsers = Object.entries(data?.language_user_counts || {}).filter(
    ([_, count]) => count > 0
  ).length;

  const territoriesWithUsers = Object.entries(data?.territory_user_counts || {}).filter(
    ([_, count]) => count > 0
  ).length;

  // Build statistics array
  const statistics: StatisticItem[] = [
    {
      text: pageContent['home-analytics-cta-text'] || 'There are {count} languages available on capx today',
      value: languagesWithUsers,
      key: 'languages',
    },
    {
      text: pageContent['home-analytics-cta-territories'] || 'People from {count} territories on capx',
      value: territoriesWithUsers,
      key: 'territories',
    },
    {
      text: pageContent['home-analytics-cta-total-users'] || '{count} users on capx',
      value: data?.total_users || 0,
      key: 'users',
    },
    {
      text: pageContent['home-analytics-cta-total-organizations'] || '{count} organizations on capx',
      value: data?.total_organizations || 0,
      key: 'organizations',
    },
    {
      text: pageContent['home-analytics-cta-total-capacities'] || '{count} capacities available on capx',
      value: data?.total_capacities || 0,
      key: 'capacities',
    },
    {
      text: pageContent['home-analytics-cta-total-messages'] || '{count} messages exchanged on capx',
      value: data?.total_messages || 0,
      key: 'messages',
    },
  ].filter(stat => stat.value > 0); // Only show statistics with value > 0

  // Reset index when statistics change
  useEffect(() => {
    setCurrentIndex(0);
    setIsVisible(true);
  }, [statistics.length]);

  // Rotation logic
  useEffect(() => {
    if (statistics.length <= 1) return; // No need to rotate if only one or no statistics

    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      
      // After fade out completes, change index and fade in
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % statistics.length);
        setIsVisible(true);
      }, 500); // Match transition duration
    }, 5000);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [statistics.length]);

  const currentStat = statistics[currentIndex];
  const formattedText = currentStat
    ? currentStat.text.replace('{count}', currentStat.value.toString())
    : '';
  const buttonLabel = pageContent['home-analytics-cta-button'] || 'View Statistics';

  const handleViewStatistics = () => {
    router.push('/data_analytics_dashboard');
  };

  // Don't show section while loading or if no statistics
  if (isLoading || statistics.length === 0) {
    return null;
  }

  if (isMobile) {
    return (
      <section
        className={
          (darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg') +
          ' flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-16'
        }
      >
        <div className="flex flex-col items-center justify-center w-full gap-4">
          <div className="relative min-h-[60px] flex items-center justify-center">
            <p
              className={
                (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
                ' text-center font-[Montserrat] text-[16px] md:text-[20px] not-italic font-normal leading-[normal] transition-opacity duration-500 ' +
                (isVisible ? 'opacity-100' : 'opacity-0')
              }
            >
              {formattedText}
            </p>
          </div>
          <BaseButton
            onClick={handleViewStatistics}
            label={buttonLabel}
            customClass="w-fit rounded-[6px] bg-[#851970] inline-flex px-[16px] py-[8px] text-white font-bold justify-center items-center gap-[8px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-8 py-16">
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <div className="relative min-h-[80px] flex items-center justify-center">
          <p
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' text-center font-[Montserrat] text-[30px] not-italic font-normal leading-[normal] transition-opacity duration-500 ' +
              (isVisible ? 'opacity-100' : 'opacity-0')
            }
          >
            {formattedText}
          </p>
        </div>
        <BaseButton
          onClick={handleViewStatistics}
          label={buttonLabel}
          customClass="rounded-[6px] bg-[#851970] inline-flex px-[32px] py-[16px] text-white font-bold h-[64px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]"
        />
      </div>
    </section>
  );
}


