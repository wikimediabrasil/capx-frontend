import BaseButton from '@/components/BaseButton';
import SaveIcon from '@/public/static/images/save_as.svg';
import CancelIcon from '@/public/static/images/cancel.svg';
import CancelIconWhite from '@/public/static/images/cancel_white.svg';
import DeleteIcon from '@/public/static/images/delete.svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

interface ActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  variant: 'mobile-top' | 'desktop-top' | 'bottom';
}

export function ActionButtons({ onSave, onCancel, onDelete, variant }: ActionButtonsProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  const isMobileTop = variant === 'mobile-top';
  const isDesktopTop = variant === 'desktop-top';
  const isBottom = variant === 'bottom';

  const containerClass = isMobileTop
    ? 'flex flex-col md:hidden gap-[10px]'
    : isDesktopTop
      ? 'hidden md:flex flex-row gap-6 mt-0 w-3/4'
      : 'flex flex-col md:flex-row gap-[10px] md:gap-6 mt-6';

  const buttonSize = isMobileTop || isBottom ? (isMobile ? 20 : 30) : 30;

  const saveClass =
    isMobileTop || isBottom
      ? 'w-full flex items-center px-[13px] py-[6px] text-[14px] pb-[6px] md:text-[24px] md:px-8 md:py-4 bg-[#851970] text-white rounded-md py-3 font-bold !mb-0'
      : 'w-full flex items-center text-[24px] px-8 py-4 bg-[#851970] text-white rounded-md py-3 font-bold mb-0';

  const cancelClass =
    isMobileTop || isBottom
      ? `w-full flex items-center px-[13px] py-[6px] pb-[6px] text-[14px] md:text-[24px] md:px-8 md:py-4 border rounded-md py-3 font-bold mb-0 ${
          darkMode
            ? 'bg-transparent text-[#F6F6F6] border-[#F6F6F6] border-[2px]'
            : 'bg-[#F6F6F6] border-[#053749] text-[#053749]'
        }`
      : `w-full flex items-center text-[24px] px-8 py-4 border rounded-md py-3 font-bold mb-0 ${
          darkMode
            ? 'bg-transparent text-[#F6F6F6] border-[#F6F6F6] border-[2px]'
            : 'bg-[#F6F6F6] border-[#053749] text-[#053749]'
        }`;

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
        imageUrl={darkMode ? CancelIconWhite : CancelIcon}
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
