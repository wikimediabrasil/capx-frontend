import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import AccountCircle from '@/public/static/images/account_circle.svg';
import AccountCircleWhite from '@/public/static/images/account_circle_white.svg';

interface SavedItemHeaderProps {
  readonly displayName: string;
  readonly size: 'small' | 'large';
}

export const SavedItemHeader = ({ displayName, size }: SavedItemHeaderProps) => {
  const { darkMode } = useTheme();

  const iconSize = size === 'small' ? 20 : 24;
  const textClass = size === 'small' ? 'text-xl md:text-[32px]' : 'text-xl md:text-2xl';

  return (
    <div className={`flex items-center ${size === 'small' ? 'mb-3' : 'mb-6'}`}>
      <Image
        src={darkMode ? AccountCircleWhite : AccountCircle}
        alt="Username"
        width={iconSize}
        height={iconSize}
        className="mr-2"
      />
      <h5
        className={`${textClass} font-bold font-[Montserrat] ${
          darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
        }`}
      >
        {displayName}
      </h5>
    </div>
  );
};
