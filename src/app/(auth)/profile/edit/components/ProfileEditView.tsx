'use client';

import { CapacitySearch } from '@/app/(auth)/capacity/components/CapacitySearch';
import BadgesCarousel from '@/components/BadgesCarousel';
import BadgeSelectionModal from '@/components/BadgeSelectionModal';
import Banner from '@/components/Banner';
import BaseButton from '@/components/BaseButton';
import LetsConnectPopup from '@/components/LetsConnectPopup';
import LoadingImage from '@/components/LoadingImage';
import Popup from '@/components/Popup';
import { DEFAULT_AVATAR, DEFAULT_AVATAR_WHITE, getDefaultAvatar } from '@/constants/images';
import { useApp } from '@/contexts/AppContext';
import { useBadges } from '@/contexts/BadgesContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAvatars } from '@/hooks/useAvatars';
import {
  addAffiliationToFormData,
  addLanguageToFormData,
  addProjectToFormData,
  addTerritoryToFormData,
} from '@/lib/utils/formDataUtils';
import AccountBoxIcon from '@/public/static/images/account_box.svg';
import AccountBoxIconWhite from '@/public/static/images/account_box_white.svg';
import AccountCircleIcon from '@/public/static/images/account_circle.svg';
import { default as AccountCircleIconWhite, default as LetsConnectIconWhite } from '@/public/static/images/account_circle_white.svg';
import AddIcon from '@/public/static/images/add.svg';
import AddIconDark from '@/public/static/images/add_dark.svg';
import AffiliationIcon from '@/public/static/images/affiliation.svg';
import AffiliationIconWhite from '@/public/static/images/affiliation_white.svg';
import ArrowDownIcon from '@/public/static/images/arrow_drop_down_circle.svg';
import ArrowDownIconWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';
import BarCodeIcon from '@/public/static/images/barcode.svg';
import BarCodeIconWhite from '@/public/static/images/barcode_white.svg';
import CancelIcon from '@/public/static/images/cancel.svg';
import CancelIconWhite from '@/public/static/images/cancel_white.svg';
import capxPersonIcon from '@/public/static/images/capx_person_icon.svg';
import ChangeCircleIcon from '@/public/static/images/change_circle.svg';
import ChangeCircleIconWhite from '@/public/static/images/change_circle_white.svg';
import CheckBoxFilledIcon from '@/public/static/images/check_box.svg';
import CheckBoxFilledIconWhite from '@/public/static/images/check_box_light.svg';
import CheckIcon from '@/public/static/images/check_box_outline_blank.svg';
import CheckIconWhite from '@/public/static/images/check_box_outline_blank_light.svg';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import DeleteIcon from '@/public/static/images/delete.svg';
import EmojiIcon from '@/public/static/images/emoji_objects.svg';
import EmojiIconWhite from '@/public/static/images/emoji_objects_white.svg';
import ExpandIcon from '@/public/static/images/expand_all.svg';
import ExpandIconWhite from '@/public/static/images/expand_all_white.svg';
import BadgesIcon from '@/public/static/images/icons/badges_icon.svg';
import BadgesIconWhite from '@/public/static/images/icons/badges_icon_white.svg';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import LetsConectBanner from '@/public/static/images/lets_connect.svg';
import LetsConect from '@/public/static/images/lets_connect_desktop.svg';
import LetsConectTextDesktop from '@/public/static/images/lets_connect_text_desktop.svg';
import LetsConectText from '@/public/static/images/lets_connect_text_img.svg';
import LetsConectTitle from '@/public/static/images/lets_connect_title.svg';
import LetsConectTitleLight from '@/public/static/images/lets_connect_title_light.svg';
import NeurologyIcon from '@/public/static/images/neurology.svg';
import NeurologyIconWhite from '@/public/static/images/neurology_white.svg';
import PersonIcon from '@/public/static/images/person_book.svg';
import PersonIconWhite from '@/public/static/images/person_book_white.svg';
import SaveIcon from '@/public/static/images/save_as.svg';
import TargetIcon from '@/public/static/images/target.svg';
import TargetIconWhite from '@/public/static/images/target_white.svg';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import UserCheckIcon from '@/public/static/images/user_check.svg';
import UserCheckIconDark from '@/public/static/images/user_check_dark.svg';
import WikiIcon from '@/public/static/images/wikimedia_logo_black.svg';
import WikiIconWhite from '@/public/static/images/wikimedia_logo_white.svg';
import { Capacity } from '@/types/capacity';
import { Profile } from '@/types/profile';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AvatarSelectionPopup from '../../components/AvatarSelectionPopup';

interface ProfileEditViewProps {
  selectedAvatar: any;
  handleAvatarSelect: (avatarId: number | null) => void;
  showAvatarPopup: boolean;
  setShowAvatarPopup: (show: boolean) => void;
  handleWikidataClick: (newWikidataSelected: boolean) => void;
  isWikidataSelected: boolean;
  showCapacityModal: boolean;
  setShowCapacityModal: (show: boolean) => void;
  handleCapacitySelect: (capacities: Capacity[]) => void;
  selectedCapacityType: 'known' | 'available' | 'wanted';
  handleAddCapacity: (type: 'known' | 'available' | 'wanted') => void;
  handleRemoveCapacity: (type: 'known' | 'available' | 'wanted', index: number) => void;
  handleRemoveLanguage: (index: number) => void;
  getCapacityName: (id: number) => string;
  handleAddProject: () => void;
  handleSubmit: () => void;
  handleCancel: () => void;
  handleDeleteProfile: () => void;
  formData: Partial<Profile>;
  setFormData: (data: Partial<Profile>) => void;
  territories: Record<string, string>;
  languages: Record<string, string>;
  affiliations: Record<string, string>;
  wikimediaProjects: Record<string, string>;
  profile: Profile;
  avatars: any[] | undefined;
  refetch: () => Promise<any>;
  goTo: (path: string) => void;
  isImageLoading: boolean;
  hasLetsConnectAccount: boolean;
  hasLetsConnectData: boolean;
  setIsImageLoading: (loading: boolean) => void;
  showLetsConnectPopup: boolean;
  setShowLetsConnectPopup: (show: boolean) => void;
  handleLetsConnectImport: () => void;
  isLetsConnectLoading: boolean;
}

