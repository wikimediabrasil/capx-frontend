'use client';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import BaseButton from '@/components/BaseButton';
import { useProfile } from '@/hooks/useProfile';
import AccountTreeIcon from '@/public/static/images/account_tree.svg';
import AccountTreeIconWhite from '@/public/static/images/account_tree_white.svg';
import MainSectionIllustration from '@/public/static/images/capx_loggedin_home_illustration.svg';
import MainSectionIllustrationDark from '@/public/static/images/capx_loggedin_home_illustration_dark.svg';
import CapxQrCode from '@/public/static/images/capx_qr_code.svg';
import CapxQrCodeWhite from '@/public/static/images/capx_qr_code_white.svg';
import CollapseAllIcon from '@/public/static/images/collapse_all.svg';
import CollapseAllIconWhite from '@/public/static/images/collapse_all_white.svg';
import LanguageIcon from '@/public/static/images/language_black.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import { useDarkMode, useIsMobile } from '@/stores';
import { LanguageProficiency } from '@/types/language';
import { useSession } from 'next-auth/react';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import SectionRecommendationsCarousel from './SectionRecommendationsCarousel';

interface AuthenticatedMainSectionProps {
  pageContent: any;
  slideInterval?: number;
}

function ChevronLeft({ className }: Readonly<{ className?: string }>) {
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

function ChevronRight({ className }: Readonly<{ className?: string }>) {
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

function StackedCardsIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="5" rx="1.5" fill="currentColor" />
      <rect x="3" y="9.5" width="18" height="5" rx="1.5" fill="currentColor" />
      <rect x="3" y="16" width="18" height="5" rx="1.5" fill="currentColor" />
    </svg>
  );
}

const MOBILE_CTA_CLASS =
  'w-fit rounded-[6px] bg-[#851970] inline-flex px-[16px] py-[8px] justify-center items-center gap-[8px] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]';
const DESKTOP_CTA_CLASS =
  'rounded-[6px] bg-[#851970] inline-flex px-[32px] py-[16px] h-[64px] justify-center items-center gap-[8px] text-[#F6F6F6] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]';

interface FeatureSlideProps {
  title: string;
  description: string;
  buttonLabel: string;
  onButtonClick: () => void;
  visualSrc: StaticImageData;
  visualAlt: string;
  isMobile: boolean;
  darkMode: boolean;
}

