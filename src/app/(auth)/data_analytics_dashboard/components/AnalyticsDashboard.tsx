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
import ArrowDownIcon from '@/public/static/images/keyboard_arrow_down_light_mode.svg';
import ArrowDownIconWhite from '@/public/static/images/keyboard_arrow_down.svg';
import { useState } from "react";
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useTerritories } from '@/hooks/useTerritories';
import { useStatistics } from '@/hooks/useStatistics';
import { useSession } from 'next-auth/react';

export default function AnalyticsDashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.token;  
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const { data } = useStatistics();
  
  const { territories } = useTerritories(token);

  const [openLanguages, setOpenLanguages] = useState(false);
  const [openTerritories, setOpenTerritories] = useState(false);
  const [openCapacities, setOpenCapacities] = useState(false);


  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toLocaleString();
  };

    const allTerritories = Object.entries(territories).map(([id, name]) => ({
      id: Number(id),
      name: name,
    }));
    console.log(allTerritories)

   return (
    <section className="w-full flex flex-col min-h-screen gap-4 pt-24 md:pt-8 mx-auto md:max-w-[1200px]">
      <Banner
        image={DataAnalytics}
        title={pageContent["analytics-dashboard"]}
        alt={pageContent["analytics-bashboard-alt-banner"]}
        customClass={{
          background: "bg-[#EFEFEF]",
          text: "text-[#053749]",
        }}
      />

      <div className="flex flex-row justify-center md:justify-start gap-4 md:gap-60 py-8 px-4 w-full">
        {/* Total Users */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <p className={`font-[Montserrat] text-[12px] md:text-[24px] font-normal leading-[2] md:leading-[29px] ${
            darkMode ? 'text-white' : 'text-capx-dark-box-bg'
          }`}>
            {pageContent['analytics-bashboard-total-users']}
          </p>
          <p className={`font-[Montserrat] text-[36px] md:text-[96px] font-bold ${
            darkMode ? 'text-white' : 'text-capx-dark-box-bg'
          }`}>
            {formatNumber(data?.active_users?? 0)}
          </p>
          <p className="font-[Montserrat] text-[12px] md:text-[24px] not-italic font-normal leading-[2] md:leading-[29px] mb-2 text-[#0B8E46]">
            {pageContent['analytics-dashboard-total-users-text']}
          </p>
        </div>

        {/* Total Messages */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <p className={`font-[Montserrat] text-[12px] md:text-[24px] font-normal leading-[2] md:leading-[29px] ${
            darkMode ? 'text-white' : 'text-capx-dark-box-bg'
          }`}>
            {pageContent['analytics-bashboard-total-messages']}
          </p>
          <p className={`font-[Montserrat] text-[36px] md:text-[96px] font-bold ${
            darkMode ? 'text-white' : 'text-capx-dark-box-bg'
          }`}>
            {formatNumber(data?.total_messages?? 0)}
          </p>
          <p className="font-[Montserrat] text-[12px] md:text-[24px] not-italic font-normal leading-[2] md:leading-[29px] mb-2 text-[#66C3FF]">
            {pageContent['analytics-dashboard-total-users-text']}
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
                darkMode ? "text-white" : "text-[#053749]"
              }`}
            >
              {pageContent["analytics-bashboard-languages-title"]}
            </h2>
          </div>
          <Image
            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
            alt="Arrow dropdown"
            width={48}
            height={48}
            className={`transition-transform duration-300 hidden md:block ${
              openLanguages ? "rotate-180" : ""
            }`}
          />
          <Image
            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
            alt="Arrow dropdown"
            width={20}
            height={20}
            className={`transition-transform duration-300 block md:hidden ${
              openLanguages ? "rotate-180" : ""
            }`}
          />
        </div>

        {openLanguages && (
          <div
            className={`mt-2 gap-4 ${
              darkMode
                ? "bg-[#053749] text-white"
                : "bg-white text-[#053749]"
            } overflow-hidden`}
          >
            {allTerritories.map((territory) => (
              <div
                key={territory.id}
              >
                {territory.name}
              </div>
            ))}
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
                darkMode ? "text-white" : "text-[#053749]"
              }`}
            >
              {pageContent["analytics-bashboard-territory-title"]}
            </h2>
          </div>
          <Image
            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
            alt="Arrow dropdown"
            width={48}
            height={48}
            className={`transition-transform duration-300 hidden md:block ${
              openTerritories ? "rotate-180" : ""
            }`}
          />
          <Image
            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
            alt="Arrow dropdown"
            width={20}
            height={20}
            className={`transition-transform duration-300 block md:hidden ${
              openTerritories ? "rotate-180" : ""
            }`}
          />
        </div>

        {openTerritories && (
          <div
            className={`mt-2 gap-4 ${
              darkMode
                ? "bg-[#053749] text-white"
                : "bg-white text-[#053749]"
            } overflow-hidden`}
          >
            {allTerritories.map((territory) => (
              <div
                key={territory.id}
              >
                {territory.name}
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
                darkMode ? "text-white" : "text-[#053749]"
              }`}
            >
              {pageContent["analytics-bashboard-capacities-title"]}
            </h2>
          </div>
          <Image
            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
            alt="Arrow dropdown"
            width={48}
            height={48}
            className={`transition-transform duration-300 hidden md:block ${
              openCapacities ? "rotate-180" : ""
            }`}
          />
          <Image
            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
            alt="Arrow dropdown"
            width={20}
            height={20}
            className={`transition-transform duration-300 block md:hidden ${
              openCapacities ? "rotate-180" : ""
            }`}
          />
        </div>

        {openCapacities && (
          <div
            className={`mt-2 gap-4 ${
              darkMode
                ? "bg-[#053749] text-white"
                : "bg-white text-[#053749]"
            } overflow-hidden`}
          >
            {allTerritories.map((territory) => (
              <div
                key={territory.id}
              >
                {territory.name}
              </div>
            ))}
          </div>
        )}
      </div>      
    </section>
  );
}
