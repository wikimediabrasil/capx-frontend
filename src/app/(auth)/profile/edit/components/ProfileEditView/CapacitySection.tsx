import BaseButton from '@/components/BaseButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import AddIcon from '@/public/static/images/add.svg';
import AddIconDark from '@/public/static/images/add_dark.svg';

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

  const borderColors = {
    known: '#0070B9',
    available: '#05A300',
    wanted: '#D43831',
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Image
          src={darkMode ? iconDark : icon}
          alt={`${type} icon`}
          width={isMobile ? 20 : 48}
          height={isMobile ? 20 : 48}
        />
        <h2
          className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
            darkMode ? 'text-white' : 'text-[#053749]'
          }`}
        >
          {title}
        </h2>
      </div>
      <div
        className={`flex flex-wrap gap-2 rounded-[4px] md:rounded-[16px] ${
          darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'
        } w-full px-[4px] py-[6px] md:px-3 md:py-6 items-start gap-[12px]`}
      >
        {capacities?.map((capacity, index) => (
          <div key={index} className="flex items-center gap-1 rounded-md">
            <BaseButton
              onClick={() => onRemove(type, index)}
              label={getCapacityName(capacity)}
              customClass={`rounded-[4px] border-[1px] ${type === 'known' ? 'md:border-2' : ''} border-[solid] !mb-0 flex p-[4px] pb-[4px] ${type === 'wanted' ? 'md:px-2 md:py-2 md:pb-2' : 'md:py-4 md:px-4'} justify-center items-center gap-[4px] font-[Montserrat] text-[12px] md:text-[24px] not-italic font-normal leading-[normal]`}
              style={{ borderColor: borderColors[type] }}
              imageUrl={darkMode ? CloseIconWhite : CloseIcon}
              imageAlt="Close icon"
              imageWidth={isMobile ? 16 : 24}
              imageHeight={isMobile ? 16 : 24}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <BaseButton
          onClick={() => onAdd(type)}
          label={pageContent['edit-profile-add-capacities']}
          customClass={`w-full md:w-fit flex ${
            darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
          } rounded-md py-2 font-[Montserrat] text-[12px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] md:px-8 md:py-4 items-center gap-[4px]`}
          imageUrl={darkMode ? AddIconDark : AddIcon}
          imageAlt="Add capacity"
          imageWidth={isMobile ? 20 : 30}
          imageHeight={isMobile ? 20 : 30}
        />
        {showImportButton && onImport && (
          <BaseButton
            onClick={onImport}
            label={pageContent['edit-profile-import-known-capacities'] || 'Import Known Capacities'}
            customClass={`w-full md:w-fit flex ${
              darkMode
                ? 'bg-transparent border-white text-white border-2'
                : 'bg-transparent border-[#053749] text-[#053749] border-2'
            } rounded-md py-2 font-[Montserrat] text-[12px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] md:px-8 md:py-4 items-center gap-[4px]`}
            imageUrl={darkMode ? AddIconDark : AddIcon}
            imageAlt="Import known capacities"
            imageWidth={isMobile ? 20 : 30}
            imageHeight={isMobile ? 20 : 30}
          />
        )}
      </div>
      <span
        className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
          darkMode ? 'text-white' : 'text-[#053749]'
        }`}
      >
        {helpText}
      </span>
    </div>
  );
}
