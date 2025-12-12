import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

interface SavedItemProfileImageProps {
  readonly profileImageUrl: string | null;
  readonly isLoading: boolean;
  readonly defaultAvatar: string;
  readonly username: string;
  readonly size: 'small' | 'large';
}

export const SavedItemProfileImage = ({
  profileImageUrl,
  isLoading,
  defaultAvatar,
  username,
  size,
}: SavedItemProfileImageProps) => {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  const dimensions = size === 'small' ? 120 : 160;
  const heightClass = size === 'small' ? 'h-[120px]' : 'h-[160px]';

  if (isLoading) {
    return (
      <div className={`relative w-full ${heightClass} flex justify-center`}>
        <div
          className={`w-[${dimensions}px] h-[${dimensions}px] rounded-full animate-pulse ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        />
      </div>
    );
  }

  const imageAlt =
    !profileImageUrl || profileImageUrl === defaultAvatar
      ? pageContent['alt-profile-picture-default'] || 'Default user profile picture'
      : username;

  return (
    <div className={`relative w-full ${heightClass} flex justify-center`}>
      <Image
        src={profileImageUrl || defaultAvatar}
        alt={imageAlt}
        width={dimensions}
        height={dimensions}
        className="object-contain"
        unoptimized
      />
    </div>
  );
};
