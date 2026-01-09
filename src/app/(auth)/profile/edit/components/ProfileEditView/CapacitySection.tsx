import BaseButton from '@/components/BaseButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import AddIcon from '@/public/static/images/add.svg';
import AddIconDark from '@/public/static/images/add_dark.svg';
import { ResponsiveIcon } from './ResponsiveIcon';
import {
  CAPACITY_BORDER_COLORS,
  RESPONSIVE_TEXT_SIZES,
  RESPONSIVE_PADDING,
  RESPONSIVE_BORDER_RADIUS,
} from './utils';

interface CapacitySectionProps {
  type: 'known' | 'available' | 'wanted';
  title: string;
  icon: string;
  iconDark: string;
  capacities: number[];
  getCapacityName: (id: number) => string;
  onRemove: (type: 'known' | 'available' | 'wanted', index: number) => void;
  onAdd: (type: 'known' | 'available' | 'wanted') => void;
  helpText: string;
  showImportButton?: boolean;
  onImport?: () => void;
}

export function CapacitySection({
  type,
  title,
  icon,
  iconDark,
  capacities,
  getCapacityName,
  onRemove,
  onAdd,
  helpText,
  showImportButton,
  onImport,
}: CapacitySectionProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  const textColor = darkMode ? 'text-white' : 'text-[#053749]';
  const bgColor = darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]';
  const buttonColorClass = darkMode
    ? 'bg-capx-light-box-bg text-[#04222F]'
    : 'bg-[#053749] text-white';
  const closeIcon = darkMode ? CloseIconWhite : CloseIcon;
  const addIcon = darkMode ? AddIconDark : AddIcon;
  const closeIconSize = isMobile ? 16 : 24;
  const addIconSize = isMobile ? 20 : 30;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ResponsiveIcon
          lightIcon={icon}
          darkIcon={iconDark}
          alt={`${type} icon`}
          mobileSize={20}
          desktopSize={48}
        />
        <h2 className={`font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.large} font-bold ${textColor}`}>
          {title}
        </h2>
      </div>
      <div
        className={`flex flex-wrap gap-2 ${RESPONSIVE_BORDER_RADIUS.small} ${bgColor} w-full ${RESPONSIVE_PADDING.small} items-start gap-[12px]`}
      >
        {capacities?.map((capacity, index) => {
          let borderColorClass = 'border-[#D43831]'; // wanted - default
          if (type === 'known') {
            borderColorClass = 'border-[#0070B9]';
          } else if (type === 'available') {
            borderColorClass = 'border-[#05A300]';
          }

          const borderWidthClass = type === 'known' ? 'md:border-2' : '';
          const paddingClass = type === 'wanted' ? 'md:px-2 md:py-2 md:pb-2' : 'md:py-4 md:px-4';

          return (
            <div
              key={`${type}-${capacity}-${index}`}
              className="flex items-center gap-1 rounded-md"
            >
              <BaseButton
                onClick={() => onRemove(type, index)}
                label={getCapacityName(capacity)}
                customClass={`rounded-[4px] border-[1px] ${borderWidthClass} border-[solid] ${borderColorClass} !mb-0 flex p-[4px] pb-[4px] ${paddingClass} justify-center items-center gap-[4px] font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.medium} not-italic font-normal leading-[normal]`}
                imageUrl={closeIcon}
                imageAlt="Close icon"
                imageWidth={closeIconSize}
                imageHeight={closeIconSize}
              />
            </div>
          );
        })}
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <BaseButton
          onClick={() => onAdd(type)}
          label={pageContent['edit-profile-add-capacities']}
          customClass={`w-full md:w-fit flex ${buttonColorClass} ${RESPONSIVE_BORDER_RADIUS.button} py-2 font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.medium} not-italic font-extrabold leading-[normal] mb-0 pb-[6px] ${RESPONSIVE_PADDING.medium} items-center gap-[4px]`}
          imageUrl={addIcon}
          imageAlt="Add capacity"
          imageWidth={addIconSize}
          imageHeight={addIconSize}
        />
        {showImportButton && onImport && (
          <BaseButton
            onClick={onImport}
            label={pageContent['edit-profile-import-known-capacities'] || 'Import Known Capacities'}
            customClass={`w-full md:w-fit flex ${
              darkMode
                ? 'bg-transparent border-white text-white border-2'
                : 'bg-transparent border-[#053749] text-[#053749] border-2'
            } ${RESPONSIVE_BORDER_RADIUS.button} py-2 font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.medium} not-italic font-extrabold leading-[normal] mb-0 pb-[6px] ${RESPONSIVE_PADDING.medium} items-center gap-[4px]`}
            imageUrl={addIcon}
            imageAlt="Import known capacities"
            imageWidth={addIconSize}
            imageHeight={addIconSize}
          />
        )}
      </div>
      <span
        className={`${RESPONSIVE_TEXT_SIZES.small} font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${textColor}`}
      >
        {helpText}
      </span>
    </div>
  );
}
