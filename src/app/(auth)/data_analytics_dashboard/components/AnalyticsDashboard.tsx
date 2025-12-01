'use client';

import Image from 'next/image';
import DataAnalytics from '@/public/static/images/data_analytics_dashboard_banner.svg';
import Banner from '@/components/Banner';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import CapxIcon from '@/public/static/images/capx_icon.svg';
import capxIconWhite from '@/public/static/images/capx_icon_white.svg';
import corporateFareWhite from '@/public/static/images/corporate_fare_white.svg';
import communication from '@/public/static/images/communication.svg';
import learner from '@/public/static/images/learner_icon_white.svg';
import communities from '@/public/static/images/communities.svg';
import socialSkills from '@/public/static/images/cheer.svg';
import strategic from '@/public/static/images/chess_pawn.svg';
import technology from '@/public/static/images/wifi_tethering.svg';
import ArrowDownIcon from '@/public/static/images/keyboard_arrow_down_light_mode.svg';
import ArrowDownIconWhite from '@/public/static/images/keyboard_arrow_down.svg';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useTerritories } from '@/hooks/useTerritories';
import { useLanguage } from '@/hooks/useLanguage';
import { useStatistics } from '@/hooks/useStatistics';
import { useSession } from 'next-auth/react';
import CapacityCardAnalytics from './CapacityCardAnalytics';
import LoadingState from '@/components/LoadingState';

