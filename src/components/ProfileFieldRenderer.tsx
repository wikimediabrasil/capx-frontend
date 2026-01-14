'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/stores';
import Image, { StaticImageData } from 'next/image';
import React, { ReactNode } from 'react';

interface ProfileFieldProps {
  icon: StaticImageData | string;
  title: string;
  value?: string | ReactNode;
  children?: ReactNode;
  showEmpty?: boolean;
}

/**
 * Reusable component for rendering profile fields with consistent styling
 * Eliminates duplication in ProfilePage.tsx for different field types
 */
export const ProfileField: React.FC<ProfileFieldProps> = ({
  icon,
  title,
  value,
  children,
  showEmpty = false,
}) => {
  const { darkMode } = useTheme();
  const isMobile = useIsMobile();

  if (!showEmpty && !value && !children) {
    return null;
  }

  const iconSize = isMobile ? 20 : 42;
  const titleSize = isMobile ? 'text-[14px]' : 'text-[24px]';
  const contentSize = isMobile ? 'text-[14px]' : 'text-[24px]';

  return (
    <div className={`flex flex-col ${isMobile ? 'gap-2' : 'gap-4'}`}>
      <div className="flex items-center gap-2">
        <Image src={icon} alt={title} width={iconSize} height={iconSize} className="object-cover" />
        <h2
          className={`font-[Montserrat] ${titleSize} font-bold ${
            darkMode ? 'text-white' : 'text-capx-dark-box-bg'
          }`}
        >
          {title}
        </h2>
      </div>

      {children || (
        <div
          className={`rounded-[4px] px-[4px] py-[6px] ${
            darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
          }`}
        >
          <p
            className={`font-[Montserrat] ${contentSize} font-normal ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}
          >
            {value}
          </p>
        </div>
      )}
    </div>
  );
};

interface ProfileTagListProps {
  items: any[];
  getItemName: (item: any) => string;
}

/**
 * Reusable component for rendering tag lists (languages, territories, affiliations)
 */
export const ProfileTagList: React.FC<ProfileTagListProps> = ({ items, getItemName }) => {
  const { darkMode } = useTheme();
  const isMobile = useIsMobile();

  const contentSize = isMobile ? 'text-[14px]' : 'text-[24px]';

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <div
          key={index}
          className={`rounded-[4px] px-[4px] py-[6px] ${
            darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
          }`}
        >
          <span
            className={`font-[Montserrat] ${contentSize} ${
              darkMode ? 'text-white' : 'text-[#053749]'
            }`}
          >
            {getItemName(item)}
          </span>
        </div>
      ))}
    </div>
  );
};

interface ProfileSimpleFieldProps {
  icon: StaticImageData | string;
  title: string;
  value: string;
}

/**
 * Simplified component for basic profile fields
 */
export const ProfileSimpleField: React.FC<ProfileSimpleFieldProps> = ({ icon, title, value }) => {
  const { darkMode } = useTheme();
  const isMobile = useIsMobile();

  const iconSize = isMobile ? 20 : 48;
  const titleSize = isMobile ? 'text-[14px]' : 'text-[24px]';
  const contentSize = isMobile ? 'text-[14px]' : 'text-[24px]';

  return (
    <div className={`flex flex-col ${isMobile ? 'gap-2' : 'gap-4'}`}>
      <div className="flex items-center gap-2">
        <div className={`relative ${isMobile ? 'h-[20px] w-[20px]' : 'h-[48px] w-[48px]'}`}>
          <Image src={icon} alt={title} fill className="object-cover" />
        </div>
        <h2
          className={`font-[Montserrat] ${titleSize} font-extrabold ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {title}
        </h2>
      </div>
      <div
        className={`rounded-[4px] inline-flex px-[4px] py-[6px] items-center ${
          darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
        }`}
      >
        <p
          className={`font-[Montserrat] ${contentSize} font-normal ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};
