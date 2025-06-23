'use client';
import { AnimatePresence } from 'framer-motion';
import MobileMenu from './MobileMenu';
import CapXLogo from '../../public/static/images/capx_minimalistic_logo.svg';
import Image from 'next/image';
import NextLink from 'next/link';
import AuthButton from './AuthButton';
import LanguageSelect from './LanguageSelect';
import DarkModeButton from './DarkModeButton';
import BurgerMenu from '@/public/static/images/burger_menu.svg';
import BurgerMenuDarkMode from '@/public/static/images/burger_menu_light.svg';
import { useApp } from '@/contexts/AppContext';
import IconCloseMobileMenuLightMode from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import IconCloseMobileMenuDarkMode from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import { useTheme } from '@/contexts/ThemeContext';
import { Session } from 'next-auth';

interface MobileNavbarProps {
  session: Session | null;
  language: string;
  setLanguage: (language: string) => void;
}

export default function MobileNavbar({ session, language, setLanguage }: MobileNavbarProps) {
  const { isMobile, mobileMenuStatus, setMobileMenuStatus } = useApp();
  const { darkMode } = useTheme();
  const navbarClasses = `fixed top-0 left-0 right-0 z-50 mb-16 ${
    darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'
  } ${mobileMenuStatus ? 'shadow-lg' : ''}`;

  const token = session?.user?.token;
  if (session) {
    return (
      <>
        <div className={navbarClasses}>
          <div className="flex w-screen max-w-full justify-between items-center px-4 py-4">
            <div className="relative flex items-center">
              <NextLink href={token ? '/home' : '/'}>
                <Image
                  priority
                  src={CapXLogo}
                  alt="Capacity Exchange logo"
                  width={48}
                  height={48}
                  className="w-[48px] h-[48px] mb-2"
                />
              </NextLink>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <DarkModeButton />
              <LanguageSelect isMobile={isMobile} language={language} setLanguage={setLanguage} />

              <div className="flex items-center">
                {mobileMenuStatus ? (
                  <button onClick={() => setMobileMenuStatus(false)}>
                    <Image
                      src={darkMode ? IconCloseMobileMenuDarkMode : IconCloseMobileMenuLightMode}
                      alt="Close menu"
                      width={32}
                      height={32}
                    />
                  </button>
                ) : (
                  <button onClick={() => setMobileMenuStatus(true)}>
                    <Image
                      src={darkMode ? BurgerMenuDarkMode : BurgerMenu}
                      alt="Burger Menu"
                      width={32}
                      height={32}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {isMobile && mobileMenuStatus && session && <MobileMenu session={session} />}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <div className={navbarClasses}>
        <div className="flex w-screen max-w-full justify-between items-center px-4 py-4">
          <div className="relative flex items-center">
            <NextLink href="/">
              <Image
                priority
                src={CapXLogo}
                alt="Capacity Exchange logo"
                width={32}
                height={32}
                className="w-[32px] h-[32px]"
              />
            </NextLink>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <DarkModeButton />
            <LanguageSelect isMobile={isMobile} language={language} setLanguage={setLanguage} />

            <div className="flex items-center">
              {mobileMenuStatus ? (
                <button
                  onClick={() => setMobileMenuStatus(false)}
                  aria-label="close menu"
                  className="p-2"
                >
                  <Image
                    src={darkMode ? IconCloseMobileMenuDarkMode : IconCloseMobileMenuLightMode}
                    alt="Close Menu"
                    width={32}
                    height={32}
                  />
                </button>
              ) : (
                <button
                  onClick={() => setMobileMenuStatus(true)}
                  aria-label="open menu"
                  className="p-2"
                >
                  <Image
                    src={darkMode ? BurgerMenuDarkMode : BurgerMenu}
                    alt="Burger Menu"
                    width={32}
                    height={32}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isMobile && mobileMenuStatus && <MobileMenu session={session} />}
      </AnimatePresence>
    </>
  );
}
