import Image from "next/image";
import Link from "next/link";
import ArrowDownIcon from "@/public/static/images/keyboard_arrow_down.svg";
import { getCapacityColor, getHueRotate } from "@/lib/utils/capacitiesUtils";
import BarCodeIcon from "@/public/static/images/barcode.svg";
import BaseButton from "@/components/BaseButton";
import { useRouter, useSearchParams } from "next/navigation";
import InfoIcon from "@/public/static/images/info.svg";
import InfoFilledIcon from "@/public/static/images/info_filled.svg";
import { Capacity } from "@/types/capacity";
import { useState, useRef, useEffect, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { useCapacityCache } from "@/contexts/CapacityCacheContext";

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
  metabase_code,
  onInfoClick,
}: CapacityCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, pageContent } = useApp();
  const { hasChildren: useCapacityCacheHasChildren } = useCapacityCache();
  const [showInfo, setShowInfo] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const childrenContainerRef = useRef<HTMLDivElement>(null);

  const hasChildrenFromCache = useCapacityCacheHasChildren(code);

  // Ensures that names that look like QIDs are replaced
  const displayName = useMemo(() => {
    // Checks if the name looks like a QID (common format with Q followed by numbers)
    if (!name || (name.startsWith("Q") && /^Q\d+$/.test(name))) {
      return `Capacity ${code}`;
    }
    return name;
  }, [name, code]);

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
    router.push(`/feed?capacityId=${code}`);
  };

  const renderExpandedContent = () => {
    if (!showInfo) return null;

    // Determinar a cor de fundo do botão
    const getButtonBackgroundColor = () => {
      if (parentCapacity?.parentCapacity) {
        return "#4B5563"; // Cor de fundo para cards netos
      }
      if (parentCapacity?.color) {
        return getCapacityColor(parentCapacity.color);
      }
      return getCapacityColor(color);
    };

    const buttonBgColor = getButtonBackgroundColor();

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
        <div
          className="rounded-lg w-fit"
          style={{
            backgroundColor: buttonBgColor,
            display: "inline-block",
          }}
        >
          <BaseButton
            label={pageContent["capacity-card-explore-capacity"]}
            customClass="w-[224px] flex justify-center items-center gap-2 px-3 py-3 text-[#F6F6F6] font-extrabold text-3.5 sm:text-3.5 rounded-[4px] text-center text-[24px] not-italic leading-[normal]"
            onClick={() => router.push(`/feed?capacityId=${code}`)}
          />
        </div>
      </div>
    );
  };

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

  // Função para garantir que a cor correta seja usada, independente se é string ou código hexadecimal
  const ensureColorIsApplied = (
    color: string,
    parentCapacity?: Capacity
  ): string => {
    if (!color) return "#000000"; // Fallback para preto

    // Se tiver um parentCapacity, use a cor dele
    if (parentCapacity?.color) {
      return getCapacityColor(parentCapacity.color);
    }

    // Caso contrário, use a cor fornecida
    return getCapacityColor(color);
  };

  // Função para determinar a cor do texto do nome da capacidade
  const getNameColor = (
    isRoot: boolean | undefined,
    parentCapacity?: Capacity,
    color?: string
  ): string => {
    // Se for um item root, usar sua própria cor
    if (isRoot) return getCapacityColor(color || "black");

    // Se tiver um ancestral (avô), usar a cor do avô (para capacidade neta)
    if (parentCapacity?.parentCapacity?.color) {
      return getCapacityColor(parentCapacity.parentCapacity.color);
    }

    // Se tiver um pai, usar a cor do pai
    if (parentCapacity?.color) {
      return getCapacityColor(parentCapacity.color);
    }

    // If we have a color but no parent (e.g., in search results)
    if (color) {
      return getCapacityColor(color);
    }

    // Default for child capacities without specified color
    return "#4B5563"; // A medium gray color
  };

  // Função simplificada para determinar o filtro correto para ícones
  const getIconFilter = (
    isRoot: boolean | undefined,
    parentCapacity?: Capacity
  ): string => {
    // Se for root, aplicar filtro que deixa ícone branco
    if (isRoot) return "brightness(0) invert(1)";

    // Se for uma capacidade neta, herdar a cor do avô
    if (parentCapacity?.parentCapacity) {
      const grandparentColor = parentCapacity.parentCapacity.color;
      if (grandparentColor) {
        return getHueRotate(grandparentColor);
      }
    }

    // Se tiver pai, usar cor do pai
    if (parentCapacity?.color) {
      return getHueRotate(parentCapacity.color);
    }

    // Caso contrário, usar a cor padrão do ícone
    return "brightness(0)"; // Isso fará o ícone ficar preto
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
            filter: getIconFilter(isRoot, parentCapacity),
          }}
        />
      </div>
    );
  };

  const renderInfoButton = (size: number, icon: string) => {
    // For grandchild capacities, use the grandparent's color
    const filterStyle = getIconFilter(isRoot, parentCapacity);

    return (
      <button
        onClick={handleInfoClick}
        className={`p-1 flex-shrink-0 ${
          isSearch ? "mr-12" : ""
        } opacity-100 z-10`}
        aria-label={pageContent["capacity-card-info"]}
        style={{ visibility: "visible" }}
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
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className="p-2 flex-shrink-0 opacity-100"
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
              filter: filterStyle,
              opacity: 1,
            }}
          />
        </div>
      </button>
    );
  };

  if (isSearch) {
    // Search card - sempre renderiza como um card de busca
    const cardColor = getEffectiveColor();

    return (
      <div className="w-full">
        <div
          onClick={handleCardClick}
          className={`flex flex-col w-full shadow-sm hover:shadow-md transition-shadow
          ${isMobile ? "rounded-[4px]" : "rounded-lg"}
          cursor-pointer hover:brightness-95 transition-all`}
          style={{
            backgroundColor: getCapacityColor(
              parentCapacity?.color || cardColor
            ),
          }}
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

              <div className="flex items-center gap-4">
                {isMobile
                  ? renderInfoButton(24, InfoIcon)
                  : renderInfoButton(68, InfoIcon)}
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
      </div>
    );
  }

  if (isRoot && hasChildren) {
    // Root card with children
    const cardColor = getEffectiveColor();

    return (
      <div className="w-full">
        <div
          onClick={handleCardClick}
          className={`flex flex-col w-full shadow-sm hover:shadow-md transition-shadow
          ${isMobile ? "rounded-[4px]" : "rounded-lg"}
          cursor-pointer hover:brightness-95 transition-all`}
          style={{
            backgroundColor: getCapacityColor(color),
          }}
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

              <div className="flex items-center gap-4">
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
        {isExpanded && (
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

  // Child capacity card (non-root)
  const getBgColorClass = (): string => {
    // Third level (grandchild) - Always use gray background
    if (parentCapacity?.parentCapacity) {
      return "bg-gray-600";
    }

    // Second level (direct child of root) - Use light background
    return "bg-capx-light-box-bg";
  };

  const getTextColorClass = (): string => {
    // Third level (grandchild) - Use white text
    if (parentCapacity?.parentCapacity) {
      return "text-white";
    }

    // Other levels - Let the getNameColor function handle it
    return "";
  };

  const bgColorClass = getBgColorClass();
  const textColorClass = getTextColorClass();

  return (
    <div className="w-full">
      <div
        onClick={handleCardClick}
        className={`flex flex-col w-full rounded-lg ${bgColorClass} cursor-pointer hover:shadow-md transition-shadow`}
      >
        <div className="flex flex-row items-center w-full h-[144px] py-4 justify-between gap-4 px-12">
          <div
            className={`flex items-center ${
              isRoot ? "gap-12" : "gap-4"
            } min-w-0`}
          >
            {icon && isRoot
              ? renderIcon(48, icon)
              : isMobile
              ? renderIcon(48, icon)
              : renderIcon(68, icon)}
            <div
              className={`flex flex-row items-center justify-between ${
                isRoot ? "w-max" : ""
              } min-w-0 flex-1`}
            >
              <Link
                href={`/feed?capacityId=${code}`}
                className="w-full min-w-0"
              >
                <h3
                  onClick={handleTitleClick}
                  className={`font-extrabold hover:underline truncate ${
                    isMobile ? "text-[20px]" : "text-[36px]"
                  }
                  `}
                  style={{
                    color: getNameColor(isRoot, parentCapacity, color),
                  }}
                  title={capitalizeFirstLetter(displayName)}
                >
                  {capitalizeFirstLetter(displayName)}
                </h3>
              </Link>
            </div>
          </div>
          <div className={`flex items-center gap-4 mr-4 z-10 flex-shrink-0`}>
            <div
              className="relative"
              style={{ zIndex: 10, visibility: "visible" }}
            >
              {isRoot
                ? renderInfoButton(24, InfoIcon)
                : isMobile
                ? renderInfoButton(24, InfoIcon)
                : renderInfoButton(40, InfoIcon)}
            </div>

            {hasChildrenFromCache && (
              <div
                className="relative"
                style={{ zIndex: 10, visibility: "visible" }}
              >
                {isRoot
                  ? renderArrowButton(24, ArrowDownIcon)
                  : isMobile
                  ? renderArrowButton(24, ArrowDownIcon)
                  : renderArrowButton(40, ArrowDownIcon)}
              </div>
            )}
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
