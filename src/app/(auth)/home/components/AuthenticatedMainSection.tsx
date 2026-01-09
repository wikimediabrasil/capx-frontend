import { useSnackbar } from '@/app/providers/SnackbarProvider';
import BaseButton from '@/components/BaseButton';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/hooks/useProfile';
import MainSectionIllustration from '@/public/static/images/capx_loggedin_home_illustration.svg';
import MainSectionIllustrationDark from '@/public/static/images/capx_loggedin_home_illustration_dark.svg';
import { LanguageProficiency } from '@/types/language';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SectionRecommendationsCarousel from './SectionRecommendationsCarousel';

interface AuthenticatedMainSectionProps {
  pageContent: any;
}

export default function AuthenticatedMainSection({ pageContent }: AuthenticatedMainSectionProps) {
  const { isMobile } = useApp();
  const { darkMode } = useTheme();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { data: session } = useSession();
  const token = session?.user?.token;
  const userId = session?.user?.id ? Number(session.user.id) : undefined;

  const { profile } = useProfile(token, userId as number);

  const fd = {
    skills_known: [] as number[],
    skills_available: [] as number[],
    skills_wanted: [] as number[],
    language: [] as LanguageProficiency[],
    ...(profile ?? {}),
  };

  const hasSkillsOrLanguages =
    (Array.isArray(fd.language) && fd.language.length > 0) ||
    (Array.isArray(fd.skills_known) && fd.skills_known.length > 0) ||
    (Array.isArray(fd.skills_available) && fd.skills_available.length > 0) ||
    (Array.isArray(fd.skills_wanted) && fd.skills_wanted.length > 0);

  if (isMobile) {
    return (
      <>
        <section
          className={
            (darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg') +
            ' flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 mt-8'
          }
        >
          <div className="flex flex-col md:flex-row items-center justify-between w-full py-16 md:py-32 gap-8">
            <div className="flex flex-col items-center md:items-start w-full md:w-1/2">
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
                  onClick={() => router.push('/capacity')}
                  label={pageContent['body-loggedin-home-main-section-button01']}
                  customClass="rounded-[6px] bg-[#851970] inline-flex px-[19px] py-[8px] justify-center items-center gap-[10px] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
                ></BaseButton>
              </div>
              <BaseButton
                label={pageContent['body-loggedin-home-main-section-button02']}
                onClick={() => router.push('/profile')}
                customClass="w-fit sm:w-fit rounded-[6px] border-[1px] border-[solid] border-[var(--Backgrounds-dark-box-bg,#053749)] bg-[#FFF] inline-flex px-[16px] py-[8px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
              ></BaseButton>
            </div>
          </div>
        </section>
        <SectionRecommendationsCarousel />

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
      </>
    );
  }

  return (
    <>
      <section className="flex flex-col items-center justify-start w-full mx-auto ">
        <div className="flex flex-row items-center justify-between w-full py-[128px] gap-8 max-w-screen-xl mx-auto px-8">
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
                  onClick={() => router.push('/capacity')}
                  label={pageContent['body-loggedin-home-main-section-button01']}
                ></BaseButton>
              </div>
              <BaseButton
                label={pageContent['body-loggedin-home-main-section-button02']}
                customClass="rounded-[6px] border-[1px] border-[solid] border-[var(--Backgrounds-dark-box-bg,#053749)] bg-[#FFF] inline-flex px-[32px] py-[16px] h-[64px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]"
                onClick={() => router.push('/profile')}
              ></BaseButton>
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
        <SectionRecommendationsCarousel />

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
      </section>
    </>
  );
}
