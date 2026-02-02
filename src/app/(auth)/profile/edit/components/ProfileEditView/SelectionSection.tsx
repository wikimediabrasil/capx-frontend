import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import { FormSelect } from './FormSelect';
import { ResponsiveIcon } from './ResponsiveIcon';
import { RESPONSIVE_TEXT_SIZES } from './utils';

interface SelectionSectionProps {
  readonly title: string;
  readonly icon: string;
  readonly iconDark: string;
  readonly selectedItems: string[];
  readonly availableOptions: Record<string, string>;
  readonly onRemove: (index: number) => void;
  readonly onAdd: (value: string) => void;
  readonly helpText: string;
  readonly placeholder: string;
}

export function SelectionSection({
  title,
  icon,
  iconDark,
  selectedItems,
  availableOptions,
  onRemove,
  onAdd,
  helpText,
  placeholder,
}: SelectionSectionProps) {
  const { darkMode } = useTheme();
  const { isMobile } = useApp();

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-center gap-2">
        <ResponsiveIcon
          lightIcon={icon}
          darkIcon={iconDark}
          alt={`${title} icon`}
          mobileSize={20}
          desktopSize={48}
        />
        <h2
          className={`font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.medium} font-bold ${
            darkMode ? 'text-white' : 'text-[#053749]'
          }`}
        >
          {title}
        </h2>
      </div>

      {/* Selected Items List */}
      <div className="flex flex-wrap gap-2">
        {selectedItems?.map((itemId, index) => (
          <div
            key={`selection-${itemId}-${index}`}
            className={`flex items-center gap-2 p-2 rounded ${
              darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
            }`}
          >
            <span className={`font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.medium}`}>
              {availableOptions[itemId]}
            </span>
            <button onClick={() => onRemove(index)} className="ml-2">
              <Image
                src={darkMode ? CloseIconWhite : CloseIcon}
                alt="Remove item"
                width={isMobile ? 16 : 24}
                height={isMobile ? 16 : 24}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Add Item Select */}
      <FormSelect
        value=""
        onChange={value => {
          if (value) {
            onAdd(value);
          }
        }}
        options={availableOptions}
        placeholder={placeholder}
      />

      <span
        className={`${RESPONSIVE_TEXT_SIZES.small} font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
          darkMode ? 'text-white' : 'text-[#053749]'
        }`}
      >
        {helpText}
      </span>
    </div>
  );
}
