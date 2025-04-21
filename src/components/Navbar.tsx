"use client";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import { useApp } from "@/contexts/AppContext";

interface NavbarProps {
  session: any;
  language: string;
  setLanguage: (language: string) => void;
  pageContent: any;
  setPageContent: (pageContent: any) => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  mobileMenuStatus: boolean;
  setMobileMenuStatus: (mobileMenuStatus: boolean) => void;
  isMobile: boolean;
}

export default function Navbar({
  session,
  language,
  setLanguage,
}: Omit<
  NavbarProps,
  | "darkMode"
  | "setDarkMode"
  | "mobileMenuStatus"
  | "setMobileMenuStatus"
  | "isMobile"
>) {
  const {
    isMobile,
  } = useApp();

  return isMobile ? (
    <MobileNavbar
      language={language}
      setLanguage={setLanguage}
      session={session}
    />
  ) : (
    <DesktopNavbar
      language={language}
      setLanguage={setLanguage}
      session={session}
    />
  );
}
