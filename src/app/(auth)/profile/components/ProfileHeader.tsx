import { useSnackbar } from '@/app/providers/SnackbarProvider';
import BaseButton from '@/components/BaseButton';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAvatars } from '@/hooks/useAvatars';
import { fetchWikidataImage, shouldUseWikidataImage } from '@/lib/utils/wikidataImage';
import EditIcon from '@/public/static/images/edit.svg';
import EditIconWhite from '@/public/static/images/edit_white.svg';
import CopyLinkIcon from '@/public/static/images/icons/copy_link.svg';
import CopyLinkIconWhite from '@/public/static/images/icons/copy_link_white.svg';
import UserCircleIcon from '@/public/static/images/supervised_user_circle.svg';
import UserCircleIconWhite from '@/public/static/images/supervised_user_circle_white.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
const DEFAULT_AVATAR = '/static/images/person.svg';

interface ProfileHeaderProps {
  username: string;
  avatar?: number;
  wikidataQid?: string;
  isSameUser: boolean;
}

export default function ProfileHeader({
  username,
  avatar,
  wikidataQid,
  isSameUser,
}: ProfileHeaderProps & { isSameUser: boolean }) {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const { getAvatarById, avatars } = useAvatars();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  const loadAvatar = useCallback(async () => {
    // If avatar is null or 0 and we have a Wikidata QID, fetch the Wikidata image
    if (shouldUseWikidataImage(avatar, wikidataQid)) {
      const wikidataImage = await fetchWikidataImage(wikidataQid!);
      setAvatarUrl(wikidataImage || DEFAULT_AVATAR);
      return;
    }

    // If avatar > 0, fetch from avatar system
    if (typeof avatar === 'number' && avatar > 0) {
      try {
        const avatarData = await getAvatarById(avatar);
        if (avatarData?.avatar_url) {
          setAvatarUrl(avatarData.avatar_url);
          return;
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    }

    // Default: person avatar
    setAvatarUrl(DEFAULT_AVATAR);
  }, [avatar, wikidataQid, getAvatarById]);

  useEffect(() => {
    loadAvatar();
  }, [loadAvatar]);

  const getCorrectImage = () => {
    if (avatarUrl) {
      return avatarUrl;
    }
    if (avatar && avatar > 0) {
      const avatarData = avatars?.find(a => a.id === avatar);
      return avatarData?.avatar_url || DEFAULT_AVATAR;
    }
    return DEFAULT_AVATAR;
  };

  const handleCopyLink = async () => {
    try {
      const baseUrl = window.location.origin;
      const profileUrl = `${baseUrl}/profile/${username}`;
      await navigator.clipboard.writeText(profileUrl);
      showSnackbar(pageContent['body-profile-copy-link-success'], 'success');
    } catch (error) {
      console.error('Error copying link:', error);
      showSnackbar(pageContent['body-profile-copy-link-error'], 'error');
    }
  };

  if (!avatarUrl) {
    return null;
  }

  if (isMobile) {
    const imageSrc = getCorrectImage();
    const isDefaultAvatar = imageSrc === DEFAULT_AVATAR;
    return (
      <div className="flex flex-col gap-4">
        <div className="relative w-[100px] h-[100px]">
          <Image
            priority
            src={imageSrc}
            alt={
              isDefaultAvatar
                ? pageContent['alt-profile-picture-default'] || 'Default user profile picture'
                : pageContent['navbar-user-profile'] || 'User profile'
            }
            fill
            className="object-cover border rounded-[4px]"
            unoptimized
            onError={e => {
              console.error('Error fetching avatar:', e);
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
          />
        </div>
        <h1
          className={` text-[24px] font-[Montserrat] font-normal ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {pageContent['edit-profile-welcome']}
        </h1>
        <div className="flex items-center gap-2">
          <Image
            src={darkMode ? UserCircleIconWhite : UserCircleIcon}
            alt={pageContent['navbar-user-profile']}
            width={20}
            height={20}
          />
          <span
            className={`text-[20px] font-[Montserrat] font-bold ${
              darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
            }`}
          >
            {username || pageContent['loading']}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <BaseButton
            onClick={handleCopyLink}
            label={pageContent['body-profile-copy-link']}
            customClass={`w-full font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ${
              darkMode
                ? 'text-capx-light-bg border-capx-light-bg'
                : 'text-capx-dark-box-bg border-capx-dark-box-bg'
            }`}
            imageUrl={darkMode ? CopyLinkIconWhite : CopyLinkIcon}
            imageAlt="Copy link"
            imageWidth={20}
            imageHeight={20}
          />

          {isSameUser && (
            <BaseButton
              onClick={() => router.push('/profile/edit')}
              label={pageContent['body-profile-edit-user-button']}
              customClass={`w-full font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ${
                darkMode
                  ? 'text-capx-light-bg border-capx-light-bg'
                  : 'text-capx-dark-box-bg border-capx-dark-box-bg'
              }`}
              imageUrl={darkMode ? EditIconWhite : EditIcon}
              imageAlt="Edit icon"
              imageWidth={20}
              imageHeight={20}
            />
          )}
        </div>
      </div>
    );
  }

  const imageSrc = getCorrectImage();
  const isDefaultAvatar = imageSrc === DEFAULT_AVATAR;
  return (
    <div className="flex flex-row gap-8 md:gap-12 lg:gap-[96px] mb-8 md:mb-12 lg:mb-[96px] flex-wrap">
      <div className="relative w-[200px] h-[200px] md:w-[250px] md:h-[250px] flex-shrink-0">
        <Image
          priority
          src={imageSrc}
          alt={
            isDefaultAvatar
              ? pageContent['alt-profile-picture-default'] || 'Default user profile picture'
              : pageContent['navbar-user-profile'] || 'User profile'
          }
          fill
          className="object-cover"
          unoptimized
          onError={e => {
            console.error('Error fetching avatar:', e);
            e.currentTarget.src = DEFAULT_AVATAR;
          }}
        />
      </div>
      <div className="flex flex-col gap-6 flex-1 min-w-0">
        <h1
          className={`text-[32px] md:text-[40px] lg:text-[48px] font-[Montserrat] font-normal break-words ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {pageContent['edit-profile-welcome']}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Image
            src={darkMode ? UserCircleIconWhite : UserCircleIcon}
            alt={pageContent['navbar-user-profile']}
            width={42}
            height={42}
            className="flex-shrink-0"
          />
          <span
            className={`text-[20px] md:text-[22px] lg:text-[24px] font-[Montserrat] font-bold break-words ${
              darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
            }`}
          >
            {username || 'Loading...'}
          </span>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-full">
          <BaseButton
            onClick={handleCopyLink}
            label={pageContent['body-profile-copy-link']}
            customClass={`w-full max-w-full font-[Montserrat] text-[20px] md:text-[22px] lg:text-[24px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ${
              darkMode
                ? 'text-capx-light-bg border-capx-light-bg'
                : 'text-capx-dark-box-bg border-capx-dark-box-bg'
            }`}
            imageUrl={darkMode ? CopyLinkIconWhite : CopyLinkIcon}
            imageAlt="Copy link"
            imageWidth={42}
            imageHeight={42}
          />
          {isSameUser && (
            <BaseButton
              onClick={() => router.push('/profile/edit')}
              label={pageContent['body-profile-edit-user-button']}
              customClass={`w-full max-w-full font-[Montserrat] text-[20px] md:text-[22px] lg:text-[24px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ${
                darkMode
                  ? 'text-capx-light-bg border-capx-light-bg'
                  : 'text-capx-dark-box-bg border-capx-dark-box-bg'
              }`}
              imageUrl={darkMode ? EditIconWhite : EditIcon}
              imageAlt="Edit icon"
              imageWidth={42}
              imageHeight={42}
            />
          )}
        </div>
      </div>
    </div>
  );
}