export default function AnalyticsDashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.token;
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const { data } = useStatistics();
  const { territories } = useTerritories(token);
  const { languages } = useLanguage(token);

  const [openLanguages, setOpenLanguages] = useState(false);
  const [openTerritories, setOpenTerritories] = useState(false);
  const [openCapacities, setOpenCapacities] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  const sortedTerritories = Object.entries(territories)
    .map(([id, name]) => ({
      id: Number(id),
      name,
      count: data?.territory_user_counts[id] ?? 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const sortedLanguages = Object.entries(languages)
    .map(([id, name]) => ({
      id: Number(id),
      name: name,
      count: data?.language_user_counts[id] ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  const [visibleLanguagesCount, setVisibleLanguagesCount] = useState(8);
  const visibleLanguages = sortedLanguages.slice(0, visibleLanguagesCount);
  const handleLoadMoreLanguages = () => {
    setVisibleLanguagesCount(prev => prev + 8);
  };

  const skillMeta = {
    10: {
      icon: corporateFareWhite,
      headerColor: '#0070B9',
      title: pageContent['analytics-bashboard-capacities-card-organizational-structure'],
    },
    36: {
      icon: communication,
      headerColor: '#AE0269',
      title: pageContent['analytics-bashboard-capacities-card-communication'],
    },
    50: {
      icon: learner,
      headerColor: '#02AE8C',
      title: pageContent['analytics-bashboard-capacities-card-learning-and-evaluation'],
    },
    56: {
      icon: communities,
      headerColor: '#811A96',
      title: pageContent['analytics-bashboard-capacities-card-community-health-initiative'],
    },
    65: {
      icon: socialSkills,
      headerColor: '#AE6F02',
      title: pageContent['analytics-bashboard-capacities-card-social-skill'],
    },
    74: {
      icon: strategic,
      headerColor: '#369BDB',
      title: pageContent['analytics-bashboard-capacities-card-strategic-management'],
    },
    106: {
      icon: technology,
      headerColor: '#0B8E46',
      title: pageContent['analytics-bashboard-capacities-card-technology'],
    },
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
        {/* Total Users */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <p
            className={`font-[Montserrat] text-[12px] md:text-[24px] font-normal leading-[2] md:leading-[29px] ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}
          >
            {pageContent['analytics-bashboard-total-users']}
          </p>
          <p
            className={`font-[Montserrat] text-[36px] md:text-[96px] font-bold ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}
          >
            {data?.total_users ?? 0}
          </p>
          <p
            className={`font-[Montserrat] text-[12px] md:text-[24px] font-normal md:leading-[29px] text-[#0B8E46]`}
          >
            {pageContent['analytics-bashboard-total-users-sub']}
          </p>
        </div>

        {/* Total New Users */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <p
            className={`font-[Montserrat] text-[12px] md:text-[24px] font-normal leading-[2] md:leading-[29px] ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}
          >
            {pageContent['analytics-bashboard-new-users']}
          </p>
          <p
            className={`font-[Montserrat] text-[36px] md:text-[96px] font-bold ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}
          >
            {formatNumber(data?.new_users ?? 0)}
          </p>
          <p
            className={`font-[Montserrat] text-[12px] md:text-[24px] font-normal md:leading-[29px] text-[#D43831]`}
          >
            {pageContent['analytics-bashboard-new-users-sub']}
          </p>
        </div>

        {/* Total Messages */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <p
            className={`font-[Montserrat] text-[12px] md:text-[24px] font-normal leading-[2] md:leading-[29px] ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}
          >
            {pageContent['analytics-bashboard-total-messages']}
          </p>
          <p
            className={`font-[Montserrat] text-[36px] md:text-[96px] font-bold ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}
          >
            {formatNumber(data?.total_messages ?? 0)}
          </p>
          <p
            className={`font-[Montserrat] text-[12px] md:text-[24px] font-normal md:leading-[29px] text-[#0070B9]`}
          >
            {pageContent['analytics-bashboard-total-messages-sub']}
          </p>
        </div>
      </div>

      {/* Language Dropdown */}
      <div className="flex flex-col px-4 w-full gap-2 mt-[40px]">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setOpenLanguages(!openLanguages)}
        >
          <div className="flex items-center gap-2">
            <Image
              src={darkMode ? LanguageIconWhite : LanguageIcon}
              alt="Territory icon"
              width={20}
              height={20}
              className="block md:hidden"
            />
            <Image
              src={darkMode ? LanguageIconWhite : LanguageIcon}
              alt="Territory icon"
              width={48}
              height={48}
              className="hidden md:block"
            />
            <h2
              className={`font-[Montserrat] text-[18px] md:text-[24px] font-bold ${
                darkMode ? 'text-white' : 'text-[#053749]'
              }`}
            >
              {pageContent['analytics-bashboard-languages-title']}
            </h2>
          </div>
          <Image
            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
            alt="Arrow dropdown"
            width={48}
            height={48}
            className={`transition-transform duration-300 hidden md:block ${
              openLanguages ? 'rotate-180' : ''
            }`}
          />
          <Image
            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
            alt="Arrow dropdown"
            width={20}
            height={20}
            className={`transition-transform duration-300 block md:hidden ${
              openLanguages ? 'rotate-180' : ''
            }`}
          />
        </div>

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
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setOpenTerritories(!openTerritories)}
        >
          <div className="flex items-center gap-2">
            <Image
              src={darkMode ? TerritoryIconWhite : TerritoryIcon}
              alt="Territory icon"
              width={20}
              height={20}
              className="block md:hidden"
            />
            <Image
              src={darkMode ? TerritoryIconWhite : TerritoryIcon}
              alt="Territory icon"
              width={48}
              height={48}
              className="hidden md:block"
            />
            <h2
              className={`font-[Montserrat] text-[18px] md:text-[24px] font-bold ${
                darkMode ? 'text-white' : 'text-[#053749]'
              }`}
            >
              {pageContent['analytics-bashboard-territory-title']}
            </h2>
          </div>
          <Image
            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
            alt="Arrow dropdown"
            width={48}
            height={48}
            className={`transition-transform duration-300 hidden md:block ${
              openTerritories ? 'rotate-180' : ''
            }`}
          />
          <Image
            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
            alt="Arrow dropdown"
            width={20}
            height={20}
            className={`transition-transform duration-300 block md:hidden ${
              openTerritories ? 'rotate-180' : ''
            }`}
          />
        </div>

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
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setOpenCapacities(!openCapacities)}
        >
          <div className="flex items-center gap-2">
            <Image
              src={darkMode ? capxIconWhite : CapxIcon}
              alt="Territory icon"
              width={20}
              height={20}
              className="block md:hidden"
            />
            <Image
              src={darkMode ? capxIconWhite : CapxIcon}
              alt="Territory icon"
              width={48}
              height={48}
              className="hidden md:block"
            />
            <h2
              className={`font-[Montserrat] text-[18px] md:text-[24px] font-bold ${
                darkMode ? 'text-white' : 'text-[#053749]'
              }`}
            >
              {pageContent['analytics-bashboard-capacities-title']}
            </h2>
          </div>
          <Image
            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
            alt="Arrow dropdown"
            width={48}
            height={48}
            className={`transition-transform duration-300 hidden md:block ${
              openCapacities ? 'rotate-180' : ''
            }`}
          />
          <Image
            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
            alt="Arrow dropdown"
            width={20}
            height={20}
            className={`transition-transform duration-300 block md:hidden ${
              openCapacities ? 'rotate-180' : ''
            }`}
          />
        </div>

        {openCapacities && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {availableCount &&
              Object.keys(availableCount).map(id => (
                <CapacityCardAnalytics
                  key={id}
                  open={openCapacities}
                  title={skillMeta[Number(id)]?.title}
                  icon={skillMeta[Number(id)]?.icon}
                  headerColor={skillMeta[Number(id)]?.headerColor || '#EFEFEF'}
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
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
