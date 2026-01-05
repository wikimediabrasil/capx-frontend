'use client';

import Image, { StaticImageData } from 'next/image';

interface CardItem {
  titleCard: string;
  value: string | number;
}

interface CapacityCardAnalytics {
  title: string;
  icon: StaticImageData;
  iconDarkMode?: StaticImageData;
  headerColor?: string;
  headerTextColor?: string;
  textColor?: string;
  bgCard?: string;
  cards?: CardItem[];
  darkMode?: boolean;
  open?: boolean;
}

export default function CapacityCardAnalytics({
  title,
  icon,
  iconDarkMode,
  headerColor,
  headerTextColor = '#FFFFFF',
  textColor = '#053749',
  bgCard = '#EFEFEF',
  cards = [],
  darkMode = false,
  open = false,
}: CapacityCardAnalytics) {
  if (!open) return null;

  return (
    <div className="flex flex-col">
      {/* Conteúdo */}
      {open && (
        <div className="w-full max-w-4xl mx-auto mt-4">
          {/* Subcabeçalho */}
          <div
            className="p-3 rounded-md flex items-center gap-2 mb-2"
            style={{ backgroundColor: headerColor, color: '#fff' }}
          >
            <Image
              src={darkMode && iconDarkMode ? iconDarkMode : icon}
              alt="Sub Icon"
              width={20}
              height={20}
              className="block md:hidden"
            />
            <Image
              src={darkMode && iconDarkMode ? iconDarkMode : icon}
              alt="Sub Icon"
              width={48}
              height={48}
              className="hidden md:block"
            />
            <h2
              className={'font-[Montserrat] text-[18px] md:text-[24px] font-medium'}
              style={{ color: headerTextColor }}
            >
              {title}
            </h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 gap-4 pt-2 pb-4 rounded-b-md">
            {cards.map((card, idx) => (
              <div
                key={idx}
                className="p-4 rounded shadow flex flex-col items-center"
                style={{ backgroundColor: bgCard }}
              >
                <h2
                  className={`font-[Montserrat] text-[18px] md:text-[24px] font-medium`}
                  style={{ color: textColor }}
                >
                  {card.titleCard}
                </h2>
                <span className="text-3x1 font-bold break-words" 
                  style={{ color: textColor }}>
                  {card.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
