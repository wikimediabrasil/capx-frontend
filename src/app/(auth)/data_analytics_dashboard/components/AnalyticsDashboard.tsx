'use client';

import Banner from '@/components/Banner';
import LoadingState from '@/components/LoadingState';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useStatistics } from '@/hooks/useStatistics';
import { useTerritories } from '@/hooks/useTerritories';
import CapxIcon from '@/public/static/images/capx_icon.svg';
import capxIconWhite from '@/public/static/images/capx_icon_white.svg';
import socialSkills from '@/public/static/images/cheer.svg';
import strategic from '@/public/static/images/chess_pawn.svg';
import communication from '@/public/static/images/communication.svg';
import communities from '@/public/static/images/communities.svg';
import corporateFareWhite from '@/public/static/images/corporate_fare_white.svg';
import DataAnalytics from '@/public/static/images/data_analytics_dashboard_banner.svg';
import ArrowDownIconWhite from '@/public/static/images/keyboard_arrow_down.svg';
import ArrowDownIcon from '@/public/static/images/keyboard_arrow_down_light_mode.svg';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import learner from '@/public/static/images/learner_icon_white.svg';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import technology from '@/public/static/images/wifi_tethering.svg';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import CapacityCardAnalytics from './CapacityCardAnalytics';

// Constants
const SKILL_METADATA = {
  10: {
    icon: corporateFareWhite,
    headerColor: '#0070B9',
    key: 'analytics-bashboard-capacities-card-organizational-structure',
  },
  36: {
    icon: communication,
    headerColor: '#AE0269',
    key: 'analytics-bashboard-capacities-card-communication',
  },
  50: {
    icon: learner,
    headerColor: '#02AE8C',
    key: 'analytics-bashboard-capacities-card-learning-and-evaluation',
  },
  56: {
    icon: communities,
    headerColor: '#811A96',
    key: 'analytics-bashboard-capacities-card-community-health-initiative',
  },
  65: {
    icon: socialSkills,
    headerColor: '#AE6F02',
    key: 'analytics-bashboard-capacities-card-social-skill',
  },
  74: {
    icon: strategic,
    headerColor: '#369BDB',
    key: 'analytics-bashboard-capacities-card-strategic-management',
  },
  106: {
    icon: technology,
    headerColor: '#0B8E46',
    key: 'analytics-bashboard-capacities-card-technology',
  },
};

// Helper functions
function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString();
}

