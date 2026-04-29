'use client';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import BaseButton from '@/components/BaseButton';
import { useProfile } from '@/hooks/useProfile';
import MainSectionIllustration from '@/public/static/images/capx_loggedin_home_illustration.svg';
import MainSectionIllustrationDark from '@/public/static/images/capx_loggedin_home_illustration_dark.svg';
import QrCodeIcon from '@/public/static/images/icons/qr_code.svg';
import QrCodeIconWhite from '@/public/static/images/icons/qr_code_white.svg';
import CreditCardIcon from '@/public/static/images/credit_card.svg';
import CreditCardIconDark from '@/public/static/images/credit_card_dark.svg';
import AccountTreeIcon from '@/public/static/images/account_tree.svg';
import AccountTreeIconWhite from '@/public/static/images/account_tree_white.svg';
import CollapseAllIcon from '@/public/static/images/collapse_all.svg';
import CollapseAllIconWhite from '@/public/static/images/collapse_all_white.svg';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import { useDarkMode, useIsMobile } from '@/stores';
import { LanguageProficiency } from '@/types/language';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import SectionRecommendationsCarousel from './SectionRecommendationsCarousel';

interface AuthenticatedMainSectionProps {
  pageContent: any;
  slideInterval?: number;
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function AuthenticatedMainSection({
  pageContent,
  slideInterval = 5000,
}: AuthenticatedMainSectionProps) {
  const isMobile = useIsMobile();
  const darkMode = useDarkMode();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { data: session } = useSession();
  const token = session?.user?.token;
  const userId = session?.user?.id ? Number(session.user.id) : undefined;

  const { profile } = useProfile(token, userId as number);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const _fd = {
    skills_known: [] as number[],
    skills_available: [] as number[],
    skills_wanted: [] as number[],
    language: [] as LanguageProficiency[],
    ...(profile ?? {}),
  };

  const welcomeSlide = isMobile ? (
    <section
      className={
        (darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg') +
        ' flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 mt-8'
      }
    >
      <div className="flex flex-col md:flex-row items-center justify-between w-full pb-4 pt-8 md:pb-8 pt-16 gap-8">
        <div className="flex flex-col items-center md:items-start w-full md:w-1/2 pb-4 md:pb-0">
          <h1
            className={
              (darkMode ? 'text-capx-dark-text' : 'text-capx-light-text') +
              ' text-center text-[24px] not-italic font-extrabold leading-[29px]'
            }
          >
            {pageContent['body-loggedin-home-main-section-title']}
          </h1>
          <h2
            className={
              (darkMode ? 'text-capx-dark-text' : 'text-capx-light-text') +
              ' text-[16px] not-italic font-normal leading-[20px]'
            }
          >
            {pageContent['body-loggedin-home-main-section-description']}
          </h2>
        </div>
        <div className="w-full md:w-1/2">
          <Image
            priority={true}
            src={darkMode ? MainSectionIllustrationDark : MainSectionIllustration}
            alt="Main illustration"
            className="w-full h-auto"
          />
        </div>
        <div className="flex flex-row gap-4 w-full justify-center items-center">
          <div className="flex items-center h-full">
            <BaseButton
              onClick={() => router.push('/feed')}
              label={pageContent['body-loggedin-home-main-section-button01']}
              customClass="rounded-[6px] bg-[#851970] inline-flex px-[19px] py-[8px] justify-center items-center gap-[10px] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
            />
          </div>
          <BaseButton
            label={pageContent['body-loggedin-home-main-section-button02']}
            onClick={() => router.push('/profile')}
            customClass="w-fit sm:w-fit rounded-[6px] border-[1px] border-[solid] border-[var(--Backgrounds-dark-box-bg,#053749)] bg-[#FFF] inline-flex px-[16px] py-[8px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
          />
        </div>
      </div>
    </section>
  ) : (
    <section className="flex flex-col items-center justify-start w-full mx-auto">
      <div className="flex flex-row items-center justify-between w-full pb-4 pt-8 md:pb-2 pt-4 gap-8 max-w-screen-xl mx-auto px-8">
        <div className="flex flex-col items-center md:items-start w-full md:w-1/2 lg:w-2/3">
          <h1
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[72px] not-italic font-extrabold leading-[88px]'
            }
          >
            {pageContent['body-loggedin-home-main-section-title']}
          </h1>
          <h2
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[48px] not-italic font-extrabold leading-[59px]'
            }
          >
            {pageContent['body-loggedin-home-main-section-description']}
          </h2>
          <p
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[30px] not-italic font-normal leading-[normal] my-[24px]'
            }
          >
            {pageContent['body-home-section01-description']}
          </p>
          <p
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[20px] not-italic font-normal leading-[normal]'
            }
          >
            {pageContent['body-home-section01-description-unified-login-info']}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full items-start mt-[24px]">
            <div className="flex items-center h-full">
              <BaseButton
                onClick={() => router.push('/feed')}
                label={pageContent['body-loggedin-home-main-section-button01']}
              />
            </div>
            <BaseButton
              label={pageContent['body-loggedin-home-main-section-button02']}
              customClass="rounded-[6px] border-[1px] border-[solid] border-[var(--Backgrounds-dark-box-bg,#053749)] bg-[#FFF] inline-flex px-[32px] py-[16px] h-[64px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]"
              onClick={() => router.push('/profile')}
            />
          </div>
        </div>
        <div className="w-1/2 lg:w-1/3">
          <Image
            priority={true}
            src={darkMode ? MainSectionIllustrationDark : MainSectionIllustration}
            alt={pageContent['alt-illustration'] || 'Main illustration showing people collaborating'}
            height={520}
            width={520}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );

  const qrCodeSlide = isMobile ? (
    <section
      className={
        (darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg') +
        ' flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-8'
      }
    >
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <Image
          src={darkMode ? QrCodeIconWhite : QrCodeIcon}
          alt="QR Code"
          width={80}
          height={80}
          className="w-20 h-20"
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <h2
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[20px] not-italic font-extrabold leading-[normal]'
            }
          >
            {pageContent['home-qr-cta-title'] || 'Share your CapX profile'}
          </h2>
          <p
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[14px] not-italic font-normal leading-[normal]'
            }
          >
            {pageContent['home-qr-cta-description'] ||
              'Generate a QR code from your profile and share it anywhere.'}
          </p>
        </div>
        <BaseButton
          onClick={() => router.push('/profile')}
          label={pageContent['home-qr-cta-button'] || 'Go to my profile'}
          customClass="w-fit rounded-[6px] bg-[#851970] inline-flex px-[16px] py-[8px] justify-center items-center gap-[8px] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
        />
      </div>
    </section>
  ) : (
    <section className="flex flex-col items-center justify-center w-full mx-auto">
      <div className="flex flex-row items-center justify-between w-full py-[128px] gap-16 max-w-screen-xl mx-auto px-8">
        <div className="flex flex-col items-start w-full lg:w-2/3 gap-6">
          <h2
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[48px] not-italic font-extrabold leading-[59px]'
            }
          >
            {pageContent['home-qr-cta-title'] || 'Share your CapX profile'}
          </h2>
          <p
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[24px] not-italic font-normal leading-[normal]'
            }
          >
            {pageContent['home-qr-cta-description'] ||
              'Generate a QR code from your profile and share it anywhere — events, wikis, business cards.'}
          </p>
          <BaseButton
            onClick={() => router.push('/profile')}
            label={pageContent['home-qr-cta-button'] || 'Go to my profile'}
            customClass="rounded-[6px] bg-[#851970] inline-flex px-[32px] py-[16px] h-[64px] justify-center items-center gap-[8px] text-[#F6F6F6] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]"
          />
        </div>
        <div className="flex items-center justify-center w-1/3">
          <Image
            src={darkMode ? QrCodeIconWhite : QrCodeIcon}
            alt="QR Code"
            width={220}
            height={220}
            className="w-full max-w-[220px] h-auto"
          />
        </div>
      </div>
    </section>
  );

  const capacityVisualizationModes = [
    {
      icon: darkMode ? CreditCardIconDark : CreditCardIcon,
      label: pageContent['capacity-list-visualization-description-browse-cards'] || 'Browse Cards',
    },
    {
      icon: darkMode ? AccountTreeIconWhite : AccountTreeIcon,
      label:
        pageContent['capacity-list-visualization-description-view-tree-structure'] ||
        'View Tree Structure',
    },
    {
      icon: darkMode ? CollapseAllIconWhite : CollapseAllIcon,
      label:
        pageContent['capacity-list-visualization-description-navigate-by-categories'] ||
        'Navigate by Categories',
    },
  ];

  const capacitySlide = isMobile ? (
    <section
      className={
        (darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg') +
        ' flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-8'
      }
    >
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[20px] not-italic font-extrabold leading-[normal]'
            }
          >
            {pageContent['home-capacity-cta-title'] || 'Three new ways to explore capacities'}
          </h2>
          <p
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[14px] not-italic font-normal leading-[normal]'
            }
          >
            {pageContent['home-capacity-cta-description'] ||
              'Find the view that works best for you.'}
          </p>
        </div>
        <div className="flex flex-row items-start justify-center gap-4 w-full">
          {capacityVisualizationModes.map((mode, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div
                className={
                  (darkMode ? 'bg-[#053749]' : 'bg-white') +
                  ' rounded-[12px] p-3 flex items-center justify-center shadow-sm'
                }
              >
                <Image src={mode.icon} alt={mode.label} width={28} height={28} className="w-7 h-7" />
              </div>
              <span
                className={
                  (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
                  ' font-[Montserrat] text-[11px] font-semibold text-center leading-tight'
                }
              >
                {mode.label}
              </span>
            </div>
          ))}
        </div>
        <BaseButton
          onClick={() => router.push('/capacity')}
          label={pageContent['home-capacity-cta-button'] || 'Explore capacities'}
          customClass="w-fit rounded-[6px] bg-[#851970] inline-flex px-[16px] py-[8px] justify-center items-center gap-[8px] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
        />
      </div>
    </section>
  ) : (
    <section className="flex flex-col items-center justify-center w-full mx-auto">
      <div className="flex flex-row items-center justify-between w-full py-[128px] gap-16 max-w-screen-xl mx-auto px-8">
        <div className="flex flex-col items-start w-full lg:w-2/3 gap-8">
          <h2
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[48px] not-italic font-extrabold leading-[59px]'
            }
          >
            {pageContent['home-capacity-cta-title'] || 'Three new ways to explore capacities'}
          </h2>
          <p
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[24px] not-italic font-normal leading-[normal]'
            }
          >
            {pageContent['home-capacity-cta-description'] ||
              'Browse cards, navigate a tree structure, or explore by categories. Find the view that works best for you.'}
          </p>
          <BaseButton
            onClick={() => router.push('/capacity')}
            label={pageContent['home-capacity-cta-button'] || 'Explore capacities'}
            customClass="rounded-[6px] bg-[#851970] inline-flex px-[32px] py-[16px] h-[64px] justify-center items-center gap-[8px] text-[#F6F6F6] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]"
          />
        </div>
        <div className="flex flex-row items-center justify-center gap-6 w-1/3">
          {capacityVisualizationModes.map((mode, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div
                className={
                  (darkMode ? 'bg-[#053749]' : 'bg-white') +
                  ' rounded-[16px] p-5 flex items-center justify-center shadow-md'
                }
              >
                <Image src={mode.icon} alt={mode.label} width={40} height={40} className="w-10 h-10" />
              </div>
              <span
                className={
                  (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
                  ' font-[Montserrat] text-[13px] font-semibold text-center leading-tight max-w-[80px]'
                }
              >
                {mode.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const translateSlide = isMobile ? (
    <section
      className={
        (darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg') +
        ' flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-8'
      }
    >
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <Image
          src={darkMode ? LanguageIconWhite : LanguageIcon}
          alt="Translate"
          width={80}
          height={80}
          className="w-20 h-20"
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <h2
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[20px] not-italic font-extrabold leading-[normal]'
            }
          >
            {pageContent['home-translate-cta-title'] || 'Translate capacities and add new ones'}
          </h2>
          <p
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[14px] not-italic font-normal leading-[normal]'
            }
          >
            {pageContent['home-translate-cta-description'] ||
              'Help translate capacity names and descriptions into your language, and contribute new capacities to grow the CapX knowledge base.'}
          </p>
        </div>
        <BaseButton
          onClick={() => router.push('/translate')}
          label={pageContent['home-translate-cta-button'] || 'Translate & contribute'}
          customClass="w-fit rounded-[6px] bg-[#851970] inline-flex px-[16px] py-[8px] justify-center items-center gap-[8px] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
        />
      </div>
    </section>
  ) : (
    <section className="flex flex-col items-center justify-center w-full mx-auto">
      <div className="flex flex-row items-center justify-between w-full py-[128px] gap-16 max-w-screen-xl mx-auto px-8">
        <div className="flex flex-col items-start w-full lg:w-2/3 gap-6">
          <h2
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[48px] not-italic font-extrabold leading-[59px]'
            }
          >
            {pageContent['home-translate-cta-title'] || 'Translate capacities and add new ones'}
          </h2>
          <p
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' font-[Montserrat] text-[24px] not-italic font-normal leading-[normal]'
            }
          >
            {pageContent['home-translate-cta-description'] ||
              'Help translate capacity names and descriptions into your language, and contribute new capacities to grow the CapX knowledge base.'}
          </p>
          <BaseButton
            onClick={() => router.push('/translate')}
            label={pageContent['home-translate-cta-button'] || 'Translate & contribute'}
            customClass="rounded-[6px] bg-[#851970] inline-flex px-[32px] py-[16px] h-[64px] justify-center items-center gap-[8px] text-[#F6F6F6] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]"
          />
        </div>
        <div className="flex items-center justify-center w-1/3">
          <Image
            src={darkMode ? LanguageIconWhite : LanguageIcon}
            alt="Translate"
            width={220}
            height={220}
            className="w-full max-w-[220px] h-auto"
          />
        </div>
      </div>
    </section>
  );

  const slides = [
    welcomeSlide,
    qrCodeSlide,
    capacitySlide,
    translateSlide,
  ];

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide(i => (i + 1) % slides.length);
    }, slideInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, slideInterval, slides.length]);

  const prevSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentSlide(i => (i - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentSlide(i => (i + 1) % slides.length);
  };

  const goToSlide = (i: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentSlide(i);
  };

  const thirdSection = isMobile ? (
    <section
      className={
        (darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg') +
        ' flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12'
      }
    >
      <div className="flex flex-col md:flex-row items-center justify-between w-full pt-8 md:py-32 gap-8">
        <div className="mx-auto flex flex-col items-center md:items-start w-full md:w-1/2">
          <h1
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' text-center font-[Montserrat] text-[24px] not-italic font-extrabold '
            }
          >
            {pageContent['body-loggedin-home-third-section-title']}
          </h1>
          <p
            className={
              (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
              ' text-center font-[Montserrat] text-[16px] not-italic font-normal leading-[normal] my-[24px]'
            }
          >
            {pageContent['body-loggedin-home-third-section-description']}
          </p>
          <BaseButton
            onClick={() => {
              navigator.clipboard.writeText('capx@wmnobrasil.org');
              showSnackbar(
                pageContent['body-loggedin-home-third-section-button-success'],
                'success'
              );
            }}
            label={pageContent['body-loggedin-home-third-section-button']}
            customClass="w-fit sm:w-fit rounded-[6px] bg-[#851970] inline-flex px-[16px] text-white font-bold py-[8px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
          />
        </div>
      </div>
    </section>
  ) : (
    <div className="flex flex-col items-center md:items-start w-full md:w-1/2 lg:w-2/3">
      <h1
        className={
          (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
          ' font-[Montserrat] text-[48px] not-italic font-extrabold leading-[59px]'
        }
      >
        {pageContent['body-loggedin-home-third-section-title']}
      </h1>
      <p
        className={
          (darkMode ? 'text-[#FFF]' : 'text-[#053749]') +
          ' font-[Montserrat] text-[30px] not-italic font-normal leading-[normal] my-[24px]'
        }
      >
        {pageContent['body-loggedin-home-third-section-description']}
      </p>
      <BaseButton
        onClick={() => {
          navigator.clipboard.writeText('capx@wmnobrasil.org');
          showSnackbar(
            pageContent['body-loggedin-home-third-section-button-success'],
            'success'
          );
        }}
        label={pageContent['body-loggedin-home-third-section-button']}
        customClass="rounded-[6px] bg-[#851970] inline-flex px-[32px] py-[16px] text-white font-bold h-[64px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]"
      />
    </div>
  );

  return (
    <>
      {/* Showcase slider */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="w-full flex-shrink-0 min-w-0">
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Slider navigation */}
      <div
        className={
          (darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg') +
          ' flex items-center justify-center gap-4 py-4 w-full'
        }
      >
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className={
            (darkMode
              ? 'text-[#FFF] hover:bg-white/10'
              : 'text-[#053749] hover:bg-black/5') +
            ' rounded-full p-2 transition-colors duration-200'
          }
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={
                'rounded-full transition-all duration-300 ' +
                (i === currentSlide
                  ? 'w-6 h-2 bg-[#851970]'
                  : (darkMode
                      ? 'w-2 h-2 bg-white/30 hover:bg-white/50'
                      : 'w-2 h-2 bg-[#053749]/30 hover:bg-[#053749]/50'))
              }
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className={
            (darkMode
              ? 'text-[#FFF] hover:bg-white/10'
              : 'text-[#053749] hover:bg-black/5') +
            ' rounded-full p-2 transition-colors duration-200'
          }
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <SectionRecommendationsCarousel />

      {isMobile ? (
        thirdSection
      ) : (
        <section className="flex flex-col items-center justify-start w-full mx-auto">
          {thirdSection}
        </section>
      )}
    </>
  );
}
