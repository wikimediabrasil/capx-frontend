'use client';

import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import CakeIcon from '@/public/static/images/cake.svg';
import CakeIconWhite from '@/public/static/images/cake_white.svg';

interface ProfileWikiBirthdaySectionProps {
  readonly wikiBirthday: string | null;
}

export default function ProfileWikiBirthdaySection({
  wikiBirthday,
}: ProfileWikiBirthdaySectionProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  const iconSize = isMobile ? 16 : 42;
  const titleSize = isMobile ? 'text-[14px]' : 'text-[24px]';
  const textSize = isMobile ? 'text-[14px]' : 'text-[24px]';
  const padding = isMobile ? 'px-[10px] py-[6px]' : 'px-3 py-6';

  return (
    <div className={`flex flex-col ${isMobile ? 'gap-2' : 'gap-4'}`}>
      <div className="flex flex-row gap-2 items-center">
        <Image
          src={darkMode ? CakeIconWhite : CakeIcon}
          alt="Cake icon"
          width={iconSize}
          height={iconSize}
          className="object-cover"
        />
        <h2
          className={`font-[Montserrat] ${titleSize} font-bold ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}
        >
          {pageContent['body-profile-birthday-title']}
        </h2>
      </div>
      <div className="w-full">
        <p
          className={`font-[Montserrat] ${textSize} ${padding} rounded-[4px] not-italic font-normal leading-[normal] ${
            darkMode ? 'text-white bg-capx-dark-bg' : 'text-capx-dark-box-bg bg-[#EFEFEF]'
          }`}
        >
          {wikiBirthday || pageContent['loading'] || 'Loading...'}
        </p>
      </div>
    </div>
  );
}
