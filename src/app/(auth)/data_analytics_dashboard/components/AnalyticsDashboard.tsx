'use client';

import Image from 'next/image';
import DataAnalytics from '@/public/static/images/data_analytics_dashboard_banner.svg';
import Banner from '@/components/Banner';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import ArrowDownIcon from '@/public/static/images/arrow_drop_down_circle.svg';
import ArrowDownIconWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';
import { useEffect, useState } from "react";

import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
// import { formData, setFormData } from '@/contexts/FormContext';
// import { addLanguageToFormData } from '@/utils/languages';

interface Stats {
  totalUsers: number;
  totalMessages: number;
}

interface LanguageStats {
  language: string;
  users: number;
}

export default function AnalyticsDashboardPage() {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [languages, setLanguages] = useState<LanguageStats[]>([]);

  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  // Buscar stats gerais
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Erro ao buscar stats:', error);
      }
    }

    fetchStats();
  }, []);

  // Buscar linguagens mais usadas
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await fetch("/api/stats/languages");
        const data: LanguageStats[] = await response.json();

        // Ordenar decrescente e limitar a 8
        const topLanguages = data
          .sort((a, b) => b.users - a.users)
          .slice(0, 8);

        setLanguages(topLanguages);
      } catch (error) {
        console.error('Erro ao buscar linguagens:', error);
      }
    }

    fetchLanguages();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toLocaleString();
  };

  return (
    <section className="w-full flex flex-col min-h-screen gap-4 pt-24 md:pt-8 mx-auto md:max-w-[1200px]">
      {/* Banner */}
      <Banner
        image={DataAnalytics}
        title={pageContent['analytics-dashboard']}
        alt={pageContent['analytics-bashboard-alt-banner']}
        customClass={{
          background: "bg-[#EFEFEF]",
          text: "text-[#053749]"
        }}
      />

      {/* Stats */}
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
            {stats ? formatNumber(stats.totalUsers) : "10.3k"}
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
            {stats ? formatNumber(stats.totalMessages) : "304"}
          </p>
          <p className="font-[Montserrat] text-[12px] md:text-[24px] not-italic font-normal leading-[2] md:leading-[29px] mb-2 text-[#66C3FF]">
            {pageContent['analytics-dashboard-total-users-text']}
          </p>
        </div>
      </div>

      {/* Languages Dropdown */}
      <div className="flex flex-col px-4 w-full gap-2">
        {/* Cabeçalho com ícones */}
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-2">
            {/* Mobile */}
            <Image
              src={darkMode ? LanguageIconWhite : LanguageIcon}
              alt="Language icon"
              width={20}
              height={20}
              className="block md:hidden"
            />

            {/* Desktop */}
            <Image
              src={darkMode ? LanguageIconWhite : LanguageIcon}
              alt="Language icon"
              width={48}
              height={48}
              className="hidden md:block"
            />

            <h2
              className={`font-[Montserrat] text-[18px] md:text-[24px] font-bold ${
                darkMode ? "text-white" : "text-[#053749]"
              }`}
            >
              {pageContent["body-profile-languages-title"]}
            </h2>
          </div>

          {/* Arrow */}
          {/* Desktop */}
          <Image
            src={ArrowDownIcon}
            alt="Arrow dropdown"
            width={48}
            height={48}
            className={`transition-transform duration-300 hidden md:block ${open ? "rotate-180" : ""}`}
          />

          {/* Mobile */}
          <Image
            src={ArrowDownIcon}
            alt="Arrow dropdown"
            width={20}
            height={20}
            className={`transition-transform duration-300 block md:hidden ${open ? "rotate-180" : ""}`}
          />
        </div>

        {/* Dropdown Options */}
        {open && (
          <div
            className={`mt-2 rounded-[16px] border ${
              darkMode
                ? "border-white bg-[#053749] text-white"
                : "border-[#053749] bg-white text-[#053749]"
            } overflow-hidden`}
          >
            {languages
              .sort((a, b) => b.users - a.users) // ordena da mais usada para a menos usada
              .slice(0, 8) // pega só as 8 primeiras
              .map((lang) => (
                <div
                  key={lang.language}
                  className="flex justify-between px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer text-sm md:text-base"
                  onClick={() => {
                    // setFormData(addLanguageToFormData(formData, lang.languageId, '3', lang.language));
                    setOpen(false);
                  }}
                >
                  <span>{lang.language}</span>
                  <span className="ml-4">{formatNumber(lang.users)}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
