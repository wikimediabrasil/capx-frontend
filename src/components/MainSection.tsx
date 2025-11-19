import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import CommonsLogo from '@/public/static/images/commons_logo.svg';
import MainImage from '@/public/static/images/main_image.svg';
import MediaWikiLogo from '@/public/static/images/mediawiki_logo.svg';
import WikibooksLogo from '@/public/static/images/wikibooks_logo.svg';
import WikidataLogo from '@/public/static/images/wikidata_logo.svg';
import WikifunctionsLogo from '@/public/static/images/wikifunctions_logo.svg';
import WikimediaLogo from '@/public/static/images/wikimedia_logo.svg';
import WikipediaLogo from '@/public/static/images/wikipedia_logo.svg';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Typewriter } from 'react-simple-typewriter';
import AuthButton from './AuthButton';
import BaseButton from './BaseButton';

export default function MainSection() {
  const { isMobile, pageContent } = useApp();
  const { darkMode } = useTheme();
  const { data: session } = useSession();

  // Internationalized dynamic title handling using a parameterized template with a $1 placeholder
  // and a list of words from the carousel. This enables correct ordering for other languages.
  const rawTemplate: string | undefined = pageContent['body-home-section01-title-template'];
  const cleanedTemplate = typeof rawTemplate === 'string' ? rawTemplate.trim() : '';
  const template = cleanedTemplate.length > 0 ? cleanedTemplate : 'A space for exchanging $1';
  const hasTemplate = template.includes('$1');
  const [prefix, suffix] = hasTemplate ? template.split('$1') : [template + ' ', ''];
  const words: string[] = (pageContent['body-home-section01-title-carousel']?.split(',') || [])
    .map(w => w.trim())
    .filter(Boolean);

  const scrollToVideo = () => {
    const element = document.getElementById('video-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isMobile) {
    return (
      <section
        id="main-section"
        className={`flex flex-col items-center justify-center w-full ${
          darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'
        }`}
      >
        <div className="flex flex-col items-center justify-center w-full px-4 py-8 mt-24">
          <div className="mx-16">
            <h1
              className={`text-${
                darkMode ? 'capx-dark-text' : 'capx-light-text'
              } text-center font-[Montserrat] text-[32px] not-italic font-extrabold leading-[normal] mb-4`}
            >
              {prefix}
              {words.length > 0 ? (
                <Typewriter
                  words={words}
                  loop={0}
                  cursor
                  cursorStyle="_"
                  typeSpeed={120}
                  deleteSpeed={50}
                  delaySpeed={3000}
                />
              ) : null}
              {suffix}
            </h1>
            <p
              className={`text-[12px] text-center mx-4 font-[Montserrat] ${
                darkMode ? 'text-capx-dark-text' : 'text-capx-light-text'
              }`}
            >
              {pageContent['body-home-section01-description']}
            </p>
          </div>

          <div className="w-full aspect-square">
            <Image
              priority={true}
              src={MainImage}
              alt={
                pageContent['alt-illustration'] || 'Main illustration showing people collaborating'
              }
              className="mx-auto px-10 w-full h-full"
            />
          </div>
          <div className="flex flex-col items-center gap-4 w-full my-8">
            {!session && (
              <AuthButton
                message={pageContent['body-home-section01-button']}
                customClass="px-[19px] py-[8px]"
              />
            )}
            <BaseButton
              onClick={scrollToVideo}
              label={pageContent['body-home-section01-about-button']}
              customClass="h-8 w-fit text-sm rounded-[6px] border-[1px] border-[solid] border-[var(--Backgrounds-dark-box-bg,#053749)] bg-[#FFF] inline-flex px-[16px] py-[8px] justify-center items-center gap-[8px] text-center font-[Montserrat] not-italic font-extrabold leading-[normal]"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`flex flex-col items-center justify-start w-full ${
        darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'
      }`}
    >
      <div className="w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex flex-row items-start justify-start w-full py-24">
          <div className="flex flex-col w-2/3 pr-20" data-testid="main-content">
            <div className="min-h-[176px] mb-12 flex flex-col" data-testid="title-container">
              <h1
                className={`text-${
                  darkMode ? 'capx-dark-text' : 'capx-light-text'
                } font-[Montserrat] text-[72px] not-italic font-extrabold leading-[1.2] break-words`}
              >
                {prefix}
                {prefix && !suffix && words.length > 0 && <br />}
                <span className="inline-block">
                  {words.length > 0 ? (
                    <Typewriter
                      words={words}
                      loop={0}
                      cursor
                      cursorStyle="_"
                      typeSpeed={120}
                      deleteSpeed={50}
                      delaySpeed={3000}
                    />
                  ) : null}
                </span>
                {suffix}
              </h1>
            </div>
            <p
              data-testid="main-description"
              className={`text-${
                darkMode ? 'capx-dark-text' : 'capx-light-text'
              } font-[Montserrat] text-[30px] not-italic font-normal leading-[1.4] mb-12 break-words`}
            >
              {pageContent['body-home-section01-description']}
            </p>
            <div className="flex flex-row items-center justify-start gap-4 w-full">
              {!session && (
                <AuthButton
                  message={pageContent['body-home-section01-button']}
                  customClass="py-4 px-8"
                />
              )}
              <BaseButton
                onClick={scrollToVideo}
                label={pageContent['body-home-section01-about-button']}
                customClass="h-16 rounded-[6px] border-[1px] border-[solid] border-[var(--Backgrounds-dark-box-bg,#053749)] bg-[#FFF] inline-flex px-[16px] py-[8px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]"
              />
            </div>
          </div>
          <div className="w-1/3 aspect-square">
            <Image
              priority={true}
              src={MainImage}
              alt={
                pageContent['alt-illustration'] || 'Main illustration showing people collaborating'
              }
              className="w-full h-full"
            />
          </div>
        </div>
        <div className="w-full flex flex-row items-center justify-between mb-12">
          <div className="w-1/4 h-[100px]">
            <p
              className={`flex w-[311px] h-[100px] flex-col justify-center text-[24px] not-italic font-extrabold leading-[37px] md:text-[18px] md:max-w-[100%] md:leading-[27px] xl:text-[24px] xl:max-w-[100%] xl:leading-[37px] ${
                darkMode ? 'text-capx-dark-text' : 'text-capx-light-text'
              }`}
            >
              {pageContent['body-home-main-section-carrousel-description']}
            </p>
          </div>
          <div className="w-3/4 h-[100px] flex flex-row items-center justify-center gap-2 md:gap-2 lg:gap-6 xl:gap-12">
            <Image
              src={WikimediaLogo}
              alt="Wikimedia logo"
              className="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[80px] xl:h-[80px]"
            />
            <Image
              src={WikipediaLogo}
              alt="Wikipedia logo"
              className="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[80px] xl:h-[80px]"
            />
            <Image
              src={WikibooksLogo}
              alt="Wikibooks logo"
              className="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[80px] xl:h-[80px]"
            />
            <Image
              src={MediaWikiLogo}
              alt="MediaWiki logo"
              className="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[80px] xl:h-[80px]"
            />
            <Image
              src={WikidataLogo}
              alt="Wikidata logo"
              className="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[80px] xl:h-[80px]"
            />
            <Image
              src={WikifunctionsLogo}
              alt="Wikifunctions logo"
              className="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[80px] xl:h-[80px]"
            />
            <Image
              src={CommonsLogo}
              alt="Commons logo"
              className="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[80px] xl:h-[80px]"
            />
            <p
              className={`text-${
                darkMode ? 'capx-dark-text' : 'capx-light-text'
              } font-[Montserrat] text-[14px] not-italic font-extrabold leading-[29px]`}
            >
              {pageContent['body-home-main-section-carrousel-description-more-projects']}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
