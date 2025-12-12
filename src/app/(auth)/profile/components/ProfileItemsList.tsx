'use client';

import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ProfileItemsListProps {
  readonly items: ReadonlyArray<{ readonly id: number | string; readonly label: string }>;
  readonly emptyMessage?: string;
}

export default function ProfileItemsList({ items, emptyMessage }: ProfileItemsListProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const textSize = isMobile ? 'text-[14px]' : 'text-[24px]';

  if (!items || items.length === 0) {
    return (
      <span
        className={`font-[Montserrat] ${textSize} ${darkMode ? 'text-white' : 'text-[#053749]'}`}
      >
        {emptyMessage || pageContent['empty-field']}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className={`rounded-[4px] px-[4px] py-[6px] ${
            darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
          }`}
        >
          <span
            className={`font-[Montserrat] ${textSize} ${darkMode ? 'text-white' : 'text-[#053749]'}`}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
