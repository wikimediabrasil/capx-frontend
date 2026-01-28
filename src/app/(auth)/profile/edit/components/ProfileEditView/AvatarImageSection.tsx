import { JSX } from 'react';
import BaseButton from '@/components/BaseButton';
import LoadingImage from '@/components/LoadingImage';
import Popup from '@/components/Popup';
import { DEFAULT_AVATAR, DEFAULT_AVATAR_WHITE, getDefaultAvatar } from '@/constants/images';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import AccountBoxIcon from '@/public/static/images/account_box.svg';
import AccountBoxIconWhite from '@/public/static/images/account_box_white.svg';
import capxPersonIcon from '@/public/static/images/capx_person_icon.svg';
import ChangeCircleIcon from '@/public/static/images/change_circle.svg';
import ChangeCircleIconWhite from '@/public/static/images/change_circle_white.svg';
import CheckBoxFilledIcon from '@/public/static/images/check_box.svg';
import CheckBoxFilledIconWhite from '@/public/static/images/check_box_light.svg';
import CheckIcon from '@/public/static/images/check_box_outline_blank.svg';
import CheckIconWhite from '@/public/static/images/check_box_outline_blank_light.svg';
import DeleteIcon from '@/public/static/images/delete.svg';
import Image from 'next/image';
import AvatarSelectionPopup from '../../../components/AvatarSelectionPopup';

const getAvatarAltText = (src: string, pageContent: any): string => {
  const isDefaultAvatar = src === DEFAULT_AVATAR || src === DEFAULT_AVATAR_WHITE;
  if (isDefaultAvatar) {
    return pageContent['alt-profile-picture-default'] || 'Default user profile picture';
  }
  return 'Selected avatar';
};

const renderTextWithLink = (
  text: string,
  linkText: string,
  darkMode: boolean
): (string | JSX.Element)[] => {
  const parts = text.split('$1');
  const link = (
    <a
      href="https://www.wikidata.org/wiki/Wikidata:Notability"
      target="_blank"
      rel="noopener noreferrer"
      className={`underline ${darkMode ? 'text-blue-300' : 'text-blue-600'} hover:opacity-80`}
    >
      {linkText}
    </a>
  );
  const nodes: (string | JSX.Element)[] = [];
  parts.forEach((part, index) => {
    if (index > 0) nodes.push(link);
    nodes.push(part);
  });
  return nodes;
};

interface AvatarImageSectionProps {
  readonly selectedAvatar: any;
  readonly avatarUrl: string;
  readonly isImageLoading: boolean;
  readonly showAvatarPopup: boolean;
  readonly setShowAvatarPopup: (show: boolean) => void;
  readonly handleAvatarSelect: (avatarId: number | null) => void;
  readonly isWikidataSelected: boolean;
  readonly handleWikidataClick: (selected: boolean) => void;
  readonly formData: any;
  readonly showDeleteProfilePopup: boolean;
  readonly setShowDeleteProfilePopup: (show: boolean) => void;
  readonly handleDeleteProfile: () => void;
  readonly refetch: () => Promise<any>;
}

export function AvatarImageSection({
  selectedAvatar,
  avatarUrl,
  isImageLoading,
  showAvatarPopup,
  setShowAvatarPopup,
  handleAvatarSelect,
  isWikidataSelected,
    handleWikidataClick,
    formData,
    showDeleteProfilePopup,
  setShowDeleteProfilePopup,
  handleDeleteProfile,
  refetch,
}: AvatarImageSectionProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  const accountBoxIcon = darkMode ? AccountBoxIconWhite : AccountBoxIcon;
  const titleColor = darkMode ? 'text-white' : 'text-[#053749]';
  const avatarSrc = selectedAvatar.src || avatarUrl;
  const avatarAlt = getAvatarAltText(avatarSrc, pageContent);
  const changeIconSrc = darkMode ? ChangeCircleIconWhite : ChangeCircleIcon;
  const iconSize = isMobile ? 20 : 30;
  const chooseAvatarBtnClass = darkMode
    ? 'bg-capx-light-bg text-[#053749]'
    : 'bg-[#053749] text-[#F6F6F6]';
  const tooltipColor = darkMode ? 'text-white' : 'text-[#053749]';
  const wikidataBtnClass = darkMode
    ? 'bg-transparent border-white text-white placeholder-capx-dark-box-bg'
    : 'border-[#053749]';
  const consentTextColor = darkMode ? 'text-white' : 'text-[#053749]';
  const wikidataText = pageContent['edit-profile-consent-wikidata-before-link'] || '';
  const wikidataLinkText = pageContent['edit-profile-consent-wikidata-link'];
  const checkboxIcon = isWikidataSelected
    ? darkMode
      ? CheckBoxFilledIconWhite
      : CheckBoxFilledIcon
    : darkMode
      ? CheckIconWhite
      : CheckIcon;

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-12 md:w-4/5">
      <div className="flex flex-col gap-4 w-full md:w-1/2">
        <div className="flex flex-row gap-1 items-center">
          <div className="relative w-[20px] h-[20px] md:w-[48px] md:h-[48px]">
            <Image
              src={accountBoxIcon}
              alt="Account box icon"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <h2 className={`${titleColor} font-[Montserrat] text-[16px] md:text-[24px] font-bold`}>
            {pageContent['edit-profile-image-title']}
          </h2>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg md:h-full md:flex md:items-center md:justify-center">
          <div className="w-32 h-32 md:w-64 md:h-64 mx-auto mb-4 md:mb-0 relative flex items-center justify-center">
            {isImageLoading && <LoadingImage />}
            {!isImageLoading && (
              <Image
                src={avatarSrc}
                alt={avatarAlt}
                fill
                className="object-contain"
                onError={e => {
                  e.currentTarget.src = getDefaultAvatar();
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
          customClass={`w-full flex px-[13px] py-[6px] pb-[6px] md:px-8 md:py-4 items-center rounded-[4px] md:rounded-[8px] ${chooseAvatarBtnClass} font-[Montserrat] text-[12px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0`}
          imageUrl={changeIconSrc}
          imageAlt="Change circle icon"
          imageWidth={iconSize}
          imageHeight={iconSize}
        />

        <span
          className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-normal ${tooltipColor} hidden md:block`}
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
            customClass={`w-full flex justify-between items-start px-[13px] py-[6px] md:items-center md:px-8 md:py-4 font-extrabold rounded-[4px] md:rounded-[8px] font-[Montserrat] text-[12px] md:text-[24px] appearance-none mb-0 pb-[6px] text-left ${wikidataBtnClass} border`}
            imageUrl={checkboxIcon}
            imageAlt="Check icon"
            imageWidth={iconSize}
            imageHeight={iconSize}
          />
          <span
            className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${consentTextColor}`}
          >
            {renderTextWithLink(wikidataText, wikidataLinkText, darkMode)}
          </span>
        </div>

        <BaseButton
          onClick={() => setShowDeleteProfilePopup(true)}
          label={pageContent['edit-profile-delete-profile']}
          customClass="w-full hidden md:flex justify-between items-center px-8 py-4 rounded-[8px] font-[Montserrat] text-[24px] font-extrabold text-capx-dark-box-bg mb-0 mt-4 bg-[#D43831] text-white"
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
  );
}
