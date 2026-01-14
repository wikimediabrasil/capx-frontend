'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/stores';
import Image from 'next/image';
import { ReactNode } from 'react';

interface ProfileFieldSectionProps {
  readonly icon: string;
  readonly iconAlt?: string;
  readonly title: string;
  readonly children: ReactNode;
  readonly iconSize?: { readonly mobile: number; readonly desktop: number };
}

export default function ProfileFieldSection({
  icon,
  iconAlt = 'Icon',
  title,
  children,
  iconSize = { mobile: 20, desktop: 42 },
}: ProfileFieldSectionProps) {
  const { darkMode } = useTheme();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <div className="flex items-center gap-2">
        <Image
          src={icon}
          alt={iconAlt}
          width={isMobile ? iconSize.mobile : iconSize.desktop}
          height={isMobile ? iconSize.mobile : iconSize.desktop}
          className="object-cover"
        />
        <h2
          className={`font-[Montserrat] font-bold ${
            isMobile ? 'text-[14px]' : 'text-[24px]'
          } ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
