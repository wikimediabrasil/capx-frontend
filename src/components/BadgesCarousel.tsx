'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import { motion, useMotionValue, animate } from 'framer-motion';
import { Badge } from '@/types/badge';
import { useState } from 'react';

interface BadgesCarouselProps {
  badges: Badge[];
  showFullDescription?: boolean;
}

export default function BadgesCarousel({
  badges,
  showFullDescription = false,
}: BadgesCarouselProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calculating the total width needed to show all badges
  const cardWidth = isMobile ? 150 : 180;
  const cardGap = 16; // gap-4 = 16px
  const visibleCards = isMobile ? 2 : 4;
  const totalWidth = badges.length * (cardWidth + cardGap) - visibleCards * (cardWidth + cardGap);
  const maxIndex = Math.max(0, badges.length - visibleCards);

  const x = useMotionValue(0);

  // Update currentIndex when drag ends
  const handleDragEnd = () => {
    const currentX = x.get();
    const index = Math.round(Math.abs(currentX) / (cardWidth + cardGap));
    const newIndex = Math.min(Math.max(0, index), maxIndex);
    setCurrentIndex(newIndex);
    const snapX = -newIndex * (cardWidth + cardGap);
    animate(x, snapX, { duration: 0.2, ease: 'easeOut' });
  };

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    const newX = -newIndex * (cardWidth + cardGap);
    animate(x, newX, { duration: 0.3, ease: 'easeOut' });
  };

  const handleNext = () => {
    const newIndex = Math.min(maxIndex, currentIndex + 1);
    setCurrentIndex(newIndex);
    const newX = -newIndex * (cardWidth + cardGap);
    animate(x, newX, { duration: 0.3, ease: 'easeOut' });
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  return (
    <div className="relative w-full">
      <div className="w-full overflow-hidden px-4">
        <motion.div
          drag="x"
          dragConstraints={{
            left: -totalWidth,
            right: 0,
          }}
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          onDragEnd={handleDragEnd}
          style={{ x }}
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
                  alt={
                    pageContent['alt-badge']?.replace('{badgeName}', badge.name) ||
                    `Badge: ${badge.name}`
                  }
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

      {/* Navigation arrows */}
      {badges.length > visibleCards && (
        <>
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            aria-label="Badge anterior"
            className={`
              absolute left-0 top-1/2 -translate-y-1/2 z-10
              p-2 rounded-full
              transition-all duration-200
              ${
                darkMode
                  ? 'bg-capx-dark-box-bg hover:bg-gray-700 text-white'
                  : 'bg-white hover:bg-gray-100 text-[#053749]'
              }
              ${!canGoPrevious ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg'}
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            aria-label="Próximo badge"
            className={`
              absolute right-0 top-1/2 -translate-y-1/2 z-10
              p-2 rounded-full
              transition-all duration-200
              ${
                darkMode
                  ? 'bg-capx-dark-box-bg hover:bg-gray-700 text-white'
                  : 'bg-white hover:bg-gray-100 text-[#053749]'
              }
              ${!canGoNext ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg'}
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
