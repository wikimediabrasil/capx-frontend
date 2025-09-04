import BaseButton from '@/components/BaseButton';
import { useApp } from '@/contexts/AppContext';
import { getCapacityColor, getHueRotate } from '@/lib/utils/capacitiesUtils';
import { capitalizeFirstLetter } from '@/lib/utils/stringUtils';
import BarCodeIcon from '@/public/static/images/barcode.svg';
import InfoIcon from '@/public/static/images/info.svg';
import InfoFilledIcon from '@/public/static/images/info_filled.svg';
import ArrowDownIcon from '@/public/static/images/keyboard_arrow_down.svg';
import MetabaseIcon from '@/public/static/images/wikimedia_logo.svg';
import { Capacity } from '@/types/capacity';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

interface CapacityCardProps {
  code: number;
  name: string;
  icon: string;
  color: string;
  parentCapacity?: Capacity;
  onExpand: () => void;
  isExpanded: boolean;
  hasChildren?: boolean;
  description?: string;
  wd_code?: string;
  metabase_code?: string;
  isRoot?: boolean;
  isSearch?: boolean;
  onInfoClick?: (code: number) => Promise<string | undefined>;
  isMobile?: boolean;
  rootColor?: string;
  level?: number;
}

export function CapacityCard({
  code,
  name,
  icon,
  color,
  parentCapacity,
  onExpand,
  isExpanded,
  hasChildren,
  description,
  wd_code,
  metabase_code,
  isRoot,
  isSearch,
  onInfoClick,
  level,
}: CapacityCardProps) {
  const router = useRouter();
  const { isMobile, pageContent, language } = useApp();
  const [showInfo, setShowInfo] = useState(false);
  const childrenContainerRef = useRef<HTMLDivElement>(null);

  // Use the hasChildren prop directly since unified cache handles this logic
  const hasChildrenFromCache = hasChildren;

  // Ensures that names that look like QIDs are replaced
  const displayName = useMemo(() => {
    // Checks if the name looks like a QID (common format with Q followed by numbers)
    if (!name || (name.startsWith('Q') && /^Q\d+$/.test(name))) {
      return `Capacity ${code}`;
    }
    return name;
  }, [name, code]);

  const handleInfoClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click event from propagating to the card
    if (!showInfo && onInfoClick) {
      await onInfoClick(code);
    }
    setShowInfo(!showInfo);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent default behavior to avoid navigation
    e.preventDefault();
    // Only expand/collapse the card
    onExpand();
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    // Allow navigation when clicking on the title
    e.stopPropagation();
    router.push(`/feed?capacityId=${code}`);
  };

  const renderExpandedContent = () => {
    if (!showInfo) return null;

    // Determine the background color of the button
    const getButtonBackgroundColor = () => {
      // For root capacities (level 1), don't try to access bgColorClass
      if (isRoot || level === 1) {
        return getCapacityColor(color || 'technology');
      }

      // For non-root capacities, we can safely check level and other properties

      // For third level (level 3) capacities, try to get root color from parent hierarchy
      if (level === 3) {
        if (parentCapacity?.parentCapacity?.color) {
          return parentCapacity.parentCapacity.color; // Get root color from grandparent
        }
        if (parentCapacity?.color) {
          return parentCapacity.color; // Get color from parent
        }
        return '#507380'; // Fallback dark color
      }

      // For second level capacities (direct children of root)
      if (level === 2 && parentCapacity?.color && parentCapacity.color !== '') {
        return getCapacityColor(parentCapacity.color);
      }

      // If we have our own color
      if (color && color !== '') {
        return getCapacityColor(color);
      }

      // Fallback - always use a color that will be visible
      return '#507380'; // Black fallback
    };

    const buttonBgColor = getButtonBackgroundColor();

    return (
      <div
        className={`flex flex-col gap-6 mt-6 mb-16 ${isRoot ? 'px-3' : 'px-2'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-row items-center gap-6 w-full">
          {metabase_code && metabase_code !== '' && (
            <a
              href={`https://metabase.wikibase.cloud/wiki/Item:${metabase_code}`}
              onClick={e => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              title="Visit the capacity item page on Metabase"
            >
              <div className="flex flex-row items-center gap-2">
                <div className="relative w-[36px] h-[36px]">
                  <Image src={MetabaseIcon} alt="Metabase logo" fill priority />
                </div>
                <p className="text-[20px] text-capx-light-link underline">{metabase_code}</p>
              </div>
            </a>
          )}
          {wd_code && wd_code !== '' && (
            <a
              href={`https://www.wikidata.org/wiki/${wd_code}`}
              onClick={e => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              title="Visit the capacity item page on Wikidata"
            >
              <div className="flex flex-row items-center gap-2">
                <div className="relative w-[36px] h-[36px]">
                  <Image src={BarCodeIcon} alt="BarCode" fill priority />
                </div>
                <p className="text-[20px] text-capx-light-link underline">{wd_code}</p>
              </div>
            </a>
          )}
        </div>
        {description && (
          <p className={`text-capx-dark-box-bg ${isMobile ? 'text-[16px]' : 'text-[20px]'}`}>
            {capitalizeFirstLetter(description)}
          </p>
        )}
        <div
          className="rounded-lg w-fit"
          style={{
            backgroundColor: buttonBgColor,
            display: 'inline-block',
          }}
        >
          <BaseButton
            label={pageContent['capacity-card-explore-capacity'] || 'Explore capacity'}
            customClass={`flex justify-center items-center gap-2 px-3 py-3 text-[#F6F6F6] font-extrabold rounded-[4px] text-center not-italic leading-[normal] ${
              isMobile ? 'text-[16px]' : 'text-[24px]'
            }`}
            onClick={() => router.push(`/feed?capacityId=${code}`)}
          />
        </div>
      </div>
    );
  };

  // Function to determine the color of the capacity name text
  const getNameColor = (
    isRoot: boolean | undefined,
    parentCapacity?: Capacity,
    color?: string
  ): string => {
    // Explicit level check first
    if (level === 3) {
      return '#FFFFFF'; // White text for level 3
    }

    // If it's a root item, always use white
    if (isRoot) return '#FFFFFF';

    // For third level capacities, use white text
    if (
      parentCapacity?.parentCapacity ||
      (parentCapacity && parentCapacity.skill_type !== parentCapacity.code)
    ) {
      return '#FFFFFF'; // White text for level 3
    }

    // For second level with colored background, use white text for contrast
    if (level === 2) {
      return '#FFFFFF'; // White text on colored background
    }

    // If it has a parent, use the parent's color
    if (parentCapacity?.color) {
      return getCapacityColor(parentCapacity.color);
    }

    // Fallback to the passed color
    if (color) {
      return getCapacityColor(color);
    }

    // Default for child capacities without specified color
    return '#4B5563'; // Medium gray
  };

  // Simplified function to determine the correct filter for icons
  const getIconFilter = (isRoot: boolean | undefined, parentCapacity?: Capacity): string => {
    // Explicit level check first
    if (level === 3) {
      return 'brightness(0) invert(1)'; // White icons for level 3
    }

    // If it's root, apply filter to make icon white
    if (isRoot) return 'brightness(0) invert(1)';

    // For third level capacities, make icons white as well (even if root)
    if (
      parentCapacity?.parentCapacity ||
      (parentCapacity && parentCapacity.skill_type !== parentCapacity.code)
    ) {
      return 'brightness(0) invert(1)'; // White icons for level 3
    }

    // For second level with colored background, use white icons for contrast
    if (level === 2) {
      return 'brightness(0) invert(1)'; // White icons on colored background
    }

    // If it has a parent, use the parent's color
    if (parentCapacity?.color) {
      return getHueRotate(parentCapacity.color);
    }

    // Fallback to the passed color
    if (color) {
      return getHueRotate(color);
    }

    // Otherwise, use the default icon color
    return 'brightness(0)'; // This will make the icon black
  };

  type IconSource = string | StaticImageData;
  const renderIcon = (size: number, iconSrc: IconSource) => {
    if (!iconSrc) return null;

    return (
      <div style={{ width: `${size}px`, height: `${size}px` }} className="relative">
        <Image
          src={typeof iconSrc === 'string' ? iconSrc : iconSrc.src}
          alt={name}
          fill
          priority
          style={{
            filter: getIconFilter(isRoot, parentCapacity),
          }}
        />
      </div>
    );
  };

  const renderInfoButton = (size: number, icon: string) => {
    // For grandchild capacities, use the grandparent's color (if it has a parent)
    const filterStyle = getIconFilter(isRoot, parentCapacity);

    return (
      <button
        onClick={handleInfoClick}
        className={`p-1 flex-shrink-0 ${isSearch ? 'mr-12' : ''} opacity-100 z-10`}
        aria-label={pageContent['capacity-card-info'] || 'Information'}
        style={{ visibility: 'visible' }}
      >
        <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
          <Image
            src={showInfo ? InfoFilledIcon : icon}
            alt={name}
            fill
            priority
            style={{
              filter: filterStyle,
              opacity: 1,
            }}
          />
        </div>
      </button>
    );
  };

  const renderArrowButton = (size: number, icon: string) => {
    // For grandchild capacities, use the grandparent's color
    const filterStyle = getIconFilter(isRoot, parentCapacity);

    return (
      <button
        onClick={e => {
          e.stopPropagation();
          onExpand();
        }}
        className="p-2 flex-shrink-0 opacity-100"
      >
        <div
          style={{ width: `${size}px`, height: `${size}px` }}
          className={`relative transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <Image
            src={icon}
            alt={pageContent['capacity-card-expand-capacity'] || 'Expand capacity'}
            fill
            priority
            style={{
              filter: filterStyle,
              opacity: 1,
            }}
          />
        </div>
      </button>
    );
  };

  // Calculate background color inline to avoid scope issues
  const backgroundColor = (() => {
    if (level === 3) {
      // For level 3, try to get root color from parent hierarchy or use fallback
      if (parentCapacity?.parentCapacity?.color) {
        return parentCapacity.parentCapacity.color; // Get root color from grandparent
      }
      if (parentCapacity?.color) {
        return parentCapacity.color; // Get color from parent
      }
      return '#507380'; // Fallback dark color
    }
    if (level === 2 && color) {
      return color; // Exact same color as parent for level 2
    }
    if (level === 2) {
      return '#F6F6F6'; // Fallback light background
    }
    return 'white';
  })();

  if (isSearch) {
    // Search card - sempre renderiza como um card de busca

    // Check if this is a third-level capacity for proper styling
    // Always prioritize the explicit level prop first
    const isThirdLevel = level === 3 || parentCapacity?.parentCapacity !== undefined;

    // Use appropriate background color based on level
    const backgroundColor = isThirdLevel
      ? '#507380' // Black for third level
      : getCapacityColor(parentCapacity?.color || color);

    return (
      <div className="w-full">
        <div
          onClick={handleCardClick}
          className={`flex flex-col w-full shadow-sm hover:shadow-md transition-shadow
          ${isMobile ? 'rounded-[4px]' : 'rounded-lg'}
          cursor-pointer hover:brightness-95 transition-all`}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <div
            className={`flex p-4 ${
              isMobile
                ? 'h-[191px] flex-col mt-12 mx-0 gap-6 md:mx-6'
                : 'flex-row h-[326px] justify-around items-center'
            }`}
          >
            {icon && isMobile ? renderIcon(48, icon) : renderIcon(85, icon)}

            <div className={`flex items-center flex-row ${isMobile ? 'gap-4' : 'gap-16'}`}>
              <div
                className={`flex items-center ${isMobile ? 'flex-1 min-w-0' : 'w-[378px]'} h-full`}
              >
                <Link href={`/feed?capacityId=${code}`}>
                  <h3
                    onClick={handleTitleClick}
                    className={`font-extrabold text-white hover:underline truncate ${
                      isMobile ? 'text-[20px]' : 'text-[48px]'
                    }`}
                  >
                    {capitalizeFirstLetter(name)}
                  </h3>
                </Link>
              </div>

              <div className="flex items-center gap-4">
                {isMobile ? renderInfoButton(24, InfoIcon) : renderInfoButton(68, InfoIcon)}
              </div>
            </div>
          </div>

          {showInfo && (
            <div className="bg-white rounded-b-lg p-8" onClick={e => e.stopPropagation()}>
              {renderExpandedContent()}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isRoot) {
    return (
      <div className="w-full">
        <div
          onClick={handleCardClick}
          className={`flex flex-col w-full shadow-sm hover:shadow-md transition-shadow
          ${isMobile ? 'rounded-[4px]' : 'rounded-lg'}
          cursor-pointer hover:brightness-95 transition-all`}
          style={{
            backgroundColor: getCapacityColor(color),
          }}
        >
          <div
            className={`flex p-4 ${
              isMobile
                ? 'h-[191px] flex-row items-center mx-0 gap-3 md:mx-6'
                : 'flex-row h-[326px] justify-around items-center'
            }`}
          >
            {icon && isMobile ? renderIcon(32, icon) : renderIcon(85, icon)}

            <div
              className={`flex items-center flex-row ${isMobile ? 'gap-2 flex-1 min-w-0' : 'gap-16'}`}
            >
              <div
                className={`flex items-center ${isMobile ? 'flex-1 min-w-0 pl-2' : 'w-[378px] pl-8'} h-full`}
              >
                <Link href={`/feed?capacityId=${code}`}>
                  <h3
                    onClick={handleTitleClick}
                    className={`font-extrabold text-white hover:underline break-words hyphens-auto capacity-name ${
                      isMobile ? 'text-[20px]' : 'text-[48px]'
                    }`}
                    style={{ wordBreak: 'break-word', hyphens: 'auto' }}
                    lang={language || 'en'}
                  >
                    {capitalizeFirstLetter(name)}
                  </h3>
                </Link>
              </div>

              <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-4'}`}>
                {isMobile ? (
                  <>
                    {renderInfoButton(20, InfoIcon)}
                    {hasChildrenFromCache && renderArrowButton(20, ArrowDownIcon)}
                  </>
                ) : (
                  <>
                    {renderInfoButton(68, InfoIcon)}
                    {hasChildrenFromCache && renderArrowButton(68, ArrowDownIcon)}
                  </>
                )}
              </div>
            </div>
          </div>

          {showInfo && (
            <div className="bg-white rounded-b-lg p-8" onClick={e => e.stopPropagation()}>
              {renderExpandedContent()}
            </div>
          )}
        </div>
        {isExpanded && (
          <div
            ref={childrenContainerRef}
            className={`mt-4 ${isMobile ? 'w-full' : 'w-full'} overflow-x-auto scrollbar-hide`}
          >
            <div
              className={`flex flex-nowrap ${isMobile ? 'gap-2' : 'gap-4'} pb-4 ${isMobile ? 'w-full' : ''}`}
            >
              {/* the expanded content will be rendered here by the parent component */}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Child capacity card (non-root)
  return (
    <div className="w-full">
      <div
        onClick={handleCardClick}
        className={`flex flex-col w-full rounded-lg cursor-pointer hover:shadow-md transition-shadow`}
        style={{
          backgroundColor: backgroundColor,
        }}
      >
        <div
          className={`flex flex-row items-center w-full h-[144px] py-4 justify-between gap-4 ${isMobile ? 'px-4' : 'px-12'}`}
        >
          <div className={`flex items-center ${isRoot ? 'gap-12' : 'gap-4'} min-w-0`}>
            {icon && isRoot
              ? renderIcon(48, icon)
              : isMobile
                ? renderIcon(48, icon)
                : renderIcon(68, icon)}
            <div
              className={`flex flex-row items-center justify-between ${
                isRoot && !isMobile ? 'w-max' : ''
              } min-w-0 flex-1`}
            >
              <Link href={`/feed?capacityId=${code}`} className="w-full min-w-0">
                <h3
                  onClick={handleTitleClick}
                  className={`font-extrabold hover:underline ${
                    isRoot
                      ? 'break-words hyphens-auto capacity-name'
                      : isMobile
                        ? 'break-words hyphens-auto capacity-name-mobile'
                        : 'truncate'
                  } ${isMobile ? 'text-[20px]' : 'text-[36px]'}`}
                  style={{
                    color: getNameColor(isRoot, parentCapacity, color),
                    ...(isRoot
                      ? { wordBreak: 'break-word', hyphens: 'auto' }
                      : isMobile && displayName && displayName.length >= 8
                        ? { wordBreak: 'break-word', hyphens: 'auto' }
                        : {}),
                  }}
                  title={capitalizeFirstLetter(displayName)}
                  lang={
                    isRoot || (isMobile && displayName && displayName.length >= 8)
                      ? language || 'en'
                      : undefined
                  }
                >
                  {capitalizeFirstLetter(displayName)}
                </h3>
              </Link>
            </div>
          </div>
          <div
            className={`flex items-center gap-4 ${isMobile ? 'mr-2' : 'mr-4'} z-10 flex-shrink-0`}
          >
            <div className="relative" style={{ zIndex: 10, visibility: 'visible' }}>
              {isRoot || isMobile ? renderInfoButton(24, InfoIcon) : renderInfoButton(40, InfoIcon)}
            </div>

            {hasChildrenFromCache && (
              <div className="relative" style={{ zIndex: 10, visibility: 'visible' }}>
                {isRoot || isMobile
                  ? renderArrowButton(24, ArrowDownIcon)
                  : renderArrowButton(40, ArrowDownIcon)}
              </div>
            )}
          </div>
        </div>
      </div>

      {showInfo && (
        <div className="bg-white rounded-b-lg p-8" onClick={e => e.stopPropagation()}>
          {renderExpandedContent()}
        </div>
      )}
    </div>
  );
}
