import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

import ArrowDownIcon from '@/public/static/images/arrow_drop_down_circle.svg';
import ArrowDownIconWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';

const CAPACITY_STYLES = {
  known: {
    backgroundColor: 'bg-[#0070B9]',
    textColor: 'text-white',
  },
  available: {
    backgroundColor: 'bg-[#05A300]',
    textColor: 'text-white',
  },
  wanted: {
    backgroundColor: 'bg-[#D43831]',
    textColor: 'text-white',
  },
  default: {
    backgroundColor: 'bg-[#EFEFEF]',
    textColor: 'text-black',
  },
} as const;

// Fallback names to use if getItemName returns "loading" for too long
const FALLBACK_NAMES = {
  '69': 'Strategic Thinking',
  '71': 'Team Leadership',
  '97': 'Project Management',
  '10': 'Organizational Skills',
  '36': 'Communication',
  '50': 'Learning',
  '56': 'Community Building',
  '65': 'Social Skills',
  '74': 'Strategic Planning',
  '106': 'Technology',
};

interface ProfileItemProps {
  icon: string;
  title: string;
  items: (number | string)[];
  showEmptyDataText?: boolean;
  customClass?: string;
  getItemName: (id: string | number) => string;
}

export function ProfileItem({
  icon,
  title,
  items,
  showEmptyDataText = true,
  customClass = '',
  getItemName,
}: ProfileItemProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [needsToggle, setNeedsToggle] = useState(false);
  const noDataMessage = pageContent['empty-field'];
  const [localNames, setLocalNames] = useState<{ [key: string]: string }>({});
  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Set up local names state with fallbacks after timeout
  useEffect(() => {
    // Clear any existing timeouts when items change
    Object.values(timeoutRefs.current).forEach(timeout => {
      clearTimeout(timeout);
    });
    timeoutRefs.current = {};

    // Reset local names
    setLocalNames({});

    // Set up new timeouts for each item
    if (items && items.length > 0) {
      items.forEach(id => {
        const idStr = id.toString();
        const name = getItemName(id);

        // If name is already available, use it immediately
        if (name !== 'loading' && name !== pageContent['loading']) {
          setLocalNames(prev => ({ ...prev, [idStr]: name }));
          return;
        }

        // Otherwise, set a timeout to use fallback
        timeoutRefs.current[idStr] = setTimeout(() => {
          // After timeout, check if we have a real name now
          const currentName = getItemName(id);
          if (currentName !== 'loading' && currentName !== pageContent['loading']) {
            setLocalNames(prev => ({ ...prev, [idStr]: currentName }));
          } else {
            // Use fallback name if available, otherwise keep the generic one
            const fallbackName = FALLBACK_NAMES[idStr] || `Capacity ${id}`;
            setLocalNames(prev => ({ ...prev, [idStr]: fallbackName }));
          }
        }, 1500); // 1.5 second timeout before fallback
      });
    }

    return () => {
      // Clean up timeouts
      Object.values(timeoutRefs.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [items, getItemName, pageContent]);

  // Check items overflow to show or hide expand button
  useEffect(() => {
    const checkOverflow = () => {
      const container = containerRef.current;
      if (!container || items.length === 0) return;

      container.style.height = 'auto';
      container.style.overflow = 'visible';

      const naturalHeight = container.getBoundingClientRect().height;
      const firstItem = container.querySelector('.capacity-item');
      const singleLineHeight = firstItem ? firstItem.getBoundingClientRect().height : 0;

      container.style.removeProperty('height');
      container.style.removeProperty('overflow');

      const tolerance = 10;
      setNeedsToggle(naturalHeight > singleLineHeight + tolerance);
    };

    const timer = setTimeout(checkOverflow, 0);
    window.addEventListener('resize', checkOverflow);
    const secondTimer = setTimeout(checkOverflow, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(secondTimer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [items]);

  if (!showEmptyDataText && items.length == 0) return null;

  const getCapacityStyle = (title: string) => {
    if (title === pageContent['body-profile-known-capacities-title']) {
      return CAPACITY_STYLES.known;
    }
    if (title === pageContent['body-profile-available-capacities-title']) {
      return CAPACITY_STYLES.available;
    }
    if (title === pageContent['body-profile-wanted-capacities-title']) {
      return CAPACITY_STYLES.wanted;
    }
    return CAPACITY_STYLES.default;
  };

  // Get the display name for an item
  const getDisplayName = (id: number | string) => {
    const idStr = id.toString();

    // First check local names state
    if (localNames[idStr]) {
      // Verify it's not a URL
      if (
        typeof localNames[idStr] === 'string' &&
        (localNames[idStr].startsWith('https://') || localNames[idStr].includes('entity/Q'))
      ) {
        return FALLBACK_NAMES[idStr] || `Capacity ${id}`;
      }
      return localNames[idStr];
    }

    // Then try getItemName function
    const name = getItemName(id);

    // Filter out URLs
    if (typeof name === 'string' && (name.startsWith('https://') || name.includes('entity/Q'))) {
      return FALLBACK_NAMES[idStr] || `Capacity ${id}`;
    }

    if (name !== 'loading' && name !== pageContent['loading']) {
      return name;
    }

    // Fall back to hardcoded names as last resort
    return FALLBACK_NAMES[idStr] || `Capacity ${id}`;
  };

  const capacityStyle = getCapacityStyle(title);

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative h-5 w-5 md:h-[42px] md:w-[42px]">
            <Image src={icon} alt={`${title} icon`} className="object-contain" fill />
          </div>
          <h2
            className={`${customClass} font-extrabold text-base md:text-[24px]
            ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}
            `}
          >
            {title}
          </h2>
        </div>
      </div>

      {/* Items */}
      <div
        className={`
          flex justify-between items-center
          ${darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'}
          rounded-[4px]
          p-3
          md:py-6
          md:px-3
        `}
      >
        {/* Items Container */}
        <div
          ref={containerRef}
          className={`
            flex flex-wrap gap-2 flex-1
            ${!isExpanded && needsToggle ? 'max-h-[38px] overflow-hidden' : ''}
            transition-all duration-300
          `}
        >
          {items.length > 0
            ? items.map((item, index) => {
                const name = getDisplayName(item);
                return (
                  <div
                    key={index}
                    className={`capacity-item rounded-[8px] inline-flex px-[4px] py-[6px] items-center gap-[8px] ${capacityStyle.backgroundColor} ${capacityStyle.textColor}
                `}
                  >
                    <p
                      className={`font-normal text-sm md:text-[24px] p-1 ${capacityStyle.textColor}`}
                    >
                      {name}
                    </p>
                  </div>
                );
              })
            : showEmptyDataText && (
                <p
                  className={`
            ${customClass}
            font-normal
            text-sm
            md:text-[24px]            
          `}
                >
                  {noDataMessage}
                </p>
              )}
        </div>

        {/* Expand/hide button */}
        {needsToggle && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Show less' : 'Show more'}
            className="ml-2 self-start"
          >
            <Image
              src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
              alt={`${title} icon`}
              className={`object-contain ${isExpanded ? 'rotate-180' : ''}`}
              height={20}
              width={20}
            />
          </button>
        )}
      </div>
    </div>
  );
}
