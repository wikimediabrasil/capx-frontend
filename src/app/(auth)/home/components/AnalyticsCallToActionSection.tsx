'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';
import BaseButton from '@/components/BaseButton';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useStatistics } from '@/hooks/useStatistics';
import { useTerritories } from '@/hooks/useTerritories';

interface StatisticItem {
  text: string;
  value: number;
  key: string;
  territoryName?: string;
}

export default function AnalyticsCallToActionSection() {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const router = useRouter();
  const { pageContent, isMobile } = useApp();
  const { darkMode } = useTheme();
  const { data, isLoading } = useStatistics();
  const { territories, loading: territoriesLoading } = useTerritories(token);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate statistics
  const languagesWithUsers = Object.entries(data?.language_user_counts || {}).filter(
    ([_, count]) => count > 0
  ).length;

  // Get territories with users and their names
  const territoriesWithUsersData = useMemo(() => {
    if (!data?.territory_user_counts || !territories) return [];

    return Object.entries(data.territory_user_counts)
      .filter(([_, count]) => count > 0)
      .map(([territoryId, count]) => ({
        id: territoryId,
        name: territories[territoryId] || `Territory ${territoryId}`,
        count: count,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [data?.territory_user_counts, territories]);

  // Build statistics array
  const statistics: StatisticItem[] = useMemo(() => {
    const stats: StatisticItem[] = [
      {
        text: pageContent['home-analytics-cta-text'] || '{count}+ languages are spoken on CapX.',
        value: languagesWithUsers,
        key: 'languages',
      },
      // Add one territory statistic entry (will be replaced with individual territories)
      {
        text:
          pageContent['home-analytics-cta-territories'] ||
          '{territoryname} is represented by {count} users on CapX.',
        value: 0,
        key: 'territories',
      },
      {
        text:
          pageContent['home-analytics-cta-total-users'] ||
          "CapX's network has {count} users today.",
        value: data?.total_users || 0,
        key: 'users',
      },
      {
        text:
          pageContent['home-analytics-cta-total-organizations'] ||
          '{count} organizations are active on CapX today.',
        value: data?.total_organizations || 0,
        key: 'organizations',
      },
      {
        text:
          pageContent['home-analytics-cta-total-capacities'] ||
          'There are {count} capacities for you to choose from on CapX.',
        value: data?.total_capacities || 0,
        key: 'capacities',
      },
      {
        text:
          pageContent['home-analytics-cta-total-messages'] ||
          'The CapX community has exchanged {count} messages.',
        value: data?.total_messages || 0,
        key: 'messages',
      },
    ];

    // Replace the single territory entry with individual territory entries
    const territoryStats: StatisticItem[] = territoriesWithUsersData.map(territory => ({
      text:
        pageContent['home-analytics-cta-territories'] ||
        '{territoryname} is represented by {count} users on CapX.',
      value: territory.count,
      key: `territory-${territory.id}`,
      territoryName: territory.name,
    }));

    // Insert territory stats after languages, before other stats
    const finalStats = [
      stats[0], // languages
      ...territoryStats, // individual territories
      ...stats.slice(2), // rest of stats (skip the placeholder territory entry)
    ];

    return finalStats.filter(stat => stat.value > 0); // Only show statistics with value > 0
  }, [
    languagesWithUsers,
    territoriesWithUsersData,
    data?.total_users,
    data?.total_organizations,
    data?.total_capacities,
    data?.total_messages,
    pageContent,
  ]);

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

  const buttonLabel = pageContent['home-analytics-cta-button'] || 'View Statistics';

  const handleViewStatistics = () => {
    router.push('/data_analytics_dashboard');
  };

  // Show loading state
  if (isLoading || territoriesLoading) {
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
              <div
                className={
                  (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
                  ' text-center font-[Montserrat] text-[16px] md:text-[20px] not-italic font-normal leading-[normal]'
                }
              >
                <div
                  className={
                    'animate-spin ease-linear h-6 w-6 rounded-full border-4 mx-auto ' +
                    (darkMode
                      ? 'border-l-transparent border-r-transparent border-b-transparent border-t-[#FFF]'
                      : 'border-l-transparent border-r-transparent border-b-transparent border-t-[#053749]')
                  }
                  role="status"
                  aria-label="Loading statistics"
                />
              </div>
            </div>
            <div className="w-fit rounded-[6px] bg-[#851970] inline-flex px-[16px] py-[8px] opacity-50">
              <span className="text-white font-bold text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]">
                {buttonLabel}
              </span>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-8 py-16">
        <div className="flex flex-col items-center justify-center w-full gap-6">
          <div className="relative min-h-[80px] flex items-center justify-center">
            <div
              className={
                (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
                ' text-center font-[Montserrat] text-[30px] not-italic font-normal leading-[normal]'
              }
            >
              <div
                className={
                  'animate-spin ease-linear h-8 w-8 rounded-full border-4 mx-auto ' +
                  (darkMode
                    ? 'border-l-transparent border-r-transparent border-b-transparent border-t-[#FFF]'
                    : 'border-l-transparent border-r-transparent border-b-transparent border-t-[#053749]')
                }
                role="status"
                aria-label="Loading statistics"
              />
            </div>
          </div>
          <div className="rounded-[6px] bg-[#851970] inline-flex px-[32px] py-[16px] h-[64px] opacity-50">
            <span className="text-white font-bold text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]">
              {buttonLabel}
            </span>
          </div>
        </div>
      </section>
    );
  }

  // Don't show section if no statistics
  if (statistics.length === 0) {
    return null;
  }

  const currentStat = statistics[currentIndex];
  const formattedText = currentStat
    ? currentStat.text
        .replace('{count}', currentStat.value.toString())
        .replace('{territoryname}', currentStat.territoryName || '')
    : '';

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
