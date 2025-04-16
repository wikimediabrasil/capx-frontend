import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "@/contexts/ThemeContext";
import { useCapacityList } from "@/hooks/useCapacityList";
import { Capacity } from "@/types/capacity";
import React from "react";
import BaseButton from "@/components/BaseButton";
import { useApp } from "@/contexts/AppContext";
import Image from "next/image";
import ArrowDownIcon from "@/public/static/images/keyboard_arrow_down.svg";
import { getHueRotate } from "@/lib/utils/capacitiesUtils";
import InfoIcon from "@/public/static/images/info.svg";
import InfoFilledIcon from "@/public/static/images/info_filled.svg";
import Link from "next/link";
import LinkIcon from "@/public/static/images/link_icon.svg";
import LinkIconWhite from "@/public/static/images/link_icon_white.svg";

interface CapacitySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (capacity: Capacity) => void;
  title: string;
}

export default function CapacitySelectionModal({
  isOpen,
  onClose,
  onSelect,
  title,
}: CapacitySelectionModalProps) {
  const { darkMode } = useTheme();
  const { data: session } = useSession();
  const { pageContent } = useApp();
  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [selectedCapacity, setSelectedCapacity] = useState<Capacity | null>(
    null
  );
  const [showInfoMap, setShowInfoMap] = useState<Record<number, boolean>>({});
  const [capacityDescriptions, setCapacityDescriptions] = useState<
    Record<string, string>
  >({});

  const {
    rootCapacities,
    childrenCapacities,
    isLoading,
    fetchRootCapacities,
    fetchCapacitiesByParent,
    descriptions,
    wdCodes,
    fetchCapacityDescription,
  } = useCapacityList(session?.user?.token);

  useEffect(() => {
    if (isOpen && session?.user?.token) {
      // Usar um try/catch para evitar que erros interrompam o fluxo
      try {
        fetchRootCapacities().catch(err => {
          console.error("Erro ao carregar capacidades raiz:", err);
          // Continue mesmo com erro
        });
        setSelectedPath([]);
        setSelectedCapacity(null);
      } catch (error) {
        console.error("Erro na inicialização do modal:", error);
      }
    }
  }, [isOpen, session?.user?.token, fetchRootCapacities]);

  const handleCategorySelect = async (category: Capacity) => {
    try {
      const categoryId = category.code;

      // Always set the selected capacity, regardless of whether it has children
      setSelectedCapacity(category);

      // If this category is already in the path, we don't need to do anything else
      const currentPathIndex = selectedPath.indexOf(categoryId);
      if (currentPathIndex !== -1) {
        return;
      }
    } catch (err) {
      console.error("Erro ao selecionar categoria:", err);
      // Continue mesmo com erro
    }
  };

  // Function to handle expansion separately
  const handleCategoryExpand = async (
    e: React.MouseEvent,
    category: Capacity
  ) => {
    e.stopPropagation(); // Prevent selection when expanding

    try {
      const categoryId = category.code;
      const currentPathIndex = selectedPath.indexOf(categoryId);

      if (currentPathIndex !== -1) {
        // If already in path, collapse it
        setSelectedPath((prev) => prev.slice(0, currentPathIndex + 1));
        return;
      }

      // Check if we need to fetch children
      if (!childrenCapacities[categoryId.toString()]) {
        try {
          const children = await fetchCapacitiesByParent(categoryId.toString());

          if (children && children.length > 0) {
            setSelectedPath((prev) => [...prev, categoryId]);
          }
        } catch (error) {
          console.error(`Erro ao buscar filhos para categoria ${categoryId}:`, error);
          // Continue mesmo com erro
        }
        return;
      }

      // If it has children, expand it
      if (childrenCapacities[categoryId.toString()]?.length > 0) {
        setSelectedPath((prev) => [...prev, categoryId]);
      }
    } catch (err) {
      console.error("Erro ao expandir categoria:", err);
      // Continue mesmo com erro
    }
  };

  const handleConfirm = () => {
    if (selectedCapacity) {
      const capacityToReturn: Capacity = {
        ...selectedCapacity,
        skill_type:
          selectedPath.length > 0
            ? selectedPath[selectedPath.length - 1]
            : selectedCapacity.code,
      };
      onSelect(capacityToReturn);
      onClose();
    }
  };

  const getCurrentCapacities = useCallback(() => {
    if (selectedPath.length === 0) {
      return rootCapacities;
    }

    const currentParentId = selectedPath[selectedPath.length - 1];
    const currentCapacities = childrenCapacities[currentParentId.toString()];

    if (!currentCapacities) {
      return [];
    }

    return currentCapacities;
  }, [selectedPath, childrenCapacities, rootCapacities]);

  // Function to find the capacity by code
  const findCapacityByCode = useCallback(
    (code: number): Capacity | undefined => {
      // Search in the root capacities
      const rootCapacity = rootCapacities.find((cap) => cap.code === code);
      if (rootCapacity) return rootCapacity;

      // Search in the children capacities
      for (const parentCode in childrenCapacities) {
        const children = childrenCapacities[parentCode];
        const childCapacity = children?.find((cap) => cap.code === code);
        if (childCapacity) return childCapacity;
      }

      return undefined;
    },
    [rootCapacities, childrenCapacities]
  );

  // Function to capitalize the first letter of a text
  const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Function to toggle the display of the capacity description
  const toggleCapacityInfo = async (
    e: React.MouseEvent,
    capacity: Capacity
  ) => {
    e.stopPropagation(); // Prevent the click event from propagating to the card

    try {
      const capacityCode = capacity.code;

      // Se já temos a descrição no cache local, usar ela
      if (capacityDescriptions[capacityCode]) {
        setShowInfoMap((prev) => ({
          ...prev,
          [capacityCode]: !prev[capacityCode],
        }));
        return;
      }

      // Se temos a descrição no cache global, copiar para o cache local
      if (descriptions[capacityCode.toString()]) {
        setCapacityDescriptions((prev) => ({
          ...prev,
          [capacityCode]: descriptions[capacityCode.toString()],
        }));
        setShowInfoMap((prev) => ({
          ...prev,
          [capacityCode]: !prev[capacityCode],
        }));
        return;
      }

      // Se não temos a descrição em nenhum lugar, buscar
      if (fetchCapacityDescription) {
        try {
          const description = await fetchCapacityDescription(capacityCode);
          // description pode ser string vazia em caso de erro
          setCapacityDescriptions((prev) => ({
            ...prev,
            [capacityCode]: description || "",
          }));
        } catch (error) {
          console.error(`Erro ao buscar descrição para capacidade ${capacityCode}:`, error);
          // Continue mesmo com erro
        }
      }

      // Toggle the display of the description regardless of fetch success
      setShowInfoMap((prev) => ({
        ...prev,
        [capacityCode]: !prev[capacityCode],
      }));
    } catch (error) {
      console.error("Erro ao alternar informações da capacidade:", error);
      // Continue mesmo com erro
    }
  };

  // Function to render a custom capacity card for the modal
  const renderCapacityCard = (capacity: Capacity, isRoot: boolean) => {
    const isSelected = selectedCapacity?.code === capacity.code;
    const showInfo = showInfoMap[capacity.code] || false;
    const description =
      capacityDescriptions[capacity.code] ||
      descriptions[capacity.code.toString()] ||
      "";
    const wd_code = wdCodes[capacity.code.toString()] || "";

    // Get the parent capacity to color the icons of the child cards
    const parentCapacity = isRoot
      ? undefined
      : selectedPath.length > 0
      ? findCapacityByCode(selectedPath[selectedPath.length - 1])
      : undefined;

    // Style for root cards (simplified for the modal)
    if (isRoot) {
      return (
        <div
          className={`flex flex-col w-full bg-${
            capacity.color
          } rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden h-full
            ${
              isSelected ? "ring-2 ring-capx-primary-green" : ""
            } hover:brightness-90 transform hover:scale-[1.01] transition-all`}
          onClick={() => handleCategorySelect(capacity)}
        >
          <div className="flex p-3 h-[80px] items-center justify-between">
            {capacity.icon && (
              <div className="relative w-[24px] h-[24px] flex-shrink-0 mr-2">
                <Image
                  src={capacity.icon}
                  alt={capacity.name}
                  width={24}
                  height={24}
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </div>
            )}
            <div className="flex-1 mx-2 overflow-hidden">
              <Link
                href={`/feed?capacityId=${capacity.code}`}
                onClick={(e) => e.stopPropagation()}
                title={pageContent["capacity-selection-modal-hover-view-capacity-feed"]}
                className={`text-white font-bold text-base truncate hover:underline hover:text-yellow-200 transition-colors cursor-pointer block overflow-hidden text-ellipsis whitespace-nowrap flex items-center`}
              >
                {capitalizeFirstLetter(capacity.name)}
                <Image
                  src={LinkIconWhite}
                  alt="External link icon"
                  width={16}
                  height={16}
                  className="ml-1 inline-block"
                />
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={(e) => toggleCapacityInfo(e, capacity)}
                className="p-1 flex-shrink-0 mr-1"
                aria-label="Info"
              >
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={showInfo ? InfoFilledIcon : InfoIcon}
                    alt="Info"
                    width={20}
                    height={20}
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                </div>
              </button>
              {capacity.hasChildren && (
                <button
                  onClick={(e) => handleCategoryExpand(e, capacity)}
                  className="p-1 flex-shrink-0"
                  aria-label="Expand"
                >
                  <div className="relative w-[20px] h-[20px]">
                    <Image
                      src={ArrowDownIcon}
                      alt="Expand"
                      width={20}
                      height={20}
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                  </div>
                </button>
              )}
            </div>
          </div>

          {showInfo && description && (
            <div
              className="bg-white p-3 text-sm rounded-b-lg flex-grow"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-gray-700 text-xs leading-relaxed">
                {capitalizeFirstLetter(description)}
              </p>
              {wd_code && (
                <a
                  href={wd_code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline hover:text-blue-700 mt-2 inline-block text-xs transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {pageContent["capacity-selection-modal-see-more-information"]}
                </a>
              )}
            </div>
          )}
        </div>
      );
    }

    // Style for child cards
    return (
      <div
        className={`flex flex-col w-full bg-capx-light-box-bg rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden h-full
          ${isSelected ? "ring-2 ring-capx-primary-green" : ""} hover:bg-gray-200 transform hover:scale-[1.01] transition-all`}
        onClick={() => handleCategorySelect(capacity)}
      >
        <div className="flex p-3 h-[80px] items-center justify-between">
          {capacity.icon && (
            <div className="relative w-[24px] h-[24px] flex-shrink-0 mr-2">
              <Image
                src={capacity.icon}
                alt={capacity.name}
                width={24}
                height={24}
                style={{
                  filter: parentCapacity
                    ? getHueRotate(parentCapacity.color)
                    : "",
                }}
              />
            </div>
          )}
          <div className="flex-1 mx-2 overflow-hidden">
            <Link
              href={`/feed?capacityId=${capacity.code}`}
              onClick={(e) => e.stopPropagation()}
              className={`text-gray-700 font-bold text-base truncate hover:underline hover:text-blue-700 transition-colors cursor-pointer block overflow-hidden text-ellipsis whitespace-nowrap flex items-center`}
            >
              {capitalizeFirstLetter(capacity.name)}
              <Image
                src={LinkIcon}
                alt="External link icon"
                width={16}
                height={16}
                className="ml-1 inline-block"
              />
            </Link>
          </div>
          <div className="flex items-center">
            <button
              onClick={(e) => toggleCapacityInfo(e, capacity)}
              className="p-1 flex-shrink-0 mr-1"
              aria-label="Info"
            >
              <div className="relative w-[20px] h-[20px]">
                <Image
                  src={showInfo ? InfoFilledIcon : InfoIcon}
                  alt="Info"
                  width={20}
                  height={20}
                  style={{
                    filter: parentCapacity
                      ? getHueRotate(parentCapacity.color)
                      : "",
                  }}
                />
              </div>
            </button>
            {capacity.hasChildren && (
              <button
                onClick={(e) => handleCategoryExpand(e, capacity)}
                className="p-1 flex-shrink-0"
                aria-label="Expand"
              >
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={ArrowDownIcon}
                    alt="Expand"
                    width={20}
                    height={20}
                    style={{
                      filter: parentCapacity
                        ? getHueRotate(parentCapacity.color)
                        : "",
                    }}
                  />
                </div>
              </button>
            )}
          </div>
        </div>

        {showInfo && description && (
          <div
            className="bg-white p-3 text-sm rounded-b-lg flex-grow"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-700 text-xs leading-relaxed">
              {capitalizeFirstLetter(description)}
            </p>
            {wd_code && (
              <a
                href={wd_code}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline mt-2 inline-block text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {pageContent["capacity-selection-modal-see-more-information"]}
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={`w-full max-w-lg md:max-w-3xl lg:max-w-4xl rounded-lg shadow-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          } p-4 md:p-6`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`text-lg md:text-xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className={`p-1 hover:bg-gray-100 rounded ${
                darkMode ? "text-white hover:bg-gray-700" : "text-gray-500"
              }`}
            >
              ✕
            </button>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-sm md:text-base overflow-x-auto whitespace-nowrap pb-2">
            <span
              className={`cursor-pointer hover:text-blue-500 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
              onClick={() => setSelectedPath([])}
            >
              {pageContent["capacity-selection-modal-root-capacities"]}
            </span>
            {selectedPath.map((pathId, index) => {
              const capacity = findCapacityByCode(pathId);

              return (
                <React.Fragment key={pathId}>
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-500"}
                  >
                    /
                  </span>
                  <span
                    className={`cursor-pointer hover:text-blue-500 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                    onClick={() =>
                      setSelectedPath((prev) => prev.slice(0, index + 1))
                    }
                  >
                    {capacity?.name ||
                      `${pageContent["capacity-selection-modal-select-capacity"]} ${pathId}`}
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          {/* Capacity list */}
          <div className="space-y-4 max-h-[60vh] md:max-h-[65vh] overflow-y-auto scrollbar-hide p-2 pb-4">
            {isLoading?.root ? (
              <div
              className={`text-center py-4 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {pageContent["capacity-selection-modal-loading"]}
            </div>
            ) : getCurrentCapacities().length > 0 ? (
              <div className="flex flex-col gap-2">
                {getCurrentCapacities().map((capacity, index) => {
                  const isRoot = selectedPath.length === 0;
                  const uniqueKey = `${capacity.code}-${selectedPath.join(
                    "-"
                  )}-${index}`;

                  return (
                    <div key={uniqueKey} className="transform-gpu">
                      {renderCapacityCard(capacity, isRoot)}
                      {selectedCapacity?.code === capacity.code && (
                        <div
                          className={`text-sm mt-1 text-center ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {pageContent["capacity-selection-modal-selected"]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`text-center py-4 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {pageContent["capacity-selection-modal-no-capacities-found"]}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex w-full justify-center gap-2 mt-4">
            <BaseButton
              label={
                pageContent[
                  "capacity-selection-modal-select-capacity-button-cancel"
                ]
              }
              customClass="bg-[#F6F6F6] w-1/2 md:w-1/3 rounded-[6px] !py-2 !px-4 font-extrabold text-[14px] text-capx-dark-bg border border-capx-dark-bg hover:bg-gray-600"
              onClick={onClose}
            />
            <BaseButton
              label={
                pageContent["capacity-selection-modal-select-capacity-button"]
              }
              customClass={`bg-capx-secondary-purple rounded-[6px] !py-2 !px-4 font-extrabold text-[14px] text-white hover:bg-capx-primary-green w-1/2 md:w-1/3 ${
                !selectedCapacity ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleConfirm}
              disabled={!selectedCapacity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
