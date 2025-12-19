import BaseButton from '@/components/BaseButton';
import SaveIcon from '@/public/static/images/save_as.svg';
import CancelIcon from '@/public/static/images/cancel.svg';
import CancelIconWhite from '@/public/static/images/cancel_white.svg';
import DeleteIcon from '@/public/static/images/delete.svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { getThemedIcon, getBorderButtonClasses } from './utils';

interface ActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  variant: 'mobile-top' | 'desktop-top' | 'bottom';
}

const getContainerClass = (variant: ActionButtonsProps['variant']) => {
  if (variant === 'mobile-top') return 'flex flex-col md:hidden gap-[10px]';
  if (variant === 'desktop-top') return 'hidden md:flex flex-row gap-6 mt-0 w-3/4';
  return 'flex flex-col md:flex-row gap-[10px] md:gap-6 mt-6';
};

const getButtonSize = (variant: ActionButtonsProps['variant'], isMobile: boolean) => {
  if (variant === 'desktop-top') {
    return 30;
  }
  return isMobile ? 20 : 30;
};

const getSaveButtonClass = (variant: ActionButtonsProps['variant']) => {
  const baseClass = 'w-full flex items-center bg-[#851970] text-white rounded-md font-bold';
  const responsiveClass =
    variant === 'desktop-top'
      ? 'text-[24px] px-8 py-4 py-3 mb-0'
      : 'px-[13px] py-[6px] text-[14px] pb-[6px] md:text-[24px] md:px-8 md:py-4 py-3 !mb-0';
  return `${baseClass} ${responsiveClass}`;
};

const getCancelButtonClass = (variant: ActionButtonsProps['variant'], darkMode: boolean) => {
  const baseClass = 'w-full flex items-center border rounded-md py-3 font-bold mb-0';
  const responsiveClass =
    variant === 'desktop-top'
      ? 'text-[24px] px-8 py-4'
      : 'px-[13px] py-[6px] pb-[6px] text-[14px] md:text-[24px] md:px-8 md:py-4';
  return `${baseClass} ${responsiveClass} ${getBorderButtonClasses(darkMode)}`;
};

export function ActionButtons({ onSave, onCancel, onDelete, variant }: ActionButtonsProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  const isMobileTop = variant === 'mobile-top';
  const containerClass = getContainerClass(variant);
  const buttonSize = getButtonSize(variant, isMobile);
  const saveClass = getSaveButtonClass(variant);
  const cancelClass = getCancelButtonClass(variant, darkMode);

  return (
    <div className={containerClass}>
      <BaseButton
        onClick={onSave}
        label={pageContent['edit-profile-save']}
        customClass={saveClass}
        imageUrl={SaveIcon}
        imageAlt="Save icon"
        imageWidth={buttonSize}
        imageHeight={buttonSize}
      />
      <BaseButton
        onClick={onCancel}
        label={pageContent['edit-profile-cancel']}
        customClass={cancelClass}
        imageUrl={getThemedIcon(CancelIcon, CancelIconWhite, darkMode)}
        imageAlt="Cancel icon"
        imageWidth={buttonSize}
        imageHeight={buttonSize}
      />
      {onDelete && isMobileTop && (
        <BaseButton
          onClick={onDelete}
          label={pageContent['edit-profile-delete-profile']}
          customClass="w-full flex justify-between items-center px-[13px] py-[6px] pb-[6px] text-[14px] rounded-[4px] font-[Montserrat] font-extrabold text-capx-dark-box-bg mb-0 mt-2 bg-[#D43831] text-white"
          imageUrl={DeleteIcon}
          imageAlt="Delete icon"
          imageWidth={20}
          imageHeight={20}
        />
      )}
    </div>
  );
}
