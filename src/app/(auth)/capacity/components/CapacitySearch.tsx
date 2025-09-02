'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useApp } from '@/contexts/AppContext';
import BaseInput from '@/components/BaseInput';
import { CapacityCard } from './CapacityCard';
import SearchIcon from '@/public/static/images/search.svg';
import SearchIconWhite from '@/public/static/images/search_icon_white.svg';
import { useCapacityList } from '@/hooks/useCapacityList';
import LoadingState from '@/components/LoadingState';
import { useTheme } from '@/contexts/ThemeContext';
import { useCapacityDescriptions } from '@/contexts/CapacityContext';

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
  const { data: session } = useSession();
  const { language, isMobile, pageContent } = useApp();
  const { darkMode } = useTheme();
  const { getName } = useCapacityDescriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCapacities, setExpandedCapacities] = useState<Record<string, boolean>>({});
  const {
    searchResults,
    descriptions,
    setSearchResults,
    fetchRootCapacities,
    fetchCapacitiesByParent,
    fetchCapacitySearch,
    fetchCapacityDescription,
    wdCodes,
  } = useCapacityList(session?.user?.token, language);

  // Store the last search term to avoid duplicate requests
  const lastSearchRef = useRef<string>('');

  // Notificar o componente pai sobre o termo de busca
  // Usar um ref para rastrear o último termo enviado
  const lastNotifiedTermRef = useRef<string>('');

  useEffect(() => {
    if (session?.user?.token) {
      fetchRootCapacities();
    }
  }, [session?.user?.token, fetchRootCapacities]);

  // Search function
  const search = useCallback(
    async (term: string) => {
      // If the search term is the same as the last search, do nothing
      if (term === lastSearchRef.current) {
        return;
      }

      if (term) {
        setIsLoading(true);
        onSearchStart?.();
        await fetchCapacitySearch(term);
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
    [fetchCapacitySearch, onSearchStart, onSearchEnd, setSearchResults]
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

  const toggleCapacity = useCallback(
    async (parentCode: string) => {
      if (expandedCapacities[parentCode]) {
        setExpandedCapacities(prev => ({ ...prev, [parentCode]: false }));
        return;
      }

      const children = await fetchCapacitiesByParent(parentCode);
      for (const child of children) {
        if (child.code) {
          fetchCapacityDescription(child.code);
        }
      }

      setExpandedCapacities(prev => ({ ...prev, [parentCode]: true }));
    },
    [expandedCapacities, fetchCapacitiesByParent, fetchCapacityDescription]
  );

  // Processa os resultados para garantir níveis corretos e cores consistentes
  const processedResults = searchResults.map(capacity => {
    // Determina o nível com base na estrutura de pais
    let level = 1;
    if (capacity.parentCapacity) {
      if (capacity.parentCapacity.parentCapacity) {
        // Terceiro nível - tem um avô
        level = 3;
      } else {
        // Segundo nível - tem apenas um pai
        level = 2;
      }
    }

    // Sempre prioriza o nível explícito se já estiver definido
    if (capacity.level) {
      level = capacity.level;
    }

    // Força capacidades de terceiro nível a terem cor preta
    let color = capacity.color;
    if (level === 3) {
      color = '#507380';
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
              <div key={capacity.code} className="w-full">
                <CapacityCard
                  {...capacity}
                  name={getName(capacity.code) || capacity.name}
                  level={capacity.level}
                  isExpanded={!!expandedCapacities[capacity.code]}
                  onExpand={() => toggleCapacity(capacity.code.toString())}
                  isRoot={!capacity.parentCapacity}
                  color={capacity.color}
                  icon={capacity.icon}
                  parentCapacity={capacity.parentCapacity}
                  description={descriptions[capacity.code] || ''}
                  wd_code={wdCodes[capacity.code] || ''}
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
