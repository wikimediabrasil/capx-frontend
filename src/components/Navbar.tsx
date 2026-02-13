'use client';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';
import { useIsMobile } from '@/stores';

interface NavbarProps {
  session: any;
  language: string;
  setLanguage: (language: string) => void;
  isMobile: boolean;
}

export default function Navbar({ session, language, setLanguage }: Omit<NavbarProps, 'isMobile'>) {
  const isMobile = useIsMobile();

  return isMobile ? (
    <MobileNavbar language={language} setLanguage={setLanguage} session={session} />
  ) : (
    <DesktopNavbar language={language} setLanguage={setLanguage} session={session} />
  );
}