export default function ProfileEditView(props: ProfileEditViewProps) {
  const {
    selectedAvatar,
    handleAvatarSelect,
    showAvatarPopup,
    setShowAvatarPopup,
    handleWikidataClick,
    isWikidataSelected,
    showCapacityModal,
    setShowCapacityModal,
    handleCapacitySelect,
    selectedCapacityType,
    handleAddCapacity,
    handleRemoveCapacity,
    handleRemoveLanguage,
    getCapacityName,
    handleAddProject,
    handleSubmit,
    handleCancel,
    handleDeleteProfile,
    formData,
    setFormData,
    territories,
    languages,
    affiliations,
    wikimediaProjects,
    avatars,
    profile,
    refetch,
    goTo,
    isImageLoading,
    hasLetsConnectData,
    hasLetsConnectAccount,
    setIsImageLoading,
    showLetsConnectPopup,
    setShowLetsConnectPopup,
    handleLetsConnectImport,
    isLetsConnectLoading,
  } = props;

  const router = useRouter();
  const { data: session } = useSession();
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const username = session?.user?.name;
  const [showDeleteProfilePopup, setShowDeleteProfilePopup] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const { userBadges, isLoading: isBadgesLoading, updateUserBadges } = useBadges();
  const [avatarUrl, setAvatarUrl] = useState<string>(getDefaultAvatar(darkMode));
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const completedBadges = userBadges.filter(badge => badge.progress === 100);
  const displayedBadges = completedBadges.filter(badge => badge.is_displayed);
  const getAvatarById = useAvatars();
  const [filteredProjects, setFilteredProjects] = useState<[string, string][]>([]);

  // Use effect to load the avatar once when the component mounts
  useEffect(() => {
    if (typeof profile?.avatar === 'number' && profile.avatar > 0) {
      (async () => {
        try {
          const avatarId = profile.avatar as number;
          const avatarData = await getAvatarById.getAvatarById(avatarId);
          if (avatarData?.avatar_url) {
            setAvatarUrl(avatarData.avatar_url);
          }
        } catch (error) {
          console.error('Error fetching avatar:', error);
        }
      })();
    }
  }, [profile?.avatar, getAvatarById]);

  // Update default avatar when dark mode changes
  useEffect(() => {
    if (!profile?.avatar || profile.avatar === 0) {
      setAvatarUrl(getDefaultAvatar(darkMode));
    }
  }, [darkMode, profile?.avatar]);

  // Close project selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showProjectSelector && !target.closest('.project-selector')) {
        setShowProjectSelector(false);
        setFilteredProjects([]);
      }
    };

    if (showProjectSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProjectSelector]);

  return (
    <>
      <div
        className={`relative w-full overflow-x-hidden min-h-screen ${
          darkMode ? 'bg-[#053749] text-white' : 'bg-white text-[#053749]'
        }`}
      >
        <section
          className={`w-full max-w-screen-xl mx-auto px-4 md:px-12 py-8 ${
            isMobile ? 'mt-[80px]' : 'mt-[64px]'
          }`}
        >
          <div className={`flex flex-col gap-6 ${isMobile ? '' : 'mx-[80px]'} mx-auto`}>
            {/* Header - Responsive */}
            <div className="flex flex-col gap-2">
              <h1
                className={`font-[Montserrat] text-[16px] md:text-[48px] not-italic font-normal leading-[29px] ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['edit-profile-welcome']}
              </h1>
              <div className="flex items-center gap-[6px] md:py-6">
                <div className="relative w-[24px] h-[24px] md:w-[48px] md:h-[48px]">
                  <Image
                    src={darkMode ? AccountCircleIconWhite : AccountCircleIcon}
                    alt="User circle icon"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <span
                  className={`text-start ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  } font-[Montserrat] text-[20px] md:text-[24px] font-extrabold`}
                >
                  {username}
                </span>
              </div>
            </div>

            {/* Action Buttons - Mobile shows first, Desktop shows later */}
            <div className="flex flex-col md:hidden gap-[10px]">
              <BaseButton
                onClick={handleSubmit}
                label={pageContent['edit-profile-save']}
                customClass="w-full flex items-center px-[13px] py-[6px] text-[14px] pb-[6px] bg-[#851970] text-white rounded-md py-3 font-bold !mb-0"
                imageUrl={SaveIcon}
                imageAlt="Save icon"
                imageWidth={20}
                imageHeight={20}
              />
              <BaseButton
                onClick={() => router.back()}
                label={pageContent['edit-profile-cancel']}
                customClass={`w-full flex items-center px-[13px] py-[6px] pb-[6px] text-[14px] border border-[#053749] text-[#053749] rounded-md py-3 font-bold mb-0 ${
                  darkMode
                    ? 'bg-transparent text-[#F6F6F6] border-[#F6F6F6] border-[2px]'
                    : 'bg-[#F6F6F6] border-[#053749] text-[#053749]'
                }`}
                imageUrl={darkMode ? CancelIconWhite : CancelIcon}
                imageAlt="Cancel icon"
                imageWidth={20}
                imageHeight={20}
              />
              <BaseButton
                onClick={() => setShowDeleteProfilePopup(true)}
                label={pageContent['edit-profile-delete-profile']}
                customClass={`w-full flex justify-between items-center px-[13px] py-[6px] pb-[6px] text-[14px] rounded-[4px] font-[Montserrat] font-extrabold text-capx-dark-box-bg mb-0 mt-2 bg-[#D43831] text-white`}
                imageUrl={DeleteIcon}
                imageAlt="Delete icon"
                imageWidth={20}
                imageHeight={20}
              />
            </div>

            {/* Desktop Action Buttons - only show on desktop */}
            <div className="hidden md:flex flex-row gap-6 mt-0 w-3/4">
              <BaseButton
                onClick={handleSubmit}
                label={pageContent['edit-profile-save']}
                customClass="w-full flex items-center text-[24px] px-8 py-4 bg-[#851970] text-white rounded-md py-3 font-bold mb-0"
                imageUrl={SaveIcon}
                imageAlt="Save icon"
                imageWidth={30}
                imageHeight={30}
              />
              <BaseButton
                onClick={() => router.back()}
                label={pageContent['edit-profile-cancel']}
                customClass={`w-full flex items-center text-[24px] px-8 py-4 border border-[#053749] text-[#053749] rounded-md py-3 font-bold mb-0 ${
                  darkMode
                    ? 'bg-transparent text-[#F6F6F6] border-[#F6F6F6] border-[2px]'
                    : 'bg-[#F6F6F6] border-[#053749] text-[#053749]'
                }`}
                imageUrl={darkMode ? CancelIconWhite : CancelIcon}
                imageAlt="Cancel icon"
                imageWidth={30}
                imageHeight={30}
              />
            </div>

            {/* Image Profile Section - Responsive layout */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-12 md:w-4/5">
              <div className="flex flex-col gap-4 w-full md:w-1/2">
                <div className="flex flex-row gap-1 items-center">
                  <div className="relative w-[20px] h-[20px] md:w-[48px] md:h-[48px]">
                    <Image
                      src={darkMode ? AccountBoxIconWhite : AccountBoxIcon}
                      alt="Account box icon"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h2
                    className={`${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    } font-[Montserrat] text-[16px] md:text-[24px] font-bold`}
                  >
                    {pageContent['edit-profile-image-title']}
                  </h2>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg md:h-full md:flex md:items-center md:justify-center">
                  <div className="w-32 h-32 md:w-64 md:h-64 mx-auto mb-4 md:mb-0 relative flex items-center justify-center">
                    {isImageLoading ? (
                      <LoadingImage />
                    ) : (
                      <Image
                        src={selectedAvatar.src || avatarUrl}
                        alt={
                          (selectedAvatar.src || avatarUrl) === DEFAULT_AVATAR ||
                          (selectedAvatar.src || avatarUrl) === DEFAULT_AVATAR_WHITE
                            ? pageContent['alt-profile-picture-default'] ||
                              'Default user profile picture'
                            : 'Selected avatar'
                        }
                        fill
                        className="object-contain"
                        onError={e => {
                          e.currentTarget.src = getDefaultAvatar(darkMode);
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 md:gap-4 w-full md:w-1/2 md:mt-12">
                <BaseButton
                  onClick={() => setShowAvatarPopup(true)}
                  label={pageContent['edit-profile-choose-avatar']}
                  customClass={`w-full flex px-[13px] py-[6px] pb-[6px] md:px-8 md:py-4 items-center rounded-[4px] md:rounded-[8px] ${
                    darkMode ? 'bg-capx-light-bg text-[#053749]' : 'bg-[#053749] text-[#F6F6F6]'
                  } font-[Montserrat] text-[12px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0`}
                  imageUrl={darkMode ? ChangeCircleIconWhite : ChangeCircleIcon}
                  imageAlt="Change circle icon"
                  imageWidth={isMobile ? 20 : 30}
                  imageHeight={isMobile ? 20 : 30}
                />

                <span
                  className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-normal ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  } hidden md:block`}
                >
                  {pageContent['edit-profile-choose-avatar-tooltip']}
                </span>

                {showAvatarPopup && (
                  <AvatarSelectionPopup
                    onClose={() => setShowAvatarPopup(false)}
                    onSelect={handleAvatarSelect}
                    selectedAvatarId={selectedAvatar.id}
                    onUpdate={refetch}
                  />
                )}

                <div className="flex flex-col items-center gap-2 w-full">
                  <BaseButton
                    onClick={() => handleWikidataClick(!isWikidataSelected)}
                    label={pageContent['edit-profile-use-wikidata-photograph']}
                    customClass={`w-full flex justify-between items-start px-[13px] py-[6px] md:items-center md:px-8 md:py-4 font-extrabold rounded-[4px] md:rounded-[8px] font-[Montserrat] text-[12px] md:text-[24px] appearance-none mb-0 pb-[6px] text-left ${
                      darkMode
                        ? 'bg-transparent border-white text-white placeholder-capx-dark-box-bg'
                        : 'border-[#053749]'
                    } border`}
                    imageUrl={
                      isWikidataSelected
                        ? darkMode
                          ? CheckBoxFilledIconWhite
                          : CheckBoxFilledIcon
                        : darkMode
                          ? CheckIconWhite
                          : CheckIcon
                    }
                    imageAlt="Check icon"
                    imageWidth={isMobile ? 20 : 30}
                    imageHeight={isMobile ? 20 : 30}
                  />
                  <span
                    className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {(() => {
                      const text = pageContent['edit-profile-consent-wikidata-before-link'] || '';
                      const parts = text.split('$1');
                      const link = (
                        <a
                          href="https://www.wikidata.org/wiki/Wikidata:Notability"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`underline ${
                            darkMode ? 'text-blue-300' : 'text-blue-600'
                          } hover:opacity-80`}
                        >
                          {pageContent['edit-profile-consent-wikidata-link']}
                        </a>
                      );
                      const nodes: (string | JSX.Element)[] = [];
                      for (const [index, part] of parts.entries()) {
                        if (index > 0) nodes.push(link);
                        nodes.push(part);
                      }
                      return nodes;
                    })()}
                  </span>
                </div>
                {hasLetsConnectData && !formData?.automated_lets_connect && (
                  <BaseButton
                    onClick={() => setShowLetsConnectPopup(true)}
                    label={pageContent['edit-profile-use-letsconnect']}
                    customClass={`w-full flex items-center px-[13px] py-[6px] text-[14px] md:text-[24px] pb-[6px] md:px-8 md:py-4 bg-[#851970] text-white rounded-md py-3 font-bold !mb-0`}
                    imageUrl={LetsConnectIconWhite}
                    imageAlt="LetsConnect icon"
                    imageWidth={isMobile ? 20 : 30}
                    imageHeight={isMobile ? 20 : 30}
                    disabled={isLetsConnectLoading}
                  />
                )}

                {/* Delete button - only show on desktop */}
                <BaseButton
                  onClick={() => setShowDeleteProfilePopup(true)}
                  label={pageContent['edit-profile-delete-profile']}
                  customClass={`w-full hidden md:flex justify-between items-center px-8 py-4 rounded-[8px] font-[Montserrat] text-[24px] font-extrabold text-capx-dark-box-bg mb-0 mt-4 bg-[#D43831] text-white`}
                  imageUrl={DeleteIcon}
                  imageAlt="Delete icon"
                  imageWidth={30}
                  imageHeight={30}
                />

                {showDeleteProfilePopup && (
                  <Popup
                    title={pageContent['edit-profile-delete-profile']}
                    image={capxPersonIcon}
                    onClose={() => setShowDeleteProfilePopup(false)}
                    onContinue={handleDeleteProfile}
                    continueButtonLabel={pageContent['edit-profile-delete-profile-confirm']}
                    closeButtonLabel={pageContent['edit-profile-delete-profile-cancel']}
                  />
                )}
              </div>
            </div>

            {/* Badges Section */}
            <div className="flex items-center gap-2 mt-4 mb-4">
              <Image
                src={darkMode ? BadgesIconWhite : BadgesIcon}
                alt="Badges icon"
                width={isMobile ? 20 : 48}
                height={isMobile ? 20 : 48}
              />
              <h2
                className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['body-profile-badges-title']}
              </h2>
            </div>

            {isBadgesLoading && (
              <div className="flex flex-col gap-2">
                <div className="w-full h-[48px] bg-gray-200 rounded-md mb-2"></div>
              </div>
            )}

            {displayedBadges.length > 0 && !isBadgesLoading ? (
              <BadgesCarousel badges={displayedBadges} showFullDescription={false} />
            ) : (
              !isBadgesLoading && (
                <span
                  className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['body-profile-badges-no-badges']}
                </span>
              )
            )}

            {userBadges.length > 0 && (
              <BaseButton
                onClick={() => setShowBadgeModal(true)}
                label={pageContent['body-profile-badges-edit-your-badges']}
                customClass={`w-full md:w-fit flex ${
                  darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
                } rounded-md py-2 font-[Montserrat] text-[12px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] md:px-8 md:py-4 items-center gap-[4px] mt-4 md:mb-4`}
                imageUrl={darkMode ? ChangeCircleIconWhite : ChangeCircleIcon}
                imageAlt={pageContent['body-profile-badges-edit-your-badges']}
                imageWidth={isMobile ? 20 : 30}
                imageHeight={isMobile ? 20 : 30}
              />
            )}
            <div className="flex flex-col gap-2">
              <BaseButton
                onClick={() => router.push('/profile/badges')}
                label={pageContent['body-profile-badges-see-all']}
                customClass={`w-full md:w-fit flex mb-2 md:mb-4 border ${
                  darkMode ? 'border-white text-white' : 'border-[#053749] text-[#053749]'
                } rounded-md py-2 font-[Montserrat] text-[12px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] md:px-8 md:py-4 items-center gap-[4px]`}
                imageUrl={darkMode ? ExpandIconWhite : ExpandIcon}
                imageAlt="View all badges"
                imageWidth={isMobile ? 20 : 30}
                imageHeight={isMobile ? 20 : 30}
              />

              <span
                className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['body-profile-badges-description']}
              </span>
            </div>

            {/* Mini Bio Section */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-2 items-center">
                <Image
                  src={darkMode ? PersonIconWhite : PersonIcon}
                  alt="Person icon"
                  width={isMobile ? 16 : 48}
                  height={isMobile ? 16 : 48}
                  style={{ objectFit: 'cover' }}
                />
                <h2
                  className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['edit-profile-mini-bio']}
                </h2>
              </div>
              <div className="flex w-full px-[4px] py-[6px] md:px-3 md:py-4 flex-col items-start gap-[14px] rounded-[4px] md:rounded-[16px] border-[1px] border-[solid] border-capx-light-bg">
                <textarea
                  value={formData.about || ''}
                  onChange={e => setFormData({ ...formData, about: e.target.value })}
                  placeholder={pageContent['edit-profile-mini-bio-placeholder']}
                  className={`w-full font-[Montserrat] text-[13px] md:text-[24px] not-italic font-normal leading-[normal] bg-transparent resize-none min-h-[100px] rounded-[4px] md:rounded-[16px] border-[1px] border-[solid] border-[#053749] py-2 px-2 md:px-8 md:py-4 scrollbar-hide ${
                    darkMode
                      ? 'text-white placeholder-gray-400'
                      : 'text-[#053749] placeholder-[#829BA4]'
                  }`}
                />
              </div>
              <span
                className={`font-[Montserrat] text-[12px] md:text-[20px] not-italic font-normal leading-[15px] md:leading-normal ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['edit-profile-mini-bio-tooltip']}
              </span>
            </div>

            {/* Capacities Sections */}
            <div className="space-y-6">
              {/* Known Capacities */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? NeurologyIconWhite : NeurologyIcon}
                    alt="Neurology icon"
                    width={isMobile ? 20 : 48}
                    height={isMobile ? 20 : 48}
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-section-title-known-capacity']}
                  </h2>
                </div>
                <div
                  className={`flex flex-wrap gap-2 rounded-[4px] md:rounded-[16px] ${
                    darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'
                  } w-full px-[4px] py-[6px] md:px-3 md:py-6 items-start gap-[12px]`}
                >
                  {formData?.skills_known?.map((capacity, index) => (
                    <div key={index} className="flex items-center gap-1 rounded-md">
                      <BaseButton
                        onClick={() => handleRemoveCapacity('known', index)}
                        label={getCapacityName(capacity)}
                        customClass="rounded-[4px] border-[1px] md:border-2 border-[solid] !mb-0 border-[var(--Links-light-link,#0070B9)] flex p-[4px] pb-[4px] md:py-4 md:px-4 justify-center items-center gap-[4px] font-[Montserrat] text-[12px] md:text-[24px] not-italic font-normal leading-[normal]"
                        imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                        imageAlt="Close icon"
                        imageWidth={isMobile ? 16 : 24}
                        imageHeight={isMobile ? 16 : 24}
                      />
                    </div>
                  ))}
                </div>
                <BaseButton
                  onClick={() => handleAddCapacity('known')}
                  label={pageContent['edit-profile-add-capacities']}
                  customClass={`w-full md:w-fit flex ${
                    darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
                  } rounded-md py-2 font-[Montserrat] text-[12px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] md:px-8 md:py-4 items-center gap-[4px]`}
                  imageUrl={darkMode ? AddIconDark : AddIcon}
                  imageAlt="Add capacity"
                  imageWidth={isMobile ? 20 : 30}
                  imageHeight={isMobile ? 20 : 30}
                />
                <span
                  className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['edit-profile-select-skills']}
                </span>
              </div>

              {/* Available Capacities */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? EmojiIconWhite : EmojiIcon}
                    alt="Available capacities icon"
                    width={isMobile ? 20 : 48}
                    height={isMobile ? 20 : 48}
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-section-title-available-capacity']}
                  </h2>
                </div>
                <div
                  className={`flex flex-wrap gap-2 rounded-[4px] md:rounded-[16px] ${
                    darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'
                  } w-full px-[4px] py-[6px] md:px-3 md:py-6 items-start gap-[12px]`}
                >
                  {formData?.skills_available?.map((capacity, index) => (
                    <div key={index} className="flex items-center gap-1 rounded-md">
                      <BaseButton
                        onClick={() => handleRemoveCapacity('available', index)}
                        label={getCapacityName(capacity)}
                        customClass="rounded-[4px] border-[1px] border-[solid] !mb-0 border-[var(--Links-light-link,#05A300)] flex p-[4px] pb-[4px] md:py-4 md:px-4 justify-center items-center gap-[4px] font-[Montserrat] text-[12px] md:text-[24px] not-italic font-normal leading-[normal]"
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
                    onClick={() => handleAddCapacity('available')}
                    label={pageContent['edit-profile-add-capacities']}
                    customClass={`w-full md:w-fit flex ${
                      darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
                    } rounded-md py-2 font-[Montserrat] text-[12px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] md:px-8 md:py-4 items-center gap-[4px]`}
                    imageUrl={darkMode ? AddIconDark : AddIcon}
                    imageAlt="Add capacity"
                    imageWidth={isMobile ? 20 : 30}
                    imageHeight={isMobile ? 20 : 30}
                  />
                  <BaseButton
                    onClick={() => {
                      const knownCapacities = formData?.skills_known || [];
                      const availableCapacities = formData?.skills_available || [];
                      const newAvailable = Array.from(
                        new Set([...availableCapacities, ...knownCapacities])
                      );
                      setFormData({ ...formData, skills_available: newAvailable });
                    }}
                    label={
                      pageContent['edit-profile-import-known-capacities'] ||
                      'Import Known Capacities'
                    }
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
                </div>
                <span
                  className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {isMobile
                    ? 'From your known capacities, choose those you are available to share.'
                    : pageContent['edit-profile-available-capacities']}
                </span>
              </div>

              {/* Wanted Capacities */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? TargetIconWhite : TargetIcon}
                    alt="Wanted capacities icon"
                    width={isMobile ? 20 : 48}
                    height={isMobile ? 20 : 48}
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-section-title-wanted-capacity']}
                  </h2>
                </div>
                <div
                  className={`flex flex-wrap gap-2 rounded-[4px] md:rounded-[16px] ${
                    darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'
                  } w-full px-[4px] py-[6px] md:px-3 md:py-6 items-start gap-[12px]`}
                >
                  {formData?.skills_wanted?.map((capacity, index) => (
                    <div key={index} className="flex items-center gap-1 rounded-md">
                      <BaseButton
                        onClick={() => handleRemoveCapacity('wanted', index)}
                        label={getCapacityName(capacity)}
                        customClass="rounded-[4px] border-[1px] border-[solid] !mb-0 border-[var(--Links-light-link,#D43831)] flex p-[4px] pb-[4px] md:px-2 md:py-2 md:pb-2 justify-center items-center gap-[4px] font-[Montserrat] text-[12px] md:text-[24px] not-italic font-normal leading-[normal]"
                        imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                        imageAlt="Close icon"
                        imageWidth={isMobile ? 16 : 24}
                        imageHeight={isMobile ? 16 : 24}
                      />
                    </div>
                  ))}
                </div>
                <BaseButton
                  onClick={() => handleAddCapacity('wanted')}
                  label={pageContent['edit-profile-add-capacities']}
                  customClass={`w-full md:w-fit flex ${
                    darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
                  } rounded-md py-2 font-[Montserrat] text-[12px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] md:px-8 md:py-4 items-center gap-[4px]`}
                  imageUrl={darkMode ? AddIconDark : AddIcon}
                  imageAlt="Add capacity"
                  imageWidth={isMobile ? 20 : 30}
                  imageHeight={isMobile ? 20 : 30}
                />
                <span
                  className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['edit-profile-wanted-capacities']}
                </span>
              </div>

              {/* Languages Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? LanguageIconWhite : LanguageIcon}
                    alt="Language icon"
                    width={isMobile ? 20 : 48}
                    height={isMobile ? 20 : 48}
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-languages-title']}
                  </h2>
                </div>

                {/* Language List */}
                <div className="flex flex-wrap gap-2">
                  {formData.language?.map((lang, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded ${
                        darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
                      }`}
                    >
                      <span className="font-[Montserrat] text-[12px] md:text-[24px]">
                        {languages[lang.id]}
                      </span>
                      <select
                        value={lang.proficiency}
                        onChange={e => {
                          const newLanguages = [...(formData.language || [])];
                          newLanguages[index] = {
                            ...newLanguages[index],
                            proficiency: e.target.value,
                          };
                          setFormData({
                            ...formData,
                            language: newLanguages,
                          });
                        }}
                        className={`ml-2 p-1 rounded border text-[12px] md:text-[24px] ${
                          darkMode
                            ? 'bg-transparent border-white text-white'
                            : 'border-[#053749] text-[#829BA4]'
                        }`}
                        style={{
                          backgroundColor: darkMode ? '#053749' : 'white',
                          color: darkMode ? 'white' : '#053749',
                        }}
                      >
                        <option
                          value="0"
                          style={{
                            backgroundColor: darkMode ? '#053749' : 'white',
                            color: darkMode ? 'white' : '#053749',
                          }}
                        >
                          {pageContent['profiency-level-not-proficient']}
                        </option>
                        <option
                          value="1"
                          style={{
                            backgroundColor: darkMode ? '#053749' : 'white',
                            color: darkMode ? 'white' : '#053749',
                          }}
                        >
                          {pageContent['profiency-level-basic']}
                        </option>
                        <option
                          value="2"
                          style={{
                            backgroundColor: darkMode ? '#053749' : 'white',
                            color: darkMode ? 'white' : '#053749',
                          }}
                        >
                          {pageContent['profiency-level-intermediate']}
                        </option>
                        <option
                          value="3"
                          style={{
                            backgroundColor: darkMode ? '#053749' : 'white',
                            color: darkMode ? 'white' : '#053749',
                          }}
                        >
                          {pageContent['profiency-level-advanced']}
                        </option>
                        <option
                          value="4"
                          style={{
                            backgroundColor: darkMode ? '#053749' : 'white',
                            color: darkMode ? 'white' : '#053749',
                          }}
                        >
                          {pageContent['profiency-level-almost-native']}
                        </option>
                        <option
                          value="5"
                          style={{
                            backgroundColor: darkMode ? '#053749' : 'white',
                            color: darkMode ? 'white' : '#053749',
                          }}
                        >
                          {pageContent['profiency-level-professional']}
                        </option>
                        <option
                          value="n"
                          style={{
                            backgroundColor: darkMode ? '#053749' : 'white',
                            color: darkMode ? 'white' : '#053749',
                          }}
                        >
                          {pageContent['profiency-level-native']}
                        </option>
                      </select>
                      <button onClick={() => handleRemoveLanguage(index)} className="ml-2">
                        <Image
                          src={darkMode ? CloseIconWhite : CloseIcon}
                          alt="Remove language"
                          width={isMobile ? 16 : 24}
                          height={isMobile ? 16 : 24}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Language Select */}
                <div className="relative">
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value) {
                        const languageId = Number(e.target.value);
                        const languageName = languages[e.target.value];
                        setFormData(addLanguageToFormData(formData, languageId, '3', languageName));
                      }
                    }}
                    className={`w-full px-4 py-2 rounded-[4px] md:rounded-[16px] font-[Montserrat] text-[12px] md:text-[24px] appearance-none ${
                      darkMode
                        ? 'bg-transparent border-white text-white opacity-50'
                        : 'border-[#053749] text-[#829BA4]'
                    } border`}
                    style={{
                      backgroundColor: darkMode ? '#053749' : 'white',
                      color: darkMode ? 'white' : '#053749',
                    }}
                  >
                    <option value="">{pageContent['edit-profile-add-language']}</option>
                    {Object.entries(languages).map(([id, name]) => (
                      <option
                        key={id}
                        value={id}
                        style={{
                          backgroundColor: darkMode ? '#053749' : 'white',
                          color: darkMode ? 'white' : '#053749',
                        }}
                      >
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Image
                      src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
                      alt="Select"
                      width={isMobile ? 20 : 24}
                      height={isMobile ? 20 : 24}
                    />
                  </div>
                </div>
              </div>

              <span
                className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['edit-profile-language-tooltip']}
              </span>

              {/* Alternative Wikimedia Account */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? WikiIconWhite : WikiIcon}
                    alt="Alternative account icon"
                    width={isMobile ? 20 : 48}
                    height={isMobile ? 20 : 48}
                  />
                  <h2
                    className={`font-[Montserrat] text-[12px] md:text-[24px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-box-title-alt-wiki-acc']}
                  </h2>
                </div>
                <input
                  type="text"
                  placeholder={pageContent['edit-profile-insert-item']}
                  value={formData.wiki_alt}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      wiki_alt: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2 rounded-[4px] md:rounded-[16px] font-[Montserrat] text-[12px] md:text-[24px] ${
                    darkMode
                      ? 'bg-transparent border-white text-white opacity-50 placeholder-gray-400'
                      : 'border-[#053749] text-[#829BA4]'
                  } border`}
                />
                <span
                  className={`text-[12px] md:text-[20px] md:text-[24px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['edit-profile-share-username']}
                </span>
              </div>

              {/* Affiliation Section */}
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? AffiliationIconWhite : AffiliationIcon}
                    alt="Affiliation icon"
                    width={isMobile ? 20 : 48}
                    height={isMobile ? 20 : 48}
                  />
                  <h2
                    className={`font-[Montserrat] text-[12px] md:text-[24px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-section-title-affiliation']}
                  </h2>
                </div>

                {/* Lista de Afiliações Selecionadas */}
                <div className="flex flex-wrap gap-2">
                  {formData.affiliation?.map((affId, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded ${
                        darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
                      }`}
                    >
                      <span className="font-[Montserrat] text-[12px] md:text-[24px]">
                        {affiliations[affId]}
                      </span>
                      <button
                        onClick={() => {
                          const newAffiliations = formData.affiliation?.filter(
                            (_, i) => i !== index
                          );
                          setFormData({
                            ...formData,
                            affiliation: newAffiliations,
                          });
                        }}
                        className="ml-2"
                      >
                        <Image
                          src={darkMode ? CloseIconWhite : CloseIcon}
                          alt="Remove affiliation"
                          width={isMobile ? 16 : 24}
                          height={isMobile ? 16 : 24}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Dropdown para adicionar nova afiliação */}
                <div className="relative">
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value) {
                        setFormData(addAffiliationToFormData(formData, e.target.value));
                      }
                    }}
                    className={`w-full px-4 py-2 rounded-[4px] md:rounded-[16px] font-[Montserrat] text-[12px] md:text-[24px] appearance-none ${
                      darkMode
                        ? 'bg-transparent border-white text-white opacity-50 placeholder-gray-400'
                        : 'border-[#053749] text-[#829BA4]'
                    } border`}
                    style={{
                      backgroundColor: darkMode ? '#053749' : 'white',
                      color: darkMode ? 'white' : '#053749',
                    }}
                  >
                    <option value="">{pageContent['edit-profile-insert-item']}</option>
                    {Object.entries(affiliations).map(([id, name]) => (
                      <option
                        key={id}
                        value={id}
                        style={{
                          backgroundColor: darkMode ? '#053749' : 'white',
                          color: darkMode ? 'white' : '#053749',
                        }}
                      >
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Image
                      src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
                      alt="Select"
                      width={isMobile ? 20 : 24}
                      height={isMobile ? 20 : 24}
                    />
                  </div>
                </div>

                <span
                  className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['body-profile-section-affiliation-dropdown-menu']}
                </span>
              </div>

              {/* Territory */}
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? TerritoryIconWhite : TerritoryIcon}
                    alt="Territory icon"
                    width={isMobile ? 20 : 48}
                    height={isMobile ? 20 : 48}
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-section-title-territory']}
                  </h2>
                </div>

                {/* Territory List */}
                <div className="flex flex-wrap gap-2">
                  {formData.territory?.map((territoryId, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded ${
                        darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
                      }`}
                    >
                      <span className="font-[Montserrat] text-[12px] md:text-[24px]">
                        {territories[territoryId]}
                      </span>
                      <button
                        onClick={() => {
                          const newTerritories = formData.territory?.filter((_, i) => i !== index);
                          setFormData({
                            ...formData,
                            territory: newTerritories,
                          });
                        }}
                        className="ml-2"
                      >
                        <Image
                          src={darkMode ? CloseIconWhite : CloseIcon}
                          alt="Remove territory"
                          width={isMobile ? 16 : 24}
                          height={isMobile ? 16 : 24}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Territory Select */}
                <div className="relative">
                  <select
                    value=""
                    onChange={e => {
                      const selected = e.target.value;
                      if (selected) {
                        setFormData(addTerritoryToFormData(formData, selected));
                      }
                    }}
                    className={`w-full px-4 py-2 rounded-[4px] md:rounded-[16px] font-[Montserrat] text-[12px] md:text-[24px] appearance-none ${
                      darkMode
                        ? 'bg-transparent border-white text-white opacity-50'
                        : 'border-[#053749] text-[#829BA4]'
                    } border`}
                    style={{
                      backgroundColor: darkMode ? '#053749' : 'white',
                      color: darkMode ? 'white' : '#053749',
                    }}
                  >
                    <option value="">{pageContent['edit-profile-insert-item']}</option>
                    {Object.entries(territories).map(([id, name]) => (
                      <option
                        key={id}
                        value={id}
                        style={{
                          backgroundColor: darkMode ? '#053749' : 'white',
                          color: darkMode ? 'white' : '#053749',
                        }}
                      >
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Image
                      src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
                      alt="Select"
                      width={isMobile ? 20 : 24}
                      height={isMobile ? 20 : 24}
                    />
                  </div>
                </div>

                <span
                  className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['edit-profile-territory']}
                </span>
              </div>

              {/* Wikidata Item */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? BarCodeIconWhite : BarCodeIcon}
                    alt="Wikidata item icon"
                    width={isMobile ? 20 : 24}
                    height={isMobile ? 20 : 24}
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['edit-profile-wikidata-item']}
                  </h2>
                </div>
                <div className="flex items-center gap-2 py-[6px]">
                  <BaseButton
                    onClick={() => handleWikidataClick(!isWikidataSelected)}
                    label={pageContent['edit-profile-use-wikidata-item']}
                    customClass={`w-full flex justify-between items-center px-[13px] py-[6px] rounded-[4px] md:rounded-[16px] font-[Montserrat] text-[12px] md:text-[24px] appearance-none mb-0 pb-[6px] ${
                      darkMode
                        ? 'bg-transparent border-white text-white opacity-50 placeholder-gray-400'
                        : 'border-[#053749] text-[#829BA4]'
                    } border`}
                    imageUrl={
                      isWikidataSelected
                        ? darkMode
                          ? CheckBoxFilledIconWhite
                          : CheckBoxFilledIcon
                        : darkMode
                          ? CheckIconWhite
                          : CheckIcon
                    }
                    imageAlt="Check icon"
                    imageWidth={isMobile ? 20 : 24}
                    imageHeight={isMobile ? 20 : 24}
                  />
                </div>
                <span
                  className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {(() => {
                    const text = pageContent['edit-profile-consent-wikidata-item-before-link'];
                    const parts = text.split('$1');
                    const link = (
                      <a
                        href="https://www.wikidata.org/wiki/Wikidata:Notability"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline ${darkMode ? 'text-blue-300' : 'text-blue-600'} hover:opacity-80`}
                      >
                        {pageContent['edit-profile-consent-wikidata-link']}
                      </a>
                    );
                    const nodes: (string | JSX.Element)[] = [];
                    for (const [index, part] of parts.entries()) {
                      if (index > 0) nodes.push(<span key={`link-${index}`}>{link}</span>);
                      nodes.push(<span key={`part-${index}`}>{part}</span>);
                    }
                    return nodes;
                  })()}
                </span>
              </div>

              {/* Wikimedia Projects */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? WikiIconWhite : WikiIcon}
                    alt="Wikimedia projects icon"
                    width={isMobile ? 20 : 48}
                    height={isMobile ? 20 : 48}
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-wikimedia-projects-title']}
                  </h2>
                </div>

                {/* Display selected projects as tags with delete button */}
                <div
                  className={`flex flex-wrap gap-2 rounded-[4px] md:rounded-[16px] ${
                    darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'
                  } w-full px-[4px] py-[6px] md:px-3 md:py-6 items-start gap-[12px]`}
                >
                  {formData?.wikimedia_project?.map((projectId, index) => (
                    <div key={index} className="flex items-center gap-1 rounded-md">
                      <BaseButton
                        onClick={() => {
                          const newProjects = [...(formData.wikimedia_project || [])];
                          newProjects.splice(index, 1);
                          setFormData({
                            ...formData,
                            wikimedia_project: newProjects,
                          });
                        }}
                        label={wikimediaProjects[projectId] || projectId}
                        customClass="rounded-[4px] md:rounded-[16px] border-[1px] border-[solid] border-[var(--Links-light-link,#0070B9)] flex p-[4px] pb-[4px] md:py-4 md:px-4 justify-center items-center gap-[4px] font-[Montserrat] text-[12px] md:text-[24px] not-italic font-normal leading-[normal]"
                        imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                        imageAlt="Remove project"
                        imageWidth={isMobile ? 16 : 24}
                        imageHeight={isMobile ? 16 : 24}
                      />
                    </div>
                  ))}
                </div>

                {/* Selector for adding new projects - only shown when button is clicked */}
                {showProjectSelector && (
                  <div className="relative project-selector">
                    <input
                      type="text"
                      placeholder={pageContent['edit-profile-insert-project']}
                      onChange={e => {
                        const searchTerm = e.target.value.toLowerCase();
                        const filteredProjects = Object.entries(wikimediaProjects).filter(
                          ([id, name]) => name.toLowerCase().includes(searchTerm)
                        );
                        setFilteredProjects(filteredProjects);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Escape') {
                          setShowProjectSelector(false);
                          setFilteredProjects([]);
                        }
                      }}
                      className={`w-full px-4 py-2 rounded-[4px] md:rounded-[16px] font-[Montserrat] text-[12px] md:text-[24px] ${
                        darkMode
                          ? 'bg-transparent border-white text-white placeholder-gray-400'
                          : 'border-[#053749] text-[#053749]'
                      } border`}
                      style={{
                        backgroundColor: darkMode ? '#053749' : 'white',
                      }}
                      autoFocus
                    />

                    {/* Dropdown with filtered projects */}
                    <div
                      className={`absolute top-full left-0 right-0 mt-1 max-h-40 md:max-h-60 overflow-y-auto rounded-[4px] md:rounded-[16px] border ${
                        darkMode ? 'bg-[#053749] border-white' : 'bg-white border-[#053749]'
                      } z-50 shadow-lg`}
                    >
                      {filteredProjects.length > 0 ? (
                        filteredProjects.map(([id, name]) => (
                          <button
                            key={id}
                            onClick={() => {
                              setFormData(addProjectToFormData(formData, id));
                              setShowProjectSelector(false);
                              setFilteredProjects([]);
                            }}
                            className={`w-full px-4 py-2 md:py-3 text-left font-[Montserrat] text-[12px] md:text-[20px] hover:bg-opacity-80 transition-colors ${
                              darkMode
                                ? 'text-white hover:bg-white hover:bg-opacity-10 hover:text-[#053749]'
                                : 'text-[#053749] hover:bg-gray-100'
                            }`}
                          >
                            {name}
                          </button>
                        ))
                      ) : (
                        <div
                          className={`px-4 py-2 md:py-3 font-[Montserrat] text-[12px] md:text-[18px] ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {pageContent['edit-profile-no-projects-found'] ||
                            'Nenhum projeto encontrado'}
                        </div>
                      )}
                    </div>

                    {/* Close button */}
                    <button
                      onClick={() => {
                        setShowProjectSelector(false);
                        setFilteredProjects([]);
                      }}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                        darkMode ? 'hover:bg-white hover:bg-opacity-10' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Image
                        src={darkMode ? CloseIconWhite : CloseIcon}
                        alt="Close"
                        width={isMobile ? 16 : 20}
                        height={isMobile ? 16 : 20}
                      />
                    </button>
                  </div>
                )}

                <BaseButton
                  onClick={() => {
                    setShowProjectSelector(true);
                    setFilteredProjects(Object.entries(wikimediaProjects));
                  }}
                  label={pageContent['edit-profile-add-projects']}
                  customClass={`w-full md:w-1/4 flex ${
                    darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
                  } rounded-md py-2 font-[Montserrat] text-[14px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0 px-[13px] py-[6px] md:px-8 md:py-4 items-center gap-[4px]`}
                  imageUrl={darkMode ? AddIconDark : AddIcon}
                  imageAlt="Add project"
                  imageWidth={isMobile ? 20 : 30}
                  imageHeight={isMobile ? 20 : 30}
                />
                <span
                  className={`text-[12px] md:text-[20px] md:text-[24px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['edit-profile-wikimedia-projects']}
                </span>
              </div>
            </div>

            {/* Let's Connect Section */}
            <div className="flex flex-col">
              <div className="w-[300px] md:w-[580px] h-auto">
                <Image
                  src={darkMode ? LetsConectTitleLight : LetsConectTitle}
                  alt="Let's Connect"
                  className="w-full h-auto"
                  priority
                />
              </div>
              <p
                className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-[30px] mb-4  ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['lets-connect-edit-user-info-1']}
              </p>
              <div className={`${isMobile ? 'bg-[#EFEFEF] pb-[6px] rounded-2 mb-4' : ''}`}>
                <Banner
                  image={isMobile ? LetsConectBanner : LetsConect}
                  alt={pageContent['lets-connect-alt-banner']}
                  title={{
                    mobile: LetsConectText,
                    desktop: LetsConectTextDesktop,
                  }}
                  customClass={{
                    background: 'bg-[#EFEFEF]',
                    wrapper: isMobile ? '' : 'mb-0',
                  }}
                />
              </div>
              <BaseButton
                onClick={() => goTo('/profile/lets_connect')}
                label={
                  hasLetsConnectAccount
                    ? pageContent['lets-connect-form-user-button-update-profile']
                    : pageContent['lets-connect-form-user-edit']
                }
                customClass={`w-full md:w-1/2 flex ${
                  darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
                } rounded-md py-2 font-[Montserrat] text-[14px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] md:px-8 md:py-4 items-center gap-[4px]`}
                imageUrl={darkMode ? UserCheckIconDark : UserCheckIcon}
                imageAlt="Add project"
                imageWidth={isMobile ? 20 : 30}
                imageHeight={isMobile ? 20 : 30}
              />
              <p
                className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-[30px] mt-4  ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['lets-connect-edit-user-info-2']}
              </p>
            </div>

            {/* Action Buttons - Bottom (Mobile and Desktop) */}
            <div className="flex flex-col md:flex-row gap-[10px] md:gap-6 mt-6">
              <BaseButton
                onClick={handleSubmit}
                label={pageContent['edit-profile-save']}
                customClass="w-full flex items-center px-[13px] py-[6px] pb-[6px] md:text-[24px] md:px-8 md:py-4 bg-[#851970] text-white rounded-md py-3 font-bold mb-0"
                imageUrl={SaveIcon}
                imageAlt="Save icon"
                imageWidth={isMobile ? 20 : 30}
                imageHeight={isMobile ? 20 : 30}
              />
              <BaseButton
                onClick={() => router.back()}
                label={pageContent['edit-profile-cancel']}
                customClass={`w-full flex items-center px-[13px] py-[6px] pb-[6px] md:text-[24px] md:px-8 md:py-4 border ${
                  darkMode ? 'border-white text-white' : 'border-[#053749] text-[#053749]'
                } rounded-md py-3 font-bold mb-0`}
                imageUrl={darkMode ? CancelIconWhite : CancelIcon}
                imageAlt="Cancel icon"
                imageWidth={isMobile ? 20 : 30}
                imageHeight={isMobile ? 20 : 30}
              />
            </div>
          </div>
        </section>
      </div>

      {showCapacityModal && (
        <Popup
          onClose={() => setShowCapacityModal(false)}
          title={`Choose ${selectedCapacityType} capacity`}
        >
          <div className="p-4">
            <CapacitySearch
              onSelect={capacities => {
                handleCapacitySelect(capacities as Capacity[]);
                setShowCapacityModal(false);
              }}
              selectedCapacities={[]}
              allowMultipleSelection={true}
              showSelectedChips={false}
              compact={true}
            />
          </div>
        </Popup>
      )}
      {showBadgeModal && (
        <BadgeSelectionModal
          badges={completedBadges}
          selectedBadges={displayedBadges.map(badge => badge.id)}
          onClose={() => setShowBadgeModal(false)}
          onUpdate={async selectedIds => {
            setShowBadgeModal(false);
            await updateUserBadges(selectedIds);
          }}
        />
      )}
      <LetsConnectPopup
        isOpen={showLetsConnectPopup}
        onClose={() => setShowLetsConnectPopup(false)}
        onConfirm={handleLetsConnectImport}
      />
    </>
  );
}
