'use client';

import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';

interface ProfileSimpleFieldProps {
  icon: string;
  title: string;
  value: string;
  emptyText?: string;
}

export default function ProfileSimpleField({
  icon,
  title,
  value,
  emptyText,
}: ProfileSimpleFieldProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  const iconSize = isMobile ? { width: 20, height: 20 } : { width: 48, height: 48 };
  const titleSize = isMobile ? 'text-[14px]' : 'text-[24px]';
  const valueSize = isMobile ? 'text-[14px]' : 'text-[24px]';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 items-center">
        <div className={`relative h-[${iconSize.height}px] w-[${iconSize.width}px]`}>
          <Image src={icon} alt={title || 'Icon'} fill className="object-cover" />
        </div>
        <h2
          className={`font-[Montserrat] ${titleSize} not-italic font-extrabold leading-[normal] ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {title}
        </h2>
      </div>
      <div
        className={`rounded-[4px] inline-flex px-[4px] py-[6px] items-center  ${
          darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
        }`}
      >
        <p
          className={`font-[Montserrat] ${valueSize} not-italic font-normal leading-[normal] ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {value || emptyText || pageContent['empty-field']}
        </p>
      </div>
    </div>
  );
}
