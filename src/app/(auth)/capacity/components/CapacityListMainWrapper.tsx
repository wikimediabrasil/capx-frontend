"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useApp } from "@/contexts/AppContext";
import { CapacityCard } from "./CapacityCard";
import { CapacityBanner } from "./CapacityBanner";
import { CapacitySearch } from "./CapacitySearch";
import { useCapacityList } from "@/hooks/useCapacityList";
import LoadingState from "@/components/LoadingState";

export default function CapacityListMainWrapper() {
  const { language, isMobile } = useApp();
  const { status, data: session } = useSession();

  const {
    rootCapacities,
    childrenCapacities,
    descriptions,
    wdCodes,
    searchResults,
    isLoading,
    fetchRootCapacities,
    fetchCapacitiesByParent,
    fetchCapacityDescription,
  } = useCapacityList(session?.user?.token, language);

  const [expandedCapacities, setExpandedCapacities] = useState<
    Record<string, boolean>
  >({});
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchRootCapacities();
    }
  }, [status, fetchRootCapacities]);

  const toggleChildCapacities = useCallback(
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

  if (isLoading?.root) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingState />
      </div>
    );
  }
  return (
    <section className="flex flex-col max-w-screen-xl mx-auto py-8 px-4 md:px-8 lg:px-12 gap-[40px]">
      <CapacityBanner />
      <CapacitySearch
        onSearchStart={() => setIsSearching(true)}
        onSearchEnd={() => setIsSearching(false)}
      />

      {searchResults.length > 0 || isSearching ? (
        <div className="grid gap-4 w-full">
          {searchResults.map((capacity) => (
            <div key={capacity.code} className="max-w-screen-xl mx-auto">
              <CapacityCard
                {...capacity}
                isExpanded={!!expandedCapacities[capacity.code]}
                onExpand={() => toggleChildCapacities(capacity.code.toString())}
                hasChildren={capacity.hasChildren}
                isRoot={false}
                parentCapacity={capacity.parentCapacity}
                code={capacity.code}
                name={capacity.name}
                color={capacity.color}
                icon={capacity.icon}
                description={descriptions[capacity.code] || ""}
                wd_code={capacity.wd_code || ""}
                onInfoClick={fetchCapacityDescription}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Show original cards when there are no search results */
        <div className="grid gap-[40px] w-full">
          {rootCapacities.map((capacity) => (
            <div key={capacity.code} className={`w-screen max-w-[1190px]`}>
              <CapacityCard
                {...capacity}
                isExpanded={!!expandedCapacities[capacity.code]}
                onExpand={() => toggleChildCapacities(capacity.code.toString())}
                hasChildren={true}
                isRoot={true}
                color={capacity.color}
                icon={capacity.icon}
                description={descriptions[capacity.code] || ""}
                wd_code={wdCodes[capacity.code] || ""}
                onInfoClick={fetchCapacityDescription}
              />
              {expandedCapacities[capacity.code] && (
                <div className="mt-4 overflow-x-auto scrollbar-hide w-full">
                  <div className="flex gap-4 pb-4 w-fit max-w-screen-xl">
                    {(childrenCapacities[capacity.code] || []).map((child) => (
                      <div key={child.code} className="mt-4 max-w-[992px]">
                        <CapacityCard
                          {...child}
                          isExpanded={!!expandedCapacities[child.code]}
                          onExpand={() =>
                            toggleChildCapacities(child.code.toString())
                          }
                          hasChildren={child.hasChildren}
                          isRoot={false}
                          parentCapacity={capacity}
                          description={descriptions[child.code] || ""}
                          wd_code={wdCodes[child.code] || ""}
                          onInfoClick={fetchCapacityDescription}
                        />
                        {expandedCapacities[child.code] && (
                          <div className="mt-4 overflow-x-auto scrollbar-hide">
                            <div className="flex gap-4 pb-4 w-3/4">
                              {(childrenCapacities[child.code] || []).map(
                                (grandChild) => (
                                  <div
                                    key={grandChild.code}
                                    className="mt-4 max-w-[992px]"
                                  >
                                    <CapacityCard
                                      {...grandChild}
                                      isExpanded={
                                        !!expandedCapacities[grandChild.code]
                                      }
                                      onExpand={() =>
                                        toggleChildCapacities(
                                          grandChild.code.toString()
                                        )
                                      }
                                      hasChildren={grandChild.hasChildren}
                                      isRoot={false}
                                      parentCapacity={child}
                                      description={
                                        descriptions[grandChild.code] || ""
                                      }
                                      wd_code={wdCodes[grandChild.code] || ""}
                                      onInfoClick={fetchCapacityDescription}
                                      color={child.color}
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
