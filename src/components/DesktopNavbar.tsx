import NextLink from "next/link";
import Image from "next/image";
import AuthButton from "./AuthButton";
import LanguageSelect from "./LanguageSelect";
import CapXLogo from "../../public/static/images/capx_minimalistic_logo.svg";
import DarkModeButton from "./DarkModeButton";
import ProfileSelect from "./ProfileSelect";
import { useTheme } from "@/contexts/ThemeContext";
import { Session } from "@/types/user";

export interface DesktopNavbarProps {
  pageContent: any;
  language: string;
  setLanguage: (language: string) => void;
  setPageContent: (pageContent: any) => void;
  session: Session;
}

export default function DesktopNavbar({
  pageContent,
  language,
  setLanguage,
  setPageContent,
  session,
}: DesktopNavbarProps) {
  const { darkMode } = useTheme();

  const menuItems = [
    { title: pageContent["navbar-link-home"], 
      to: "/home", 
      active: true },
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
      title: pageContent["navbar-organization-list"],
      to: "/organization_list",
      active: true,
    },
  ];

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
          <NextLink href="/">
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
        {session ? (
          <div className="flex flex-row xl:flex items-center justify-start gap-[43px] ml-[50px]">
            {menuItems.map((item, index) => (
              <NextLink
                key={"navbar-link-" + index.toString()}
                href={item.to}
                className="flex text-center font-[Montserrat] text-[20px] not-italic font-normal leading-[normal] my-auto cursor-pointer hover:border-b hover:border-current"
              >
                {item.title}
              </NextLink>
            ))}
          </div>
        ) : null}

        <div className="flex flex-[1.5] items-center justify-end gap-[24px] pl-4">
          <DarkModeButton />
          {session ? <ProfileSelect /> : null}
          <LanguageSelect
            isMobile={false}
            language={language}
            setLanguage={setLanguage}
            setPageContent={setPageContent}
            pageContent={pageContent}
          />

          {session ? (
            <AuthButton
              message={pageContent["sign-out-button"]}
              isSignOut={true}
              customClass="inline-flex px-[19px] py-[8px] justify-center items-center gap-[10px] rounded-[8px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] flex h-[64px] px-[32px] py-[16px] justify-center items-center gap-[8px]"
            />
          ) : (
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
