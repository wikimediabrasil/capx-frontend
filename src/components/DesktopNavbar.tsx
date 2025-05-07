import NextLink from "next/link";
import Image from "next/image";
import AuthButton from "./AuthButton";
import LanguageSelect from "./LanguageSelect";
import CapXLogo from "../../public/static/images/capx_minimalistic_logo.svg";
import DarkModeButton from "./DarkModeButton";
import ProfileSelect from "./ProfileSelect";
import { useTheme } from "@/contexts/ThemeContext";
import { Session } from "next-auth";
import { useState, useRef, useEffect } from "react";
import BurgerMenu from "@/public/static/images/burger_menu.svg";
import BurgerMenuDarkMode from "@/public/static/images/burger_menu_light.svg";
import IconCloseMobileMenuLightMode from "@/public/static/images/close_mobile_menu_icon_light_mode.svg";
import IconCloseMobileMenuDarkMode from "@/public/static/images/close_mobile_menu_icon_dark_mode.svg";
import MoveOutIcon from "@/public/static/images/move_item.svg";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
export interface DesktopNavbarProps {
  language: string;
  setLanguage: (language: string) => void;
  session: Session | null;
}

export default function DesktopNavbar({
  language,
  setLanguage,
  session,
}: DesktopNavbarProps) {
  const { darkMode } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const { pageContent } = useApp();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const token = session?.user?.token;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMenu &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest("#hamburger-menu")
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const menuItems = [
    { title: pageContent["navbar-link-home"], to: "/home", active: true },
    {
      title: pageContent["navbar-link-capacities"],
      to: "/capacity",
      active: true,
    },
    {
      title: pageContent["navbar-link-feed"],
      to: "/feed",
      active: true,
    },
    {
      title: pageContent["navbar-link-saved-profiles"],
      to: "/feed/saved",
      active: true,
    },
    {
      title: pageContent["navbar-link-reports"],
      to: "/report_bug",
      active: true,
    },
    {
      title: pageContent["navbar-link-messages"],
      to: "/message",
      active: true,
    },
    {
      title: pageContent["navbar-link-organizations"],
      to: "/organization_list",
      active: true,
    },
  ];

  const unauthenticatedMenuItems = [
    {
      title: pageContent["navbar-link-organizations"],
      to: "/organization_list",
      active: true,
    },
  ];

  const animationVariants = {
    initial: {
      opacity: 0,
      y: -20,
      scaleY: 0.8,
    },
    animate: {
      opacity: 1,
      y: 0,
      scaleY: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scaleY: 0.8,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  return (
    <div
      className={`${
        darkMode
          ? "bg-capx-dark-box-bg text-capx-dark-text"
          : "bg-capx-light-bg text-capx-light-text"
      }`}
    >
      <div className="flex w-full h-full justify-between pb-6 pt-10 px-4 md:px-8 lg:px-12 max-w-screen-xl mx-auto">
        <div className="flex-none relative my-auto ml-4 sm:ml-0">
          <NextLink href={token ? "/home" : "/"}>
            <div className="relative w-[80px] h-[80px]">
              <Image
                priority
                src={CapXLogo}
                alt="Capacity Exchange logo"
                className="w-[100px] h-[100px] object-contain"
              />
            </div>
          </NextLink>
        </div>

        {/* Routes for unauthenticated users */}
        {!session && (
          <div className="flex items-center ml-10">
            {unauthenticatedMenuItems.map((item, index) => (
              <NextLink
                key={`desktop-menu-item-${index}`}
                href={item.to}
                className="flex text-center font-[Montserrat] text-[20px] not-italic font-normal leading-[normal] my-auto cursor-pointer hover:border-b hover:border-current"
              >
                {item.title}
              </NextLink>
            ))}
          </div>
        )}

        <div className="flex flex-[1.5] items-center justify-end gap-[24px] pl-4">
          <DarkModeButton />
          {session ? <ProfileSelect /> : null}
          <LanguageSelect
            isMobile={false}
            language={language}
            setLanguage={setLanguage}
          />

          {/* Hamburger Menu Button (shows when logged in) */}
          {session && (
            <div className="relative">
              <button
                ref={menuButtonRef}
                onClick={() => setShowMenu(!showMenu)}
                className="focus:outline-none"
                aria-label={showMenu ? "Close menu" : "Open menu"}
              >
                <Image
                  src={
                    showMenu
                      ? darkMode
                        ? IconCloseMobileMenuDarkMode
                        : IconCloseMobileMenuLightMode
                      : darkMode
                      ? BurgerMenuDarkMode
                      : BurgerMenu
                  }
                  alt={showMenu ? "Close menu" : "Menu"}
                  width={32}
                  height={32}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    id="hamburger-menu"
                    variants={animationVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={`absolute right-0 top-full mt-2 z-50 w-[250px] overflow-hidden rounded-md ${
                      darkMode
                        ? "bg-capx-dark-box-bg text-white border border-gray-700"
                        : "bg-white text-capx-dark-bg border border-gray-200"
                    } shadow-lg origin-top`}
                  >
                    <div className="flex flex-col py-2">
                      {menuItems.map((item, index) => (
                        <NextLink
                          key={`desktop-menu-item-${index}`}
                          href={item.to}
                          onClick={() => setShowMenu(false)}
                          className={`flex items-center px-4 py-3 transition-colors ${
                            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                          }`}
                        >
                          <span className="text-lg font-medium">
                            {item.title}
                          </span>
                        </NextLink>
                      ))}

                      {/* Divider */}
                      <div
                        className={`my-2 border-t ${
                          darkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                      ></div>

                      {/* Logout button*/}
                      <div
                        className={`flex items-center px-4 py-3 transition-colors ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="w-[100%] mx-auto">
                          <AuthButton
                            message={pageContent["sign-out-button"]}
                            isSignOut={true}
                            imageUrl={MoveOutIcon}
                            customClass="w-full h-[32px] flex items-center px-[6px] py-[8px] rounded-[4px] !text-[16px] justify-start pt-4 px-[8px] py-[0] !mb-0"
                            isMobileMenu={true}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Login button */}
          {!session && (
            <AuthButton
              message={pageContent["sign-in-button"]}
              isSignOut={false}
              customClass="inline-flex px-[19px] py-[8px] justify-center items-center gap-[10px] rounded-[8px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] flex h-[64px] px-[32px] py-[16px] justify-center items-center gap-[8px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
