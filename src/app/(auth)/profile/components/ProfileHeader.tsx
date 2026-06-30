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

const MOBILE_BUTTON_BASE =
  'w-full font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ';
const DESKTOP_BUTTON_BASE =
  'w-full max-w-full font-[Montserrat] text-[20px] md:text-[22px] lg:text-[24px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ';

// Resolve the avatar URL for the header (Wikidata image, avatar system, or default)
async function resolveAvatarUrl(
  avatar: number | undefined,
  wikidataQid: string | undefined,
  getAvatarById: (id: number) => Promise<any>
): Promise<string> {
  if (shouldUseWikidataImage(avatar, wikidataQid)) {
    const wikidataImage = await fetchWikidataImage(wikidataQid!);
    return wikidataImage || DEFAULT_AVATAR;
  }

  if (typeof avatar === 'number' && avatar > 0) {
    try {
      const avatarData = await getAvatarById(avatar);
      if (avatarData?.avatar_url) {
        return avatarData.avatar_url;
      }
    } catch (error) {
      console.error('Error fetching avatar:', error);
    }
  }

  return DEFAULT_AVATAR;
}

// Pick the image src given the (already loaded) avatarUrl and the avatar list
function resolveAvatarSrc(
  avatarUrl: string | null,
  avatar: number | undefined,
  avatars: any[] | undefined
): string {
  if (avatarUrl) {
    return avatarUrl;
  }
  if (avatar && avatar > 0) {
    const avatarData = avatars?.find(a => a.id === avatar);
    return avatarData?.avatar_url || DEFAULT_AVATAR;
  }
  return DEFAULT_AVATAR;
}

function getBookmarkIcon(isSaved: boolean, darkMode: boolean) {
  if (isSaved) {
    return darkMode ? BookmarkFilledWhite : BookmarkFilled;
  }
  return darkMode ? BookmarkWhite : Bookmark;
}

function getAvatarAlt(isDefaultAvatar: boolean, pageContent: any): string {
  return isDefaultAvatar
    ? pageContent['alt-profile-picture-default'] || 'Default user profile picture'
    : pageContent['navbar-user-profile'] || 'User profile';
}

interface ProfileActions {
  darkMode: boolean;
  pageContent: any;
  isSaved: boolean;
  canShowSaveButton: boolean;
  isSameUser: boolean;
  onCopyLink: () => void;
  onShowQr: () => void;
  onToggleSaved: () => void;
  onEdit: () => void;
}

function ProfileActionButtons({
  variant,
  darkMode,
  pageContent,
  isSaved,
  canShowSaveButton,
  isSameUser,
  onCopyLink,
  onShowQr,
  onToggleSaved,
  onEdit,
}: ProfileActions & { variant: 'mobile' | 'desktop' }) {
  const base = variant === 'mobile' ? MOBILE_BUTTON_BASE : DESKTOP_BUTTON_BASE;
  const imageSize = variant === 'mobile' ? 20 : 42;
  const colorClass = darkMode
    ? 'text-capx-light-bg border-capx-light-bg'
    : 'text-capx-dark-box-bg border-capx-dark-box-bg';
  const customClass = `${base}${colorClass}`;
  const wrapperClass =
    variant === 'mobile' ? 'flex flex-col gap-2' : 'flex flex-col gap-2 w-full max-w-full';

  return (
    <div className={wrapperClass}>
      <BaseButton
        onClick={onCopyLink}
        label={pageContent['body-profile-copy-link']}
        customClass={customClass}
        imageUrl={darkMode ? CopyLinkIconWhite : CopyLinkIcon}
        imageAlt="Copy link"
        imageWidth={imageSize}
        imageHeight={imageSize}
      />

      <BaseButton
        onClick={onShowQr}
        label={pageContent['body-profile-qr-code']}
        customClass={customClass}
        imageUrl={darkMode ? QrCodeIconWhite : QrCodeIcon}
        imageAlt="QR code"
        imageWidth={imageSize}
        imageHeight={imageSize}
      />

      {canShowSaveButton && (
        <BaseButton
          onClick={onToggleSaved}
          label={
            isSaved
              ? pageContent['saved-profiles-saved-profile'] || 'Saved'
              : pageContent['edit-profile-save'] || 'Save profile'
          }
          customClass={customClass}
          imageUrl={getBookmarkIcon(isSaved, darkMode)}
          imageAlt="Save profile"
          imageWidth={imageSize}
          imageHeight={imageSize}
        />
      )}

      {isSameUser && (
        <BaseButton
          onClick={onEdit}
          label={pageContent['body-profile-edit-user-button']}
          customClass={customClass}
          imageUrl={darkMode ? EditIconWhite : EditIcon}
          imageAlt="Edit icon"
          imageWidth={imageSize}
          imageHeight={imageSize}
        />
      )}
    </div>
  );
}

interface ProfileHeaderViewProps {
  imageSrc: string;
  isDefaultAvatar: boolean;
  username: string;
  actions: ProfileActions;
}

function ProfileHeaderMobile({
  imageSrc,
  isDefaultAvatar,
  username,
  actions,
}: ProfileHeaderViewProps) {
  const { darkMode, pageContent } = actions;
  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-[100px] h-[100px]">
        <Image
          priority
          src={imageSrc}
          alt={getAvatarAlt(isDefaultAvatar, pageContent)}
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
      <ProfileActionButtons variant="mobile" {...actions} />
    </div>
  );
}

function ProfileHeaderDesktop({
  imageSrc,
  isDefaultAvatar,
  username,
  actions,
}: ProfileHeaderViewProps) {
  const { darkMode, pageContent } = actions;
  return (
    <div className="flex flex-row gap-8 md:gap-12 lg:gap-[96px] mb-8 md:mb-12 lg:mb-[96px] flex-wrap">
      <div className="relative w-[200px] h-[200px] md:w-[250px] md:h-[250px] flex-shrink-0">
        <Image
          priority
          src={imageSrc}
          alt={getAvatarAlt(isDefaultAvatar, pageContent)}
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
        <ProfileActionButtons variant="desktop" {...actions} />
      </div>
    </div>
  );
}

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
    setAvatarUrl(await resolveAvatarUrl(avatar, wikidataQid, getAvatarById));
  }, [avatar, wikidataQid, getAvatarById]);

  useEffect(() => {
    loadAvatar();
  }, [loadAvatar]);

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

  const imageSrc = resolveAvatarSrc(avatarUrl, avatar, avatars);
  const isDefaultAvatar = imageSrc === DEFAULT_AVATAR;

  const actions: ProfileActions = {
    darkMode,
    pageContent,
    isSaved,
    canShowSaveButton,
    isSameUser,
    onCopyLink: handleCopyLink,
    onShowQr: () => setShowQrModal(true),
    onToggleSaved: handleToggleSaved,
    onEdit: () => router.push('/profile/edit'),
  };

  return (
    <>
      {isMobile ? (
        <ProfileHeaderMobile
          imageSrc={imageSrc}
          isDefaultAvatar={isDefaultAvatar}
          username={username}
          actions={actions}
        />
      ) : (
        <ProfileHeaderDesktop
          imageSrc={imageSrc}
          isDefaultAvatar={isDefaultAvatar}
          username={username}
          actions={actions}
        />
      )}
      <ProfileQrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        username={username}
      />
    </>
  );
}
