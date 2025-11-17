import Link from 'next/link';
import Image from 'next/image';
import LogoMobile from '@/public/static/images/capx_detailed_logo.svg';
import LogoMobileWhite from '@/public/static/images/capx_detailed_logo_white.svg';
import LogoDesktop from '@/public/static/images/capx_minimalistic_logo.svg';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function Footer() {
  const { isMobile, pageContent } = useApp();
  const { darkMode } = useTheme();

  const footerLinks = [
    {
      title: pageContent['footer-link-documentation'],
      to: 'https://meta.m.wikimedia.org/wiki/Capacity_Exchange/FAQ',
    },
    {
      title: pageContent['footer-privacy-policy'],
      to: '/privacy_policy',
    },
    {
      title: pageContent['footer-link-github'],
      to: 'https://github.com/WikiMovimentoBrasil/capx-backend',
    },
    {
      title: pageContent['footer-link-wikimedia'],
      to: 'https://meta.wikimedia.org/wiki/Capacity_Exchange',
    },
    {
      title: pageContent['footer-translate-link'],
      to: 'https://translatewiki.net/wiki/Translating:CapacityExchange',
    },
  ];

  const linksComponent = footerLinks.map((link, index) => {
    return (
      <div
        key={'footer-link-' + index.toString()}
        className={`flex w-full sm:w-fit text-center flex px-[12px] py-[24px] no-underline justify-center items-center ${
          darkMode
            ? 'text-capx-dark-link border-capx-dark-link'
            : 'text-capx-light-link border-capx-light-link'
        }`}
      >
        <Link
          href={link.to}
          target="_blank"
          className={
            (darkMode
              ? 'text-capx-dark-link border-capx-dark-link no-underline'
              : 'text-capx-light-link border-capx-light-link no-underline') + 'w-fit'
          }
        >
          {link.title}
        </Link>
      </div>
    );
  });

  return (
    <footer className={`w-full ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'}`}>
      {isMobile ? (
        <div className="flex flex-col items-center justify-center max-w-screen-xl mx-auto mt-10">
          <div className="flex flex-row items-center justify-center">
            <Image
              src={darkMode ? LogoMobileWhite : LogoMobile}
              alt="Capx Logo"
              width={64}
              height={64}
              className="w-[64px] h-[64px]"
            />
          </div>
          <div className="flex flex-col items-center justify-center">{linksComponent}</div>
          <div className="flex w-[320px] justify-center items-center gap-[24px] mb-16">
            <p
              className={`text-center font-[Montserrat] text-[16px] not-italic font-bold leading-[normal] flex px-[12px] py-[24px] items-start ${
                darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
              }`}
            >
              {pageContent['footer-message']}
            </p>
          </div>
        </div>
      ) : (
        <section className="flex flex-row items-center justify-around sm:flex-nowrap w-full h-fit sm:h-16 px-6 pb-14 sm:pb-0 sm:py-0 font-medium text-sm my-16 max-w-screen-xl mx-auto">
          <div className="flex items-center justify-center">
            <Image src={LogoDesktop} alt="Capx Logo" className="w-16 h-16" priority />
          </div>
          <div className="flex flex-row items-center justify-center">{linksComponent}</div>
          <div className="flex justify-center items-center gap-[24px]">
            <p
              className={`text-center font-[Montserrat] text-[16px] not-italic font-bold leading-[normal] flex px-[12px] py-[24px] items-start ${
                darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
              }`}
            >
              {pageContent['footer-message']}
            </p>
          </div>
        </section>
      )}
    </footer>
  );
}
