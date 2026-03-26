import { useSnackbar } from '@/app/providers/SnackbarProvider';
import BaseButton from '@/components/BaseButton';
import { useDarkMode, useIsMobile, usePageContent } from '@/stores';
import { useAvatars } from '@/hooks/useAvatars';
import { fetchWikidataImage, shouldUseWikidataImage } from '@/lib/utils/wikidataImage';
import EditIcon from '@/public/static/images/edit.svg';
import EditIconWhite from '@/public/static/images/edit_white.svg';
import CopyLinkIcon from '@/public/static/images/icons/copy_link.svg';
import CopyLinkIconWhite from '@/public/static/images/icons/copy_link_white.svg';
import UserCircleIcon from '@/public/static/images/supervised_user_circle.svg';
import UserCircleIconWhite from '@/public/static/images/supervised_user_circle_white.svg';
import Bookmark from '@/public/static/images/bookmark.svg';
import BookmarkFilled from '@/public/static/images/bookmark_filled.svg';
import BookmarkFilledWhite from '@/public/static/images/bookmark_filled_white.svg';
import BookmarkWhite from '@/public/static/images/bookmark_white.svg';
import QrCodeIcon from '@/public/static/images/icons/qr_code.svg';
import QrCodeIconWhite from '@/public/static/images/icons/qr_code_white.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSavedItems } from '@/hooks/useSavedItems';
import ProfileQrCodeModal from './ProfileQrCodeModal';
import { getPublicProfileUrl } from '@/lib/utils/profilePublicUrl';
const DEFAULT_AVATAR = '/static/images/person.svg';

interface ProfileHeaderProps {
  userId: number;
  username: string;
  avatar?: number;
  wikidataQid?: string;
  isSameUser: boolean;
}

export default function ProfileHeader({
  userId,
  username,
  avatar,
  wikidataQid,
  isSameUser,
}: ProfileHeaderProps) {
  const router = useRouter();
  const darkMode = useDarkMode();
  const isMobile = useIsMobile();
  const pageContent = usePageContent();
  const { getAvatarById, avatars } = useAvatars();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();
  const { data: session } = useSession();
  const { isProfileSaved, getSavedItemId, createSavedItem, deleteSavedItem } = useSavedItems();
  const canShowSaveButton = !!session?.user && !isSameUser;
  const isSaved = canShowSaveButton ? isProfileSaved(userId, false) : false;
  const [showQrModal, setShowQrModal] = useState(false);

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
      const profileUrl = getPublicProfileUrl(username);
      if (!profileUrl) throw new Error('Missing profile URL');
      await navigator.clipboard.writeText(profileUrl);
      showSnackbar(pageContent['body-profile-copy-link-success'], 'success');
    } catch (error) {
      console.error('Error copying link:', error);
      showSnackbar(pageContent['body-profile-copy-link-error'], 'error');
    }
  };

  const handleToggleSaved = async () => {
    if (!canShowSaveButton) return;

    try {
      if (isSaved) {
        const savedItemId = getSavedItemId(userId, false);
        if (!savedItemId) return;
        await deleteSavedItem(savedItemId);
        showSnackbar(pageContent['saved-profiles-delete-success'], 'success');
      } else {
        const success = await createSavedItem('user', userId, 'learner');
        if (success) {
          showSnackbar(pageContent['saved-profiles-add-success'], 'success');
        } else {
          showSnackbar(pageContent['saved-profiles-error'], 'error');
        }
      }
    } catch {
      showSnackbar(pageContent['saved-profiles-error'], 'error');
    }
  };

  if (!avatarUrl) {
    return null;
  }

  const imageSrc = getCorrectImage();
  const isDefaultAvatar = imageSrc === DEFAULT_AVATAR;

  if (isMobile) {
    return (
      <>
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

            <BaseButton
              onClick={() => setShowQrModal(true)}
              label={pageContent['body-profile-qr-code']}
              customClass={`w-full font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ${
                darkMode
                  ? 'text-capx-light-bg border-capx-light-bg'
                  : 'text-capx-dark-box-bg border-capx-dark-box-bg'
              }`}
              imageUrl={darkMode ? QrCodeIconWhite : QrCodeIcon}
              imageAlt="QR code"
              imageWidth={20}
              imageHeight={20}
            />

            {canShowSaveButton && (
              <BaseButton
                onClick={handleToggleSaved}
                label={
                  isSaved
                    ? pageContent['saved-profiles-saved-profile'] || 'Saved'
                    : pageContent['edit-profile-save'] || 'Save profile'
                }
                customClass={`w-full font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ${
                  darkMode
                    ? 'text-capx-light-bg border-capx-light-bg'
                    : 'text-capx-dark-box-bg border-capx-dark-box-bg'
                }`}
                imageUrl={
                  isSaved
                    ? darkMode
                      ? BookmarkFilledWhite
                      : BookmarkFilled
                    : darkMode
                      ? BookmarkWhite
                      : Bookmark
                }
                imageAlt="Save profile"
                imageWidth={20}
                imageHeight={20}
              />
            )}

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
        <ProfileQrCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          username={username}
        />
      </>
    );
  }

  return (
    <>
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
            <BaseButton
              onClick={() => setShowQrModal(true)}
              label={pageContent['body-profile-qr-code']}
              customClass={`w-full max-w-full font-[Montserrat] text-[20px] md:text-[22px] lg:text-[24px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ${
                darkMode
                  ? 'text-capx-light-bg border-capx-light-bg'
                  : 'text-capx-dark-box-bg border-capx-dark-box-bg'
              }`}
              imageUrl={darkMode ? QrCodeIconWhite : QrCodeIcon}
              imageAlt="QR code"
              imageWidth={42}
              imageHeight={42}
            />
            {canShowSaveButton && (
              <BaseButton
                onClick={handleToggleSaved}
                label={
                  isSaved
                    ? pageContent['saved-profiles-saved-profile'] || 'Saved'
                    : pageContent['edit-profile-save'] || 'Save profile'
                }
                customClass={`w-full max-w-full font-[Montserrat] text-[20px] md:text-[22px] lg:text-[24px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ${
                  darkMode
                    ? 'text-capx-light-bg border-capx-light-bg'
                    : 'text-capx-dark-box-bg border-capx-dark-box-bg'
                }`}
                imageUrl={
                  isSaved
                    ? darkMode
                      ? BookmarkFilledWhite
                      : BookmarkFilled
                    : darkMode
                      ? BookmarkWhite
                      : Bookmark
                }
                imageAlt="Save profile"
                imageWidth={42}
                imageHeight={42}
              />
            )}
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
      <ProfileQrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        username={username}
      />
    </>
  );
}
