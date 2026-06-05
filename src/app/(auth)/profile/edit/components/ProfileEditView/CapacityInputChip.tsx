'use client';

import { useCapacityStore, useDarkMode, useIsMobile } from '@/stores';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RESPONSIVE_TEXT_SIZES } from './utils';

interface Capacity {
  code: number;
  name: string;
}

interface CapacityInputChipProps {
  type: 'known' | 'available' | 'wanted';
  onSelect: (capacity: Capacity) => void;
  alreadySelected: number[];
  paddingClassName?: string;
  borderWidthClassName?: string;
}

const BORDER_COLORS: Record<string, string> = {
  known: 'border-[#0070B9]',
  available: 'border-[#05A300]',
  wanted: 'border-[#D43831]',
};

export function CapacityInputChip({
  type,
  onSelect,
  alreadySelected,
  paddingClassName,
  borderWidthClassName,
}: CapacityInputChipProps) {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<Capacity[]>([]);
  const [bestMatch, setBestMatch] = useState<Capacity | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const darkMode = useDarkMode();
  const isMobile = useIsMobile();
  const { getRootCapacities, getChildren, getName } = useCapacityStore();

  const getAllCapacities = useCallback(() => {
    const all: any[] = [];
    const roots = getRootCapacities();
    all.push(...roots);
    roots.forEach(root => {
      const children = getChildren(root.code);
      all.push(...children);
      children.forEach(child => {
        all.push(...getChildren(child.code));
      });
    });
    return all;
  }, [getRootCapacities, getChildren]);

  const search = useCallback(
    (term: string) => {
      if (!term.trim()) {
        setResults([]);
        setBestMatch(null);
        return;
      }
      const lower = term.toLowerCase();
      const filtered = getAllCapacities()
        .filter(
          c => c.name && c.name.toLowerCase().includes(lower) && !alreadySelected.includes(c.code)
        )
        .slice(0, 10)
        .map(c => ({ code: c.code, name: getName(c.code) || c.name }));

      setResults(filtered);
      const exactStart = filtered.find(c => c.name.toLowerCase().startsWith(lower));
      setBestMatch(exactStart || filtered[0] || null);
    },
    [getAllCapacities, alreadySelected, getName]
  );

  useEffect(() => {
    search(inputValue);
  }, [inputValue, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setResults([]);
        setBestMatch(null);
        setInputValue('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (capacity: Capacity) => {
    onSelect(capacity);
    setInputValue('');
    setResults([]);
    setBestMatch(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Tab' || e.key === 'Enter') && bestMatch) {
      e.preventDefault();
      handleSelect(bestMatch);
    } else if (e.key === 'Escape') {
      setInputValue('');
      setResults([]);
      setBestMatch(null);
    }
  };

  const borderColor = BORDER_COLORS[type];
  const borderWidthClass =
    borderWidthClassName !== undefined
      ? borderWidthClassName
      : type === 'known'
        ? 'md:border-2'
        : '';
  const paddingClass =
    paddingClassName !== undefined
      ? paddingClassName
      : type === 'wanted'
        ? 'md:px-2 md:py-2 md:pb-2'
        : 'md:py-4 md:px-4';
  const textColor = darkMode ? 'text-white' : 'text-[#053749]';
  const dropdownBg = darkMode ? 'bg-[#04222F] border-gray-600' : 'bg-white border-gray-200';

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`rounded-[4px] border-[1px] ${borderWidthClass} border-dashed ${borderColor} !mb-0 inline-flex p-[4px] pb-[4px] ${paddingClass} justify-center items-center gap-[4px]`}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add capacities +"
          size={inputValue.length > 0 ? inputValue.length + 1 : 'Add capacities +'.length}
          className={`bg-transparent outline-none font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.medium} not-italic font-normal leading-[normal] ${textColor} placeholder-gray-400`}
        />
      </div>

      {/* Desktop: best match only */}
      {!isMobile && bestMatch && inputValue && (
        <div
          className={`absolute left-0 top-full mt-1 z-50 rounded-md shadow-lg border ${dropdownBg} min-w-[200px]`}
        >
          <button
            type="button"
            onClick={() => handleSelect(bestMatch)}
            className={`flex items-center gap-2 px-3 py-2 text-[12px] md:text-[14px] font-[Montserrat] w-full text-left hover:opacity-70 ${textColor}`}
          >
            <span className="truncate flex-1">{bestMatch.name}</span>
            <span className="text-gray-400 text-[10px] shrink-0">Tab ↵</span>
          </button>
        </div>
      )}

      {/* Mobile: vertical list */}
      {isMobile && results.length > 0 && inputValue && (
        <div
          className={`absolute left-0 top-full mt-1 z-50 rounded-md shadow-lg border ${dropdownBg} w-[240px] max-h-[200px] overflow-y-auto`}
        >
          {results.map(capacity => (
            <button
              key={capacity.code}
              type="button"
              onClick={() => handleSelect(capacity)}
              className={`flex items-center px-3 py-2 text-[12px] font-[Montserrat] w-full text-left border-b last:border-b-0 ${textColor} ${
                darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              {capacity.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
