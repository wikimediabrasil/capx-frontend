'use client';

import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import ArrowBackIcon from '@/public/static/images/arrow_back_icon.svg';
import info_blue from '@/public/static/images/info_blue.svg';
import Image from 'next/image';
import { Children, useCallback, useEffect, useRef, useState } from 'react';

interface RecommendationCarouselProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  showInfoIcon?: boolean;
  tooltipText?: string;
}

export default function RecommendationCarousel({
  title,
  description,
  children,
  showInfoIcon = true,
  tooltipText,
}: RecommendationCarouselProps) {
  const { pageContent } = useApp();
  const { darkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const childrenArray = Children.toArray(children);
  const totalItems = childrenArray.length;

  const updateScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      // Use passive listener for better performance
      container.addEventListener('scroll', updateScrollButtons, { passive: true });

      // Throttle resize events for better performance
      let resizeTimeout: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateScrollButtons, 100);
      };

      window.addEventListener('resize', handleResize, { passive: true });

      return () => {
        container.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
      };
    }
  }, [updateScrollButtons, totalItems]);

  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      const cardWidth = 300; // Approximate card width + gap
      scrollContainerRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      const cardWidth = 300;
      scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
      setCurrentIndex(prev => Math.min(totalItems - 1, prev + 1));
    }
  }, [totalItems]);

  const goToSlide = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 300;
      scrollContainerRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
      setCurrentIndex(index);
    }
  }, []);

  // Allow rendering even with 0 items (shouldn't happen, but just in case)
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col w-full mb-8">
      <div className="flex items-center justify-start gap-2 mb-4">
        <h2
          className={`text-[14px] font-[Montserrat] font-bold md:text-[32px] ${
            darkMode ? 'text-white' : 'text-capx-dark-box-bg'
          }`}
        >
          {title}
        </h2>
        {showInfoIcon && (
          <div className="relative group z-20">
            <div
              className="relative w-[15px] h-[15px] md:w-[30px] md:h-[30px] cursor-help"
              title={
                tooltipText ||
                pageContent['recommendations-based-on-profile'] ||
                'Based on your profile'
              }
              aria-hidden="true"
            >
              <Image
                src={info_blue}
                alt=""
                fill
                className="object-contain"
                priority
                style={{
                  filter: 'none',
                  opacity: 1,
                  transition: 'none',
                  display: 'block',
                }}
              />
            </div>
            {/* Tooltip for desktop hover and mobile tap */}
            <div
              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 md:w-64 p-2 md:p-3 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible group-active:opacity-100 group-active:visible transition-all duration-200 z-50 pointer-events-none ${
                darkMode
                  ? 'bg-gray-800 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <div className="text-[10px] md:text-xs leading-relaxed text-center">
                {tooltipText ||
                  pageContent['recommendations-based-on-profile'] ||
                  'Based on your profile'}
              </div>
              {/* Arrow */}
              <div
                className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                  darkMode ? 'border-t-gray-800' : 'border-t-white'
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {description && (
        <div className="mb-4">
          <p
            className={`text-[12px] md:text-[16px] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            {description}
          </p>
        </div>
      )}

      <div className="relative w-full">
        <div
          ref={scrollContainerRef}
          className={`flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide scroll-smooth items-stretch ${
            totalItems === 1 ? 'justify-center' : ''
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {childrenArray.map((child, index) => (
            <div
              key={index}
              className={`${totalItems === 1 ? 'flex-shrink' : 'flex-shrink-0'} h-full`}
            >
              {child}
            </div>
          ))}
        </div>

        {totalItems > 1 && (
          <>
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-gray-200 hover:bg-gray-300"
                aria-label="Previous"
              >
                <div className="relative w-6 h-6">
                  <Image src={ArrowBackIcon} alt="" fill className="object-contain" />
                </div>
              </button>
            )}

            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-gray-200 hover:bg-gray-300"
                aria-label="Next"
              >
                <div className="relative w-6 h-6 rotate-180">
                  <Image src={ArrowBackIcon} alt="" fill className="object-contain" />
                </div>
              </button>
            )}

            <div className="flex items-center justify-center gap-3 mt-4">
              {Array.from({ length: totalItems }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`min-w-[12px] min-h-[12px] w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? darkMode
                        ? 'bg-white'
                        : 'bg-[#053749]'
                      : darkMode
                        ? 'bg-gray-500'
                        : 'bg-[#053749] opacity-40'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  {...(index === currentIndex && { 'aria-current': 'true' })}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
