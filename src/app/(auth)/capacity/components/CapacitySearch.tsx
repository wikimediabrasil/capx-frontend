'use client';

import BaseInput from '@/components/BaseInput';
import LoadingState from '@/components/LoadingState';
import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useTheme } from '@/contexts/ThemeContext';
import SearchIcon from '@/public/static/images/search.svg';
import SearchIconWhite from '@/public/static/images/search_icon_white.svg';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CapacityCard } from './CapacityCard';

interface CapacitySearchProps {
  onSearchStart?: () => void;
  onSearchEnd?: () => void;
  onSearch?: (term: string) => void;
}

// simple debounce
function useDebounce<Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = useCallback(
    (...args: Args): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Function to cancel the debounce
  const cancel = useCallback((): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Clear the timeout when the component is unmounted
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { debouncedFunction, cancel };
}

export function CapacitySearch({ onSearchStart, onSearchEnd, onSearch }: CapacitySearchProps) {
  const { isMobile, pageContent } = useApp();
  const { darkMode } = useTheme();
  const { getName, getDescription, getWdCode, getRootCapacities, getChildren } = useCapacityCache();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Store the last search term to avoid duplicate requests
  const lastSearchRef = useRef<string>('');

  // Notificar o componente pai sobre o termo de busca
  // Usar um ref para rastrear o último termo enviado
  const lastNotifiedTermRef = useRef<string>('');

  // Search function using unified cache system
  const search = useCallback(
    async (term: string) => {
      // If the search term is the same as the last search, do nothing
      if (term === lastSearchRef.current) {
        return;
      }

      if (term) {
        setIsLoading(true);
        onSearchStart?.();

        try {
          // Search through cached data instead of making API calls
          const allCapacities: any[] = [];

          // Get all root capacities
          const rootCapacities = getRootCapacities();
          allCapacities.push(...rootCapacities);

          // Get all children and grandchildren from cache
          rootCapacities.forEach(root => {
            const children = getChildren(root.code);
            allCapacities.push(...children);

            children.forEach(child => {
              const grandchildren = getChildren(child.code);
              allCapacities.push(...grandchildren);
            });
          });

          // Filter capacities based on search term
          const searchTerm = term.toLowerCase();
          const results = allCapacities.filter(
            capacity => capacity.name && capacity.name.toLowerCase().includes(searchTerm)
          );

          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }

        // Store the current search term
        lastSearchRef.current = term;
        setIsLoading(false);
      } else {
        setSearchResults([]);
        onSearchEnd?.();
        // Clear the last search
        lastSearchRef.current = '';
      }
    },
    [getRootCapacities, getChildren, onSearchStart, onSearchEnd]
  );

  // Use the custom debounce hook
  const { debouncedFunction: debouncedSearch } = useDebounce(search, 300);

  // Effect to call the debounce function when the search term changes
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Notificar o componente pai sobre o termo de busca
  // Apenas notifica se o termo mudou e onSearch existir
  useEffect(() => {
    if (onSearch && searchTerm !== lastNotifiedTermRef.current) {
      lastNotifiedTermRef.current = searchTerm;
      onSearch(searchTerm);
    }
  }, [searchTerm, onSearch]);

  // Processa os resultados para garantir níveis corretos e cores consistentes
  const processedResults = searchResults.map(capacity => {
    // Usa o nível já definido pelo cache, pois o cache unificado já tem essa informação
    const level = capacity.level || 1;

    // Para level 3, herda cor da família root em vez de usar cor fixa
    let color = capacity.color;
    if (level === 3 && capacity.parentCapacity?.parentCapacity?.color) {
      color = capacity.parentCapacity.parentCapacity.color; // Cor da família root
    } else if (level === 3 && capacity.parentCapacity?.color) {
      color = capacity.parentCapacity.color; // Cor do pai se não houver avô
    }

    return {
      ...capacity,
      level,
      color,
    };
  });

  return (
    <div className="w-full">
      <BaseInput
        type="text"
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value);
        }}
        placeholder={pageContent['capacity-search-placeholder']}
        className={`w-full py-6 px-3 rounded-[16px] opacity-50 ${
          darkMode ? 'text-white border-white' : 'text-capx-dark-box-bg border-capx-dark-box-bg '
        } ${isMobile ? 'text-[12px]' : 'text-[24px]'}`}
        icon={darkMode ? SearchIconWhite : SearchIcon}
        iconPosition="right"
      />

      <div className="grid gap-4 mt-4">
        {isLoading ? (
          <LoadingState />
        ) : (
          processedResults.map(capacity => {
            return (
              <div
                key={capacity.code}
                className={`${isMobile ? 'w-full' : 'xs:min-w-[453px] xs:max-w-[592px] sm:max-w-[720px] md:min-w-[690px] md:max-w-[944px] lg:min-w-[913px] lg:max-w-[1168px] xl:max-w-[1184px]'}`}
              >
                <CapacityCard
                  {...capacity}
                  name={getName(capacity.code) || capacity.name}
                  level={capacity.level}
                  isExpanded={false}
                  onExpand={() => {}}
                  isRoot={false}
                  hasChildren={false}
                  color={capacity.color}
                  icon={capacity.icon}
                  parentCapacity={capacity.parentCapacity}
                  description={getDescription(capacity.code)}
                  wd_code={getWdCode(capacity.code)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
