import BaseButton from '@/components/BaseButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import AccountCircle from '@/public/static/images/account_circle.svg';
import AccountCircleWhite from '@/public/static/images/account_circle_white.svg';
import DeleteIcon from '@/public/static/images/delete.svg';

interface SavedItemActionsProps {
  readonly onView: () => void;
  readonly onDelete: () => void;
  readonly size: 'small' | 'large';
}

export const SavedItemActions = ({ onView, onDelete, size }: SavedItemActionsProps) => {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  const isSmall = size === 'small';
  const iconSize = isSmall ? 20 : 30;
  const textSize = isSmall ? 'text-[14px]' : 'text-[24px]';
  const padding = isSmall ? 'px-[13px] py-[6px]' : 'px-8 py-4';
  const spacing = isSmall ? 'space-y-2' : 'space-y-3';
  const containerClass = isSmall ? '' : 'max-w-[300px]';

  return (
    <div className={`${spacing} ${containerClass}`}>
      <BaseButton
        onClick={onView}
        label={pageContent['saved-profiles-view-profile']}
        customClass={`w-full flex items-center ${textSize} ${padding} border ${
          darkMode
            ? isSmall
              ? 'bg-transparent text-[#F6F6F6] border-[#F6F6F6] border-[2px]'
              : 'border-white text-white'
            : isSmall
              ? 'bg-[#F6F6F6] border-[#053749] text-[#053749]'
              : 'border-[#053749] text-[#053749]'
        } rounded-md py-3 font-bold mb-0`}
        imageUrl={darkMode ? AccountCircleWhite : AccountCircle}
        imageAlt="View profile"
        imageWidth={iconSize}
        imageHeight={iconSize}
      />

      <BaseButton
        onClick={onDelete}
        label={pageContent['saved-profiles-delete-item']}
        customClass={`w-full flex items-center ${textSize} ${padding} bg-[#E53935] text-white rounded-md py-3 font-bold mb-0`}
        imageUrl={DeleteIcon}
        imageAlt="Delete"
        imageWidth={iconSize}
        imageHeight={iconSize}
      />
    </div>
  );
};