function FeatureSlide({
  title,
  description,
  buttonLabel,
  onButtonClick,
  visualSrc,
  visualAlt,
  isMobile,
  darkMode,
}: Readonly<FeatureSlideProps>) {
  const textClass = darkMode ? 'text-[#FFF]' : 'text-[#053749]';
  const bgClass = darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg';

  if (isMobile) {
    return (
      <section
        className={`${bgClass} flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-8`}
      >
        <div className="flex flex-col items-center justify-center w-full gap-6">
          <Image src={visualSrc} alt={visualAlt} width={120} height={120} className="w-30 h-30" />
          <div className="flex flex-col items-center gap-2 text-center">
            <h2
              className={`${textClass} font-[Montserrat] text-[20px] not-italic font-extrabold leading-[normal]`}
            >
              {title}
            </h2>
            <p
              className={`${textClass} font-[Montserrat] text-[14px] not-italic font-normal leading-[normal]`}
            >
              {description}
            </p>
          </div>
          <BaseButton onClick={onButtonClick} label={buttonLabel} customClass={MOBILE_CTA_CLASS} />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center w-full mx-auto">
      <div className="flex flex-row items-center justify-between w-full py-[128px] gap-16 max-w-screen-xl mx-auto px-8">
        <div className="flex flex-col items-start w-full lg:w-2/3 gap-6">
          <h2
            className={`${textClass} font-[Montserrat] text-[48px] not-italic font-extrabold leading-[59px]`}
          >
            {title}
          </h2>
          <p
            className={`${textClass} font-[Montserrat] text-[24px] not-italic font-normal leading-[normal]`}
          >
            {description}
          </p>
          <BaseButton onClick={onButtonClick} label={buttonLabel} customClass={DESKTOP_CTA_CLASS} />
        </div>
        <div className="flex items-center justify-center w-1/3">
          <Image
            src={visualSrc}
            alt={visualAlt}
            width={220}
            height={220}
            className="w-full max-w-[220px] h-auto"
          />
        </div>
      </div>
    </section>
  );
}

export function AnalyticsCallToActionSkeleton() {
  const isMobile = useIsMobile();
  const darkMode = useDarkMode();

  if (isMobile) {
    return (
      <section
        className={
          (darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg') +
          ' flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-16'
        }
      >
        <div className="flex flex-col items-center justify-center w-full gap-4">
          <div className="relative min-h-[60px] flex items-center justify-center w-full">
            <div
              className={`animate-pulse rounded h-5 w-3/4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            />
          </div>
          <div
            className={`animate-pulse rounded h-9 w-36 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-8 py-16">
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <div className="relative min-h-[80px] flex items-center justify-center w-full">
          <div
            className={`animate-pulse rounded h-8 w-2/3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          />
        </div>
        <div
          className={`animate-pulse rounded h-16 w-56 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
        />
      </div>
    </section>
  );
}

export default function AuthenticatedMainSection({
  pageContent,
  slideInterval = 5000,
}: Readonly<AuthenticatedMainSectionProps>) {
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
  const showcaseSliderRef = useRef<HTMLElement | null>(null);

  const _fd = {
    skills_known: [] as number[],
    skills_available: [] as number[],
    skills_wanted: [] as number[],
    language: [] as LanguageProficiency[],
    ...(profile ?? {}),
  };

  const textClass = darkMode ? 'text-[#FFF]' : 'text-[#053749]';
  const bgClass = darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg';

  const welcomeSlide = isMobile ? (
    <section
      className={`${bgClass} flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 mt-8`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between w-full pb-4 pt-8 md:pb-8 pt-16 gap-8">
        <div className="flex flex-col items-center md:items-start w-full md:w-1/2 pb-4 md:pb-0">
          <h1
            className={`${textClass} text-center text-[24px] not-italic font-extrabold leading-[29px]`}
          >
            {pageContent['body-loggedin-home-main-section-title']}
          </h1>
          <h2 className={`${textClass} text-[16px] not-italic font-normal leading-[20px]`}>
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
            className={`${textClass} font-[Montserrat] text-[72px] not-italic font-extrabold leading-[88px]`}
          >
            {pageContent['body-loggedin-home-main-section-title']}
          </h1>
          <h2
            className={`${textClass} font-[Montserrat] text-[48px] not-italic font-extrabold leading-[59px]`}
          >
            {pageContent['body-loggedin-home-main-section-description']}
          </h2>
          <p
            className={`${textClass} font-[Montserrat] text-[30px] not-italic font-normal leading-[normal] my-[24px]`}
          >
            {pageContent['body-home-section01-description']}
          </p>
          <p
            className={`${textClass} font-[Montserrat] text-[20px] not-italic font-normal leading-[normal]`}
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
            alt={
              pageContent['alt-illustration'] || 'Main illustration showing people collaborating'
            }
            height={520}
            width={520}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );

  const qrCodeSlide = (
    <FeatureSlide
      title={pageContent['home-qr-cta-title'] || 'Share your CapX profile'}
      description={
        pageContent['home-qr-cta-description'] ||
        (isMobile
          ? 'Generate a QR code from your profile and share it anywhere.'
          : 'Generate a QR code from your profile and share it anywhere — events, wikis, business cards.')
      }
      buttonLabel={pageContent['home-qr-cta-button'] || 'Go to my profile'}
      onButtonClick={() => router.push('/profile')}
      visualSrc={darkMode ? CapxQrCodeWhite : CapxQrCode}
      visualAlt="QR code linking to capx.toolforge.org"
      isMobile={isMobile}
      darkMode={darkMode}
    />
  );

  const stackedCardsColor = darkMode ? '#FFF' : '#053749';
  const capacityVisualizationModes = [
    {
      node: <StackedCardsIcon className="w-full h-full" />,
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
      className={`${bgClass} flex flex-col items-center justify-between w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-6 h-full`}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h2
          className={`${textClass} font-[Montserrat] text-[20px] not-italic font-extrabold leading-[normal]`}
        >
          {pageContent['home-capacity-cta-title'] || 'Three new ways to explore capacities'}
        </h2>
        <p
          className={`${textClass} font-[Montserrat] text-[14px] not-italic font-normal leading-[normal]`}
        >
          {pageContent['home-capacity-cta-description'] || 'Find the view that works best for you.'}
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        {capacityVisualizationModes.map((mode, i) => (
          <div
            key={i}
            className={`${darkMode ? 'bg-[#053749]' : 'bg-white'} flex flex-row items-center gap-3 rounded-[12px] px-4 py-3 shadow-sm`}
          >
            {mode.node ? (
              <div className="w-6 h-6 flex-shrink-0" style={{ color: stackedCardsColor }}>
                {mode.node}
              </div>
            ) : (
              <Image
                src={mode.icon}
                alt={mode.label}
                width={24}
                height={24}
                className="w-6 h-6 flex-shrink-0"
              />
            )}
            <span
              className={`${textClass} font-[Montserrat] text-[14px] font-semibold leading-tight`}
            >
              {mode.label}
            </span>
          </div>
        ))}
      </div>
      <BaseButton
        onClick={() => router.push('/capacity')}
        label={pageContent['home-capacity-cta-button'] || 'Explore capacities'}
        customClass={MOBILE_CTA_CLASS}
      />
    </section>
  ) : (
    <section className="flex flex-col items-center justify-center w-full mx-auto">
      <div className="flex flex-row items-center justify-between w-full py-[128px] gap-16 max-w-screen-xl mx-auto px-8">
        <div className="flex flex-col items-start w-full lg:w-2/3 gap-8">
          <h2
            className={`${textClass} font-[Montserrat] text-[48px] not-italic font-extrabold leading-[59px]`}
          >
            {pageContent['home-capacity-cta-title'] || 'Three new ways to explore capacities'}
          </h2>
          <p
            className={`${textClass} font-[Montserrat] text-[24px] not-italic font-normal leading-[normal]`}
          >
            {pageContent['home-capacity-cta-description'] ||
              'Browse cards, navigate a tree structure, or explore by categories. Find the view that works best for you.'}
          </p>
          <BaseButton
            onClick={() => router.push('/capacity')}
            label={pageContent['home-capacity-cta-button'] || 'Explore capacities'}
            customClass={DESKTOP_CTA_CLASS}
          />
        </div>
        <div className="flex flex-row items-center justify-center gap-6 w-1/3">
          {capacityVisualizationModes.map((mode, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div
                className={`${darkMode ? 'bg-[#053749]' : 'bg-white'} rounded-[16px] p-5 flex items-center justify-center shadow-md`}
              >
                {mode.node ? (
                  <div className="w-10 h-10" style={{ color: stackedCardsColor }}>
                    {mode.node}
                  </div>
                ) : (
                  <Image
                    src={mode.icon}
                    alt={mode.label}
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                )}
              </div>
              <span
                className={`${textClass} font-[Montserrat] text-[13px] font-semibold text-center leading-tight max-w-[80px]`}
              >
                {mode.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const translateSlide = (
    <FeatureSlide
      title={pageContent['home-translate-cta-title'] || 'Translate capacities and add new ones'}
      description={
        pageContent['home-translate-cta-description'] ||
        'Help translate capacity names and descriptions into your language, and contribute new capacities to grow the CapX knowledge base.'
      }
      buttonLabel={pageContent['home-translate-cta-button'] || 'Translate & contribute'}
      onButtonClick={() => router.push('/translate')}
      visualSrc={darkMode ? LanguageIconWhite : LanguageIcon}
      visualAlt="Translate"
      isMobile={isMobile}
      darkMode={darkMode}
    />
  );

  const slides = [welcomeSlide, qrCodeSlide, capacitySlide, translateSlide];

  useEffect(() => {
    const el = showcaseSliderRef.current;
    if (!el) return;

    const pause = () => setIsPaused(true);
    const resume = () => setIsPaused(false);

    const handleFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget;
      if (next instanceof Node && el.contains(next)) return;
      resume();
    };

    el.addEventListener('pointerenter', pause);
    el.addEventListener('pointerleave', resume);
    el.addEventListener('focusin', pause);
    el.addEventListener('focusout', handleFocusOut);

    return () => {
      el.removeEventListener('pointerenter', pause);
      el.removeEventListener('pointerleave', resume);
      el.removeEventListener('focusin', pause);
      el.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

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

  const thirdSectionContent = (
    <>
      <h1
        className={
          (isMobile ? 'text-center ' : '') +
          `${textClass} font-[Montserrat] ${isMobile ? 'text-[24px]' : 'text-[48px] leading-[59px]'} not-italic font-extrabold`
        }
      >
        {pageContent['body-loggedin-home-third-section-title']}
      </h1>
      <p
        className={
          (isMobile ? 'text-center ' : '') +
          `${textClass} font-[Montserrat] ${isMobile ? 'text-[16px]' : 'text-[30px]'} not-italic font-normal leading-[normal] my-[24px]`
        }
      >
        {pageContent['body-loggedin-home-third-section-description']}
      </p>
      <BaseButton
        onClick={() => {
          navigator.clipboard.writeText('capx@wmnobrasil.org');
          showSnackbar(pageContent['body-loggedin-home-third-section-button-success'], 'success');
        }}
        label={pageContent['body-loggedin-home-third-section-button']}
        customClass={
          isMobile
            ? 'w-fit sm:w-fit rounded-[6px] bg-[#851970] inline-flex px-[16px] text-white font-bold py-[8px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]'
            : 'rounded-[6px] bg-[#851970] inline-flex px-[32px] py-[16px] text-white font-bold h-[64px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]'
        }
      />
    </>
  );

  return (
    <>
      {/* Showcase slider */}
      <section
        ref={showcaseSliderRef}
        className="relative w-full overflow-hidden"
        aria-roledescription="carousel"
        aria-label={pageContent['body-loggedin-home-main-section-title'] || 'Home highlights'}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out "
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="flex w-full flex-shrink-0 min-w-0">
              {slide}
            </div>
          ))}
        </div>
      </section>

      {/* Slider navigation */}
      <div className={`${bgClass} flex items-center justify-center gap-4 py-4 w-full`}>
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className={
            (darkMode ? 'text-[#FFF] hover:bg-white/10' : 'text-[#053749] hover:bg-black/5') +
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
                  : darkMode
                    ? 'w-2 h-2 bg-white/30 hover:bg-white/50'
                    : 'w-2 h-2 bg-[#053749]/30 hover:bg-[#053749]/50')
              }
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className={
            (darkMode ? 'text-[#FFF] hover:bg-white/10' : 'text-[#053749] hover:bg-black/5') +
            ' rounded-full p-2 transition-colors duration-200'
          }
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <SectionRecommendationsCarousel />

      {isMobile ? (
        <section
          className={`${bgClass} flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12`}
        >
          <div className="mx-auto flex flex-col items-center w-full pt-8 gap-0">
            {thirdSectionContent}
          </div>
        </section>
      ) : (
        <section className="flex flex-col items-center justify-start w-full mx-auto">
          <div className="flex flex-col items-center md:items-start w-full md:w-1/2 lg:w-2/3">
            {thirdSectionContent}
          </div>
        </section>
      )}
    </>
  );
}
