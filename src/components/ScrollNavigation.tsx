'use client';

import { useApp } from '@/contexts/AppContext';
import ArrowBackIcon from '@/public/static/images/arrow_back_icon.svg';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ScrollNavigationProps {
  children: React.ReactNode;
  className?: string;
  itemWidth?: number;
}

/**
 * Reusable horizontal scroll navigation component
 * Eliminates duplication of scroll logic in CapacityListMainWrapper.tsx
 */
export const ScrollNavigation: React.FC<ScrollNavigationProps> = ({
  children,
  className = '',
  itemWidth = 320,
}) => {
  const { isMobile, pageContent } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Scroll functions for desktop navigation
  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -itemWidth, behavior: 'smooth' });
    }
  }, [itemWidth]);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
    }
  }, [itemWidth]);

  // Update scroll button states
  const updateScrollButtonStates = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const canLeft = scrollLeft > 0;
      const canRight = scrollLeft < scrollWidth - clientWidth - 1;

      setCanScrollLeft(canLeft);
      setCanScrollRight(canRight);
    }
  }, []);

  // Setup scroll event listeners
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      updateScrollButtonStates();
      container.addEventListener('scroll', updateScrollButtonStates);
      return () => container.removeEventListener('scroll', updateScrollButtonStates);
    }
  }, [updateScrollButtonStates]);

  // Setup resize observer
  useEffect(() => {
    if (scrollContainerRef.current) {
      const resizeObserver = new ResizeObserver(updateScrollButtonStates);
      resizeObserver.observe(scrollContainerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [updateScrollButtonStates]);

  // Mobile version - simple horizontal scroll
  if (isMobile) {
    return (
      <div className={`overflow-x-auto scrollbar-hide w-full ${className}`}>
        <div className="flex gap-2 pb-4 w-full min-w-full">{children}</div>
      </div>
    );
  }

  // Desktop version with navigation arrows
  return (
    <div className={`relative ${className}`}>
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute -left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200"
          aria-label={pageContent['capacity-list-scroll-left'] || 'Scroll left'}
        >
          <Image
            src={ArrowBackIcon}
            alt={pageContent['capacity-list-scroll-previous'] || 'Previous'}
            width={24}
            height={24}
            className="text-gray-700"
          />
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute -right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200"
          aria-label={pageContent['capacity-list-scroll-right'] || 'Scroll right'}
        >
          <Image
            src={ArrowBackIcon}
            alt={pageContent['capacity-list-scroll-next'] || 'Next'}
            width={24}
            height={24}
            className="text-gray-700 rotate-180"
          />
        </button>
      )}

      {/* Scroll container */}
      <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide w-full">
        <div className="flex gap-4 pb-4 w-fit">{children}</div>
      </div>
    </div>
  );
};
