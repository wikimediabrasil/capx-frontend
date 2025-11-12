'use client';

import { useState, useRef, useEffect, Children } from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import info_blue from '@/public/static/images/info_blue.svg';
import ArrowBackIcon from '@/public/static/images/arrow_back_icon.svg';
import ArrowBackIconWhite from '@/public/static/images/arrow_back_icon_white.svg';

interface RecommendationCarouselProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  showInfoIcon?: boolean;
}

export default function RecommendationCarousel({
  title,
  description,
  children,
  showInfoIcon = true,
}: RecommendationCarouselProps) {
  const { pageContent } = useApp();
  const { darkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const childrenArray = Children.toArray(children);
  const totalItems = childrenArray.length;

  console.log('RecommendationCarousel - title:', title, 'totalItems:', totalItems);

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);
      return () => {
        container.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, [children]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 300; // Approximate card width + gap
      scrollContainerRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 300;
      scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
      setCurrentIndex(prev => Math.min(totalItems - 1, prev + 1));
    }
  };

  const goToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 300;
      scrollContainerRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
      setCurrentIndex(index);
    }
  };

  if (totalItems === 0) {
    console.log('RecommendationCarousel - No items to display for:', title);
    return null;
  }

  console.log('RecommendationCarousel - Rendering carousel for:', title, 'with', totalItems, 'items');

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
          <div className="relative group">
            <div 
              className="relative w-[15px] h-[15px] md:w-[30px] md:h-[30px] cursor-help"
              title={pageContent['recommendations-based-on-profile'] || 'Based on your profile'}
            >
              <Image src={info_blue} alt="" fill className="object-contain" priority />
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
                {pageContent['recommendations-based-on-profile'] || 'Based on your profile'}
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
          <p className={`text-[12px] md:text-[16px] ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>{description}</p>
        </div>
      )}

      <div className="relative w-full">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth items-stretch"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {childrenArray.map((child, index) => (
            <div key={index} className="flex-shrink-0 h-full">
              {child}
            </div>
          ))}
        </div>

        {totalItems > 1 && (
          <>
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label="Previous"
              >
                <div className="relative w-6 h-6">
                  <Image 
                    src={darkMode ? ArrowBackIconWhite : ArrowBackIcon} 
                    alt="" 
                    fill 
                    className="object-contain" 
                  />
                </div>
              </button>
            )}

            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#053749] hover:bg-[#04222F] flex items-center justify-center transition-all"
                aria-label="Next"
              >
                <div className="relative w-6 h-6 rotate-180">
                  <Image
                    src={ArrowBackIconWhite}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
              </button>
            )}

            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: totalItems }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-[#053749]' 
                      : darkMode 
                        ? 'bg-gray-600' 
                        : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

