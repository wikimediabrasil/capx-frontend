'use client';

import Banner from '@/components/Banner';
import NavBarMessagePage from './NavBar';
import MessageBanner from '@/public/static/images/message_banner.svg';
import { useApp } from '@/contexts/AppContext';

export default function MessagePage() {
  const { pageContent } = useApp();

  return (
    <section className="w-full flex flex-col min-h-screen gap-4 pt-24 md:pt-8 mx-auto md:max-w-[1200px]">
      <Banner
        image={MessageBanner}
        title={pageContent['message-banner-page']}
        alt={pageContent['message-alt-banner']}
      />
      <NavBarMessagePage />
    </section>
  );
}
