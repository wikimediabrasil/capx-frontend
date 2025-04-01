import Image from "next/image";
import Link from "next/link";
import ArrowDownIcon from "@/public/static/images/keyboard_arrow_down.svg";
import { getCapacityColor, getHueRotate } from "@/lib/utils/capacitiesUtils";
import BarCodeIcon from "@/public/static/images/barcode.svg";
import BaseButton from "@/components/BaseButton";
import { useRouter } from "next/navigation";
import InfoIcon from "@/public/static/images/info.svg";
import InfoFilledIcon from "@/public/static/images/info_filled.svg";
import { Capacity } from "@/types/capacity";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";

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
  isRoot?: boolean;
  isSearch?: boolean;
  onInfoClick?: (code: number) => Promise<string | undefined>;
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
  isRoot,
  isSearch,
  onInfoClick,
}: CapacityCardProps) {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(false);
  const { isMobile, pageContent } = useApp();
  const [hasOverflow, setHasOverflow] = useState(false);
  const childrenContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (childrenContainerRef.current) {
      const hasHorizontalOverflow =
        childrenContainerRef.current.scrollWidth >
        childrenContainerRef.current.clientWidth;
      setHasOverflow(hasHorizontalOverflow);
    }
  }, [isExpanded]);

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
    router.push(`/feed/${code}`);
  };

  const renderExpandedContent = () => {
    if (!showInfo) return null;

    let buttonBgColor = "#000000";
    
    if (parentCapacity?.parentCapacity) {
      buttonBgColor = "#4B5563";
    } else if (parentCapacity?.color) {
      buttonBgColor = getCapacityColor(parentCapacity.color);
    } else {
      buttonBgColor = getCapacityColor(color);
    }

    return (
      <div
        className={`flex flex-col gap-6 mt-6 mb-16 ${
          isRoot ? "px-3" : "px-12"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {wd_code && (
          <a
            href={`https://www.wikidata.org/wiki/${wd_code}`}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex flex-row items-center gap-2">
              <div className="relative w-[36px] h-[36px]">
                <Image src={BarCodeIcon} alt="BarCode" fill priority />
              </div>
              <p className="text-[20px] text-capx-light-link underline">
                {wd_code}
              </p>
            </div>
          </a>
        )}
        {description && (
          <p className="text-[20px] text-capx-dark-box-bg">
            {capitalizeFirstLetter(description)}
          </p>
        )}
        <div style={{ backgroundColor: buttonBgColor }} className="rounded-lg">
          <BaseButton
            label={pageContent["capacity-card-explore-capacity"]}
            customClass="w-[224px] flex justify-center items-center gap-2 px-3 py-3 text-[#F6F6F6] font-extrabold text-3.5 sm:text-3.5 rounded-[4px] text-center text-[24px] not-italic leading-[normal]"
            onClick={() => router.push(`/feed?capacityId=${code}`)}
          />
        </div>
      </div>
    );
  };

  const renderIcon = (size: number, iconSrc: any) => {
    if (!iconSrc) return null;

    return (
      <div
        style={{ width: `${size}px`, height: `${size}px` }}
        className="relative"
      >
        <Image
          src={typeof iconSrc === "string" ? iconSrc : iconSrc.src}
          alt={name}
          fill
          priority
          style={{
            filter:
              isRoot || isSearch || parentCapacity?.parentCapacity
                ? "brightness(0) invert(1)"
                : getHueRotate(parentCapacity?.color),
          }}
        />
      </div>
    );
  };

  const renderInfoButton = (size: number, icon: string) => (
    <button
      onClick={handleInfoClick}
      className={`p-1 flex-shrink-0 ${isSearch ? "mr-12" : ""}`}
      aria-label={pageContent["capacity-card-info"]}
    >
      <div
        className="relative"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <Image
          src={showInfo ? InfoFilledIcon : icon}
          alt={name}
          fill
          priority
          style={{
            filter:
              isRoot || isSearch || parentCapacity?.parentCapacity
                ? "brightness(0) invert(1)"
                : getHueRotate(parentCapacity?.color || color),
          }}
        />
      </div>
    </button>
  );

  const renderArrowButton = (size: number, icon: string) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onExpand();
      }}
      className="p-2 flex-shrink-0"
    >
      <div
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`relative transition-transform duration-300 ${
          isExpanded ? "rotate-180" : ""
        }`}
      >
        <Image
          src={icon}
          alt={pageContent["capacity-card-expand-capacity"]}
          fill
          priority
          style={{
            filter:
              isRoot || isSearch || parentCapacity?.parentCapacity
                ? "brightness(0) invert(1)"
                : getHueRotate(parentCapacity?.color),
          }}
        />
      </div>
    </button>
  );

  const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // determine the button color - use the color of the grandparent if available
  const getEffectiveColor = () => {
    if (parentCapacity?.parentCapacity) {
      return "gray-600";
    } else if (parentCapacity?.color) {
      return parentCapacity.color;
    }
    return color;
  };

  if ((isRoot && hasChildren) || isSearch) {
    // root or search card
    const cardColor = getEffectiveColor();

    return (
      <div className="w-full">
        <div
          onClick={handleCardClick}
          className={`flex flex-col w-full ${
            isSearch && !isRoot
              ? `bg-${parentCapacity?.color || cardColor}`
              : `bg-${cardColor}`
          } shadow-sm hover:shadow-md transition-shadow
          ${isMobile ? "rounded-[4px]" : "rounded-lg"}
          cursor-pointer hover:brightness-95 transition-all
          `}
        >
          <div
            className={`flex p-4 ${
              isMobile
                ? "h-[191px] flex-col mt-12 mx-6 gap-6"
                : "flex-row h-[326px] justify-around items-center"
            }`}
          >
            {icon && isMobile ? renderIcon(48, icon) : renderIcon(85, icon)}

            <div
              className={`flex items-center flex-row ${
                isMobile ? "gap-4" : "gap-16"
              }`}
            >
              <div className="flex items-center w-[378px] h-full">
                <Link href={`/feed?capacityId=${code}`}>
                  <h3
                    onClick={handleTitleClick}
                    className={`font-extrabold text-white hover:underline ${
                      isMobile ? "text-[20px]" : "text-[48px]"
                    }`}
                  >
                    {capitalizeFirstLetter(name)}
                  </h3>
                </Link>
              </div>

              {isSearch ? (
                <>
                  {isMobile ? (
                    <>{renderInfoButton(24, InfoIcon)}</>
                  ) : (
                    <>{renderInfoButton(68, InfoIcon)}</>
                  )}
                </>
              ) : (
                <>
                  {isMobile ? (
                    <>
                      {renderInfoButton(24, InfoIcon)}
                      {renderArrowButton(24, ArrowDownIcon)}
                    </>
                  ) : (
                    <>
                      {renderInfoButton(68, InfoIcon)}
                      {renderArrowButton(68, ArrowDownIcon)}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          {showInfo && (
            <div
              className="bg-white rounded-b-lg p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {renderExpandedContent()}
            </div>
          )}
        </div>
        {isExpanded && !isSearch && (
          <div
            ref={childrenContainerRef}
            className="mt-4 w-full overflow-x-auto scrollbar-hide"
          >
            <div className="flex flex-nowrap gap-4 pb-4">
              {/* the expanded content will be rendered here by the parent component */}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        onClick={handleCardClick}
        className={`flex flex-col w-full rounded-lg ${
          parentCapacity?.parentCapacity
            ? "bg-gray-600 text-white"
            : "bg-capx-light-box-bg"
        } cursor-pointer hover:shadow-md transition-shadow`}
      >
        <div className="flex flex-row items-center w-full h-[144px] py-4 justify-between gap-4 px-12">
          <div
            className={`flex items-center gap-4 ${
              isMobile ? "gap-12" : "gap-4"
            }`}
          >
            {icon && isMobile ? renderIcon(48, icon) : renderIcon(68, icon)}
            <div
              className={`flex flex-row items-center justify-between ${
                isMobile ? "w-max" : ""
              }`}
            >
              <Link href={`/feed?capacityId=${code}`} className="w-full">
                <h3
                  onClick={handleTitleClick}
                  className={`font-extrabold hover:underline ${
                    isMobile ? "text-[20px]" : "text-[36px]"
                  } ${parentCapacity?.parentCapacity ? "text-white" : ""}`}
                  style={{
                    color: parentCapacity?.parentCapacity
                      ? "#FFFFFF"
                      : parentCapacity?.color
                      ? getCapacityColor(parentCapacity.color)
                      : "#000000",
                  }}
                >
                  {capitalizeFirstLetter(name)}
                </h3>
              </Link>
            </div>
          </div>
          <div className={`flex items-center gap-4 mr-4`}>
            {isMobile
              ? renderInfoButton(24, InfoIcon)
              : renderInfoButton(40, InfoIcon)}
            {hasChildren &&
              !isRoot &&
              !isSearch &&
              (isMobile
                ? renderArrowButton(24, ArrowDownIcon)
                : renderArrowButton(40, ArrowDownIcon))}
          </div>
        </div>
      </div>
      {showInfo && (
        <div
          className="bg-white rounded-b-lg p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {renderExpandedContent()}
        </div>
      )}
    </div>
  );
}