function getTopItems<T extends Record<string, any>>(
  items: T,
  counts: Record<string, number> | undefined,
  limit?: number
) {
  const sorted = Object.entries(items)
    .map(([id, name]) => ({
      id: Number(id),
      name,
      count: counts?.[id] ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  return limit ? sorted.slice(0, limit) : sorted;
}

// Component: Stat Card
interface StatCardProps {
  readonly title: string;
  readonly value: number;
  readonly subtitle: string;
  readonly subtitleColor: string;
  readonly darkMode: boolean;
}

function StatCard({ title, value, subtitle, subtitleColor, darkMode }: Readonly<StatCardProps>) {
  const textColor = darkMode ? 'text-white' : 'text-capx-dark-box-bg';

  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left">
      <p
        className={`font-[Montserrat] text-[12px] md:text-[24px] font-normal leading-[2] md:leading-[29px] ${textColor}`}
      >
        {title}
      </p>
      <p className={`font-[Montserrat] text-[36px] md:text-[96px] font-bold ${textColor}`}>
        {value}
      </p>
      <p
        className={`font-[Montserrat] text-[12px] md:text-[24px] font-normal md:leading-[29px] ${subtitleColor}`}
      >
        {subtitle}
      </p>
    </div>
  );
}

// Component: Dropdown Section Header
interface DropdownHeaderProps {
  readonly icon: any;
  readonly iconWhite: any;
  readonly title: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly darkMode: boolean;
}

function DropdownHeader({
  icon,
  iconWhite,
  title,
  isOpen,
  onToggle,
  darkMode,
}: Readonly<DropdownHeaderProps>) {
  const arrowIcon = darkMode ? ArrowDownIconWhite : ArrowDownIcon;
  const sectionIcon = darkMode ? iconWhite : icon;

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center justify-between cursor-pointer"
      onClick={onToggle}
      onKeyPress={handleKeyPress}
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-2">
        <Image
          src={sectionIcon}
          alt="Section icon"
          width={20}
          height={20}
          className="block md:hidden"
        />
        <Image
          src={sectionIcon}
          alt="Section icon"
          width={48}
          height={48}
          className="hidden md:block"
        />
        <h2
          className={`font-[Montserrat] text-[18px] md:text-[24px] font-bold ${darkMode ? 'text-white' : 'text-[#053749]'}`}
        >
          {title}
        </h2>
      </div>
      <Image
        src={arrowIcon}
        alt="Arrow dropdown"
        width={48}
        height={48}
        className={`transition-transform duration-300 hidden md:block ${isOpen ? 'rotate-180' : ''}`}
      />
      <Image
        src={arrowIcon}
        alt="Arrow dropdown"
        width={20}
        height={20}
        className={`transition-transform duration-300 block md:hidden ${isOpen ? 'rotate-180' : ''}`}
      />
    </div>
  );
}

export default function AnalyticsDashboardPage() {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const { data } = useStatistics();
  const { territories } = useTerritories(token);
  const { languages } = useLanguage(token);

  const [openLanguages, setOpenLanguages] = useState(false);
  const [openTerritories, setOpenTerritories] = useState(false);
  const [openCapacities, setOpenCapacities] = useState(false);
  const [visibleLanguagesCount, setVisibleLanguagesCount] = useState(8);

  const sortedTerritories = getTopItems(territories, data?.territory_user_counts, 8);
  const sortedLanguages = getTopItems(languages, data?.language_user_counts);
  const visibleLanguages = sortedLanguages.slice(0, visibleLanguagesCount);

  const handleLoadMoreLanguages = () => {
    setVisibleLanguagesCount(prev => prev + 8);
  };

  const availableCount = data?.skill_available_user_counts;
  const wantedCount = data?.skill_wanted_user_counts;

  if (!data) return <LoadingState />;

  return (
    <section className="w-full flex flex-col min-h-screen gap-4 pt-24 md:pt-8 mx-auto md:max-w-[1200px]">
      <Banner
        image={DataAnalytics}
        title={pageContent['analytics-dashboard']}
        alt={pageContent['analytics-bashboard-alt-banner']}
        customClass={{
          background: 'bg-[#EFEFEF]',
          text: 'text-[#053749]',
        }}
      />

      <div className="flex flex-row justify-between md:justify-start gap-10 md:gap-60 py-8 px-4 w-full">
        <StatCard
          title={pageContent['analytics-bashboard-total-users']}
          value={data?.total_users ?? 0}
          subtitle={pageContent['analytics-bashboard-total-users-sub']}
          subtitleColor="text-[#0B8E46]"
          darkMode={darkMode}
        />
        <StatCard
          title={pageContent['analytics-bashboard-new-users']}
          value={data?.new_users ?? 0}
          subtitle={pageContent['analytics-bashboard-new-users-sub']}
          subtitleColor="text-[#D43831]"
          darkMode={darkMode}
        />
        <StatCard
          title={pageContent['analytics-bashboard-total-messages']}
          value={data?.total_messages ?? 0}
          subtitle={pageContent['analytics-bashboard-total-messages-sub']}
          subtitleColor="text-[#0070B9]"
          darkMode={darkMode}
        />
      </div>

      {/* Language Dropdown */}
      <div className="flex flex-col px-4 w-full gap-2 mt-[40px]">
        <DropdownHeader
          icon={LanguageIcon}
          iconWhite={LanguageIconWhite}
          title={pageContent['analytics-bashboard-languages-title']}
          isOpen={openLanguages}
          onToggle={() => setOpenLanguages(!openLanguages)}
          darkMode={darkMode}
        />

        {openLanguages && (
          <div
            className={`mt-8 gap-4 ${
              darkMode ? 'bg-[#053749] text-white' : 'bg-white text-[#053749]'
            } overflow-hidden`}
          >
            {visibleLanguages.map(language => (
              <div key={language.id} className="flex flex-row justify-between md:items-center">
                <div
                  className={`font-[Montserrat] text-[12px] md:text-[24px] font-bold ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {language.name}
                </div>
                <div
                  className={`font-[Montserrat] text-[12px] md:text-[24px] mb-4 md:mr-[80px] flex items-center gap-1 ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {formatNumber(language.count ?? 0)}{' '}
                  {pageContent['analytics-bashboard-territory-users']}
                </div>
              </div>
            ))}

            {visibleLanguagesCount < sortedLanguages.length && (
              <button
                onClick={handleLoadMoreLanguages}
                className={`w-full md:w-auto mx-auto flex items-center justify-center gap-2 px-4 md:py-2 border-2 border-[#053749] rounded-lg text-[#053749] text-[12px] md:text-[24px] font-bold hover:bg-[#EFEFEF] transition ${
                  darkMode
                    ? 'text-white border-white hover:bg-[#0A4C5A]'
                    : 'text-[#053749] border-[#053749]'
                }`}
              >
                {pageContent['analytics-bashboard-capacities-load-more']}
                <span className="text-xl">+</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Territories Dropdown */}
      <div className="flex flex-col px-4 w-full gap-2 mt-[40px]">
        <DropdownHeader
          icon={TerritoryIcon}
          iconWhite={TerritoryIconWhite}
          title={pageContent['analytics-bashboard-territory-title']}
          isOpen={openTerritories}
          onToggle={() => setOpenTerritories(!openTerritories)}
          darkMode={darkMode}
        />

        {openTerritories && (
          <div
            className={`mt-8 gap-4 ${
              darkMode ? 'bg-[#053749] text-white' : 'bg-white text-[#053749]'
            } overflow-hidden`}
          >
            {sortedTerritories.map(territory => (
              <div
                className="flex flex-col md:flex-row md:justify-between md:items-center"
                key={territory.id}
              >
                <div
                  className={`font-[Montserrat] text-[12px] md:text-[24px] font-bold ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {territory.name}
                </div>
                <div
                  className={`font-[Montserrat] text-[12px] md:text-[24px] mb-4 mr-[80px] md:mb-4 ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  } flex items-center gap-1`}
                >
                  {formatNumber(territory.count ?? 0)}{' '}
                  {pageContent['analytics-bashboard-territory-users']}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Capacties Dropdown */}
      <div className="flex flex-col px-4 w-full gap-2 mt-[40px]">
        <DropdownHeader
          icon={CapxIcon}
          iconWhite={capxIconWhite}
          title={pageContent['analytics-bashboard-capacities-title']}
          isOpen={openCapacities}
          onToggle={() => setOpenCapacities(!openCapacities)}
          darkMode={darkMode}
        />

        {openCapacities && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {availableCount &&
              Object.keys(availableCount).map(id => {
                const skillId = Number(id);
                const metadata = SKILL_METADATA[skillId];

                return (
                  <CapacityCardAnalytics
                    key={id}
                    open={openCapacities}
                    title={metadata ? pageContent[metadata.key] : ''}
                    icon={metadata?.icon}
                    headerColor={metadata?.headerColor || '#EFEFEF'}
                    darkMode={darkMode}
                    cards={[
                      {
                        titleCard: pageContent['analytics-bashboard-capacities-card-learners'],
                        value: wantedCount?.[id] || 0,
                      },
                      {
                        titleCard: pageContent['analytics-bashboard-capacities-card-sharers'],
                        value: availableCount?.[id] || 0,
                      },
                    ]}
                  />
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}
