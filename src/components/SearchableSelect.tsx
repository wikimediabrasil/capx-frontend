import { useId, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import ArrowDownIcon from '@/public/static/images/arrow_drop_down_circle.svg';
import ArrowDownIconWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';

import { useDarkMode, usePageContent } from '@/stores';

export interface SearchableSelectOption {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  readonly options: SearchableSelectOption[];
  readonly onSelect: (id: string) => void;
  // Options with these ids are hidden from the list (e.g. items already selected)
  readonly excludeIds?: string[];
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  readonly inputClassName?: string;
  readonly inputStyle?: React.CSSProperties;
  readonly iconSize?: number;
}

// Case- and accent-insensitive, so "sao" matches "São Paulo"
export const normalizeSearchText = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function SearchableSelect({
  options,
  onSelect,
  excludeIds = [],
  placeholder,
  ariaLabel,
  inputClassName,
  inputStyle,
  iconSize = 20,
}: SearchableSelectProps) {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredOptions = useMemo(() => {
    const excluded = new Set(excludeIds.map(String));
    const normalizedQuery = normalizeSearchText(query);
    return options
      .filter(option => !excluded.has(String(option.id)))
      .filter(option => normalizeSearchText(option.name).includes(normalizedQuery))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [options, excludeIds, query]);

  const close = () => {
    setIsOpen(false);
    setActiveIndex(0);
  };

  const selectOption = (option: SearchableSelectOption) => {
    onSelect(option.id);
    setQuery('');
    setActiveIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        if (isOpen && filteredOptions[activeIndex]) {
          e.preventDefault();
          selectOption(filteredOptions[activeIndex]);
        }
        break;
      case 'Escape':
        close();
        break;
    }
  };

  const activeOptionId =
    isOpen && filteredOptions[activeIndex] ? `${listboxId}-${activeIndex}` : undefined;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        aria-label={ariaLabel || placeholder}
        value={query}
        placeholder={placeholder || pageContent['edit-profile-insert-item']}
        onChange={e => {
          setQuery(e.target.value);
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onClick={() => setIsOpen(true)}
        onBlur={close}
        onKeyDown={handleKeyDown}
        className={`w-full pr-12 ${
          inputClassName ??
          `px-4 py-2 rounded-lg border ${
            darkMode
              ? 'bg-capx-dark-box-bg border-gray-700 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900'
          }`
        }`}
        style={inputStyle}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        // Keep focus on the input so the list doesn't close before toggling
        onMouseDown={e => e.preventDefault()}
        onClick={() => {
          setIsOpen(prev => !prev);
          inputRef.current?.focus();
        }}
        className="absolute right-4 top-1/2 transform -translate-y-1/2"
      >
        <Image
          src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
          alt=""
          width={iconSize}
          height={iconSize}
        />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className={`absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border shadow-lg font-[Montserrat] text-[12px] md:text-[16px] ${
            darkMode
              ? 'bg-capx-dark-box-bg border-gray-700 text-white'
              : 'bg-white border-gray-300 text-[#053749]'
          }`}
        >
          {filteredOptions.length === 0 ? (
            <li className="px-4 py-2 opacity-70">
              {pageContent['searchable-select-no-results'] || 'No results found'}
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.id}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                // mousedown fires before the input's blur, which would close the list
                onMouseDown={e => {
                  e.preventDefault();
                  selectOption(option);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`px-4 py-2 cursor-pointer ${
                  index === activeIndex ? (darkMode ? 'bg-[#053749]' : 'bg-[#EFEFEF]') : ''
                }`}
              >
                {option.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
