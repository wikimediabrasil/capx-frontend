import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { DEFAULT_AVATAR, DEFAULT_AVATAR_WHITE } from '@/constants/images';
import { useRouter } from 'next/navigation';
import { useProfileImage } from '@/hooks/useProfileImage';
import { useSession } from 'next-auth/react';
import { useOrganizationDisplayName } from '@/hooks/useOrganizationDisplayName';
import { SavedItemProfileImage } from './SavedItemProfileImage';
import { SavedItemHeader } from './SavedItemHeader';
import { SavedItemActions } from './SavedItemActions';

interface SavedItemCardProps {
  readonly id: string;
  readonly username: string;
  readonly profile_image?: string;
  readonly avatar?: string;
  readonly wikidataQid?: string;
  readonly isOrganization?: boolean;
  readonly onDelete: () => void;
}

export const SavedItemCard = ({
  id,
  username,
  profile_image,
  avatar,
  wikidataQid,
  isOrganization = false,
  onDelete,
}: SavedItemCardProps) => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const { data: session } = useSession();

  const { displayName: translatedOrgName } = useOrganizationDisplayName({
    organizationId: isOrganization ? Number.parseInt(id, 10) : undefined,
    defaultName: isOrganization ? username : '',
    token: session?.user?.token,
  });

  const displayName = isOrganization ? translatedOrgName || username : username;

  const { profileImageUrl, isLoading: isImageLoading } = useProfileImage({
    isOrganization,
    profile_image,
    avatar,
    wikidataQid,
  });

  const defaultAvatar = darkMode ? DEFAULT_AVATAR_WHITE : DEFAULT_AVATAR;

  const handleView = () => {
    const routePath = isOrganization
      ? `/organization_profile/${id}`
      : `/profile/${encodeURIComponent(username)}`;
    router.push(routePath);
  };

  return (
    <div
      className={`w-full rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="p-4 md:p-5">
        {/* Mobile layout */}
        <div className="md:hidden">
          <SavedItemHeader displayName={displayName} size="small" />
          <div className="rounded-lg p-4 mb-3">
            <SavedItemProfileImage
              profileImageUrl={profileImageUrl}
              isLoading={isImageLoading}
              defaultAvatar={defaultAvatar}
              username={username}
              size="small"
            />
          </div>
          <SavedItemActions onView={handleView} onDelete={onDelete} size="small" />
        </div>

        {/* Desktop layout */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-4">
          <div className="rounded-lg p-4 flex justify-center items-center">
            <SavedItemProfileImage
              profileImageUrl={profileImageUrl}
              isLoading={isImageLoading}
              defaultAvatar={defaultAvatar}
              username={username}
              size="large"
            />
          </div>
          <div className="flex flex-col justify-center">
            <SavedItemHeader displayName={displayName} size="large" />
            <SavedItemActions onView={handleView} onDelete={onDelete} size="large" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedItemCard;
