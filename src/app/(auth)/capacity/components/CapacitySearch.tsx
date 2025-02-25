"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useApp } from "@/contexts/AppContext";
import BaseInput from "@/components/BaseInput";
import { CapacityCard } from "./CapacityCard";
import SearchIcon from "@/public/static/images/search.svg";
import { useCapacityList } from "@/hooks/useCapacityList";
import { debounce } from "lodash";
import LoadingState from "@/components/LoadingState";

interface CapacitySearchProps {
  onSearchStart?: () => void;
  onSearchEnd?: () => void;
}

export function CapacitySearch({
  onSearchStart,
  onSearchEnd,
}: CapacitySearchProps) {
  const { data: session } = useSession();
  const { language, isMobile, pageContent } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCapacities, setExpandedCapacities] = useState<
    Record<string, boolean>
  >({});
  const {
    searchResults,
    descriptions,
    setSearchResults,
    fetchRootCapacities,
    fetchCapacitiesByParent,
    fetchCapacitySearch,
    findParentCapacity,
    fetchCapacityDescription,
    wdCodes,
  } = useCapacityList(session?.user?.token, language);

  useEffect(() => {
    if (session?.user?.token) {
      fetchRootCapacities();
    }
  }, [session?.user?.token, fetchRootCapacities]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm) {
        setIsLoading(true);
        onSearchStart?.();
        await fetchCapacitySearch(searchTerm);
        setIsLoading(false);
      } else {
        setSearchResults([]);
        onSearchEnd?.();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [
    searchTerm,
    fetchCapacitySearch,
    onSearchStart,
    onSearchEnd,
    setSearchResults,
  ]);

  const toggleCapacity = useCallback(
    async (parentCode: string) => {
      if (expandedCapacities[parentCode]) {
        setExpandedCapacities((prev) => ({ ...prev, [parentCode]: false }));
        return;
      }

      const children = await fetchCapacitiesByParent(parentCode);
      for (const child of children) {
        if (child.code) {
          fetchCapacityDescription(child.code);
        }
      }

      setExpandedCapacities((prev) => ({ ...prev, [parentCode]: true }));
    },
    [expandedCapacities, fetchCapacitiesByParent, fetchCapacityDescription]
  );

  return (
    <div className="w-full">
      <BaseInput
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={pageContent["capacity-search-placeholder"]}
        className={`w-full py-6 px-3 text-capx-dark-box-bg rounded-[16px] opacity-50 border border-capx-dark-box-bg ${
          isMobile ? "text-[12px]" : "text-[24px]"
        }`}
        icon={SearchIcon}
        iconPosition="right"
      />

      <div className="grid gap-4 mt-4">
        {isLoading ? (
          <LoadingState />
        ) : (
          searchResults.map((capacity) => {
            const parentCode = capacity.parentCode;
            const rootCapacity = findParentCapacity(capacity);
            /*             const parentCapacity = findParentCapacity(capacity);
            const grandParentCapacity = findParentCapacity(parentCode); */

            return (
              <div key={capacity.code} className="w-full">
                <CapacityCard
                  {...capacity}
                  isExpanded={!!expandedCapacities[capacity.code]}
                  onExpand={() => toggleCapacity(capacity.code.toString())}
                  isRoot={!parentCode}
                  color={rootCapacity?.color || capacity.color}
                  icon={rootCapacity?.icon || capacity.icon}
                  parentCapacity={rootCapacity}
                  description={descriptions[capacity.code] || ""}
                  wd_code={wdCodes[capacity.code] || ""}
                  onInfoClick={fetchCapacityDescription}
                  isSearch={true}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
