import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import ArrowDownIcon from '@/public/static/images/arrow_drop_down_circle.svg';
import ArrowDownIconWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import { useApp } from '@/contexts/AppContext';

interface SelectListProps {
  icon: string;
  iconDark: string;
  title: string;
  items: Array<{ id: string | number; name: string }>;
  selectedItems: string[] | number[];
  onSelect: (item: string | number) => void;
  placeholder?: string;
  multiple?: boolean;
}

export function SelectList({
  icon,
  iconDark,
  title,
  items,
  selectedItems,
  onSelect,
  placeholder,
  multiple = false,
}: SelectListProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Image src={darkMode ? iconDark : icon} alt={`${title} icon`} width={24} height={24} />
        <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{title}</h2>
      </div>

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div
          className={`flex flex-wrap gap-2 rounded-[4px] ${
            darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'
          } flex w-full px-[4px] py-[6px] items-start gap-4`}
        >
          {selectedItems.map(itemId => {
            const item = items.find(i => i.id === itemId);
            return (
              <div key={itemId} className="flex items-center gap-1 rounded-md">
                <span className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>
                  {item?.name}
                </span>
                {multiple && (
                  <button onClick={() => onSelect(itemId)} className="hover:opacity-80">
                    <Image
                      src={darkMode ? CloseIconWhite : CloseIcon}
                      alt={pageContent['filters-remove-item-alt-icon']}
                      width={16}
                      height={16}
                    />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Select/Search Input */}
      <div className="relative">
        <select
          value=""
          onChange={e => onSelect(e.target.value)}
          className={`
            w-full px-4 py-2 rounded-lg appearance-none border
            ${
              darkMode
                ? 'bg-capx-dark-box-bg border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }
          `}
        >
          <option value="">{placeholder || pageContent['edit-profile-insert-item']}</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <Image
            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
            alt={pageContent['filters-select-alt-icon']}
            width={20}
            height={20}
          />
        </div>
      </div>
    </div>
  );
}
