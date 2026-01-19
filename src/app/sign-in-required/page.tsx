'use client';

import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import AuthButton from '@/components/AuthButton';
import BaseButton from '@/components/BaseButton';
import BaseWrapper from '@/components/BaseWrapper';
import { useRouter } from 'next/navigation';
import ConnectIllustration from '@/public/static/images/connect_wikimedians_illustration.svg';
import ConnectIllustrationDark from '@/public/static/images/capx_loggedin_home_illustration_dark.svg';

function SignInRequiredContent() {
  const { isMobile, pageContent } = useApp();
  const { darkMode } = useTheme();
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const illustration = darkMode ? ConnectIllustrationDark : ConnectIllustration;

  if (isMobile) {
    return (
      <div
        className={`min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6 py-12 ${
          darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'
        }`}
      >
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <div className="w-48 h-48 mb-8 relative">
            <Image
              src={illustration}
              alt={pageContent['alt-illustration'] || 'Illustration'}
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1
            className={`font-[Montserrat] text-2xl font-extrabold mb-4 ${
              darkMode ? 'text-capx-dark-text' : 'text-capx-light-text'
            }`}
          >
            {pageContent['sign-in-required-title'] || 'Sign in to continue'}
          </h1>

          <p
            className={`font-[Montserrat] text-sm mb-8 ${
              darkMode ? 'text-capx-dark-text' : 'text-capx-light-text'
            }`}
          >
            {pageContent['sign-in-required-description'] ||
              'You need to be logged in to access this page. Join CapX to connect with Wikimedians and exchange capacities.'}
          </p>

          <div className="flex flex-col items-center gap-4 w-full">
            <AuthButton
              message={pageContent['sign-in-button'] || 'Login'}
              customClass="px-8 py-3 w-full max-w-[200px]"
            />
            <BaseButton
              onClick={handleGoHome}
              label={pageContent['sign-in-required-go-home'] || 'Go to home page'}
              customClass={`h-10 w-full max-w-[200px] rounded-md border border-solid ${
                darkMode
                  ? 'border-capx-dark-text text-capx-dark-text bg-transparent'
                  : 'border-capx-light-text text-capx-light-text bg-white'
              } inline-flex justify-center items-center text-center font-[Montserrat] text-sm font-semibold`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-[calc(100vh-200px)] flex items-center justify-center px-8 py-16 ${
        darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'
      }`}
    >
      <div className="w-full max-w-4xl flex flex-row items-center justify-between gap-12">
        <div className="flex-1 flex flex-col items-start">
          <h1
            className={`font-[Montserrat] text-4xl lg:text-5xl font-extrabold mb-6 ${
              darkMode ? 'text-capx-dark-text' : 'text-capx-light-text'
            }`}
          >
            {pageContent['sign-in-required-title'] || 'Sign in to continue'}
          </h1>

          <p
            className={`font-[Montserrat] text-lg lg:text-xl mb-8 leading-relaxed ${
              darkMode ? 'text-capx-dark-text' : 'text-capx-light-text'
            }`}
          >
            {pageContent['sign-in-required-description'] ||
              'You need to be logged in to access this page. Join CapX to connect with Wikimedians and exchange capacities.'}
          </p>

          <div className="flex flex-row items-center gap-4">
            <AuthButton
              message={pageContent['sign-in-button'] || 'Login'}
              customClass="px-8 py-4"
            />
            <BaseButton
              onClick={handleGoHome}
              label={pageContent['sign-in-required-go-home'] || 'Go to home page'}
              customClass={`h-14 rounded-md border border-solid ${
                darkMode
                  ? 'border-capx-dark-text text-capx-dark-text bg-transparent'
                  : 'border-capx-light-text text-capx-light-text bg-white'
              } inline-flex px-6 justify-center items-center text-center font-[Montserrat] text-lg font-semibold`}
            />
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center">
          <div className="w-80 h-80 lg:w-96 lg:h-96 relative">
            <Image
              src={illustration}
              alt={pageContent['alt-illustration'] || 'Illustration'}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInRequiredPage() {
  return (
    <BaseWrapper>
      <SignInRequiredContent />
    </BaseWrapper>
  );
}
