'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/types/badge';

interface BadgesCarouselProps {
  badges: Badge[];
  showFullDescription?: boolean;
}

export default function BadgesCarousel({
  badges,
  showFullDescription = false,
}: BadgesCarouselProps) {
  const { darkMode } = useTheme();
  const { isMobile } = useApp();

  // Calculating the total width needed to show all badges
  const cardWidth = isMobile ? 150 : 180;
  const cardGap = 16; // gap-4 = 16px
  const visibleCards = isMobile ? 2 : 4;
  const totalWidth = badges.length * (cardWidth + cardGap) - visibleCards * (cardWidth + cardGap);

  return (
    <div className="w-full overflow-hidden px-4">
      <motion.div
        drag="x"
        dragConstraints={{
          left: -totalWidth,
          right: 0,
        }}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        className="flex gap-4"
      >
        {badges.map(badge => (
          <div
            key={badge.id}
            className={`
              flex-shrink-0 
              w-[150px] md:w-[180px]
              p-4 
              rounded-lg 
              ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-[#F6F6F6]'}
              transition-transform duration-200 
              hover:scale-105
              flex flex-col 
              items-center 
              text-center
            `}
          >
            <div className="relative w-20 h-20 md:w-24 md:h-24 mb-2">
              <Image
                src={badge.picture}
                alt={badge.name}
                fill
                className="object-contain transition-transform duration-200"
              />
            </div>
            <h3
              className={`
              text-sm md:text-base 
              font-bold 
              mt-2 
              text-center 
              ${darkMode ? 'text-white' : 'text-[#053749]'}
            `}
            >
              {badge.name}
            </h3>
            {showFullDescription && (
              <p
                className={`
                text-xs md:text-sm 
                mt-1 
                text-center
                font-medium
                ${darkMode ? 'text-gray-300' : 'text-gray-600'}
            `}
              >
                {badge.description}
              </p>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
