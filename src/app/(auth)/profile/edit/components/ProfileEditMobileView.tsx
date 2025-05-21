"use client";

import Image from "next/image";
import CapacitySelectionModal from "@/components/CapacitySelectionModal";
import AccountCircleIcon from "@/public/static/images/account_circle.svg";
import AccountCircleIconWhite from "@/public/static/images/account_circle_white.svg";
import AccountBoxIcon from "@/public/static/images/account_box.svg";
import AccountBoxIconWhite from "@/public/static/images/account_box_white.svg";
import ChangeCircleIcon from "@/public/static/images/change_circle.svg";
import ChangeCircleIconWhite from "@/public/static/images/change_circle_white.svg";
import CheckBoxFilledIcon from "@/public/static/images/check_box.svg";
import CheckBoxFilledIconWhite from "@/public/static/images/check_box_light.svg";
import CheckIcon from "@/public/static/images/check_box_outline_blank.svg";
import CheckIconWhite from "@/public/static/images/check_box_outline_blank_light.svg";
import CancelIcon from "@/public/static/images/cancel.svg";
import CancelIconWhite from "@/public/static/images/cancel_white.svg";
import PersonIcon from "@/public/static/images/person_book.svg";
import PersonIconWhite from "@/public/static/images/person_book_white.svg";
import NeurologyIcon from "@/public/static/images/neurology.svg";
import NeurologyIconWhite from "@/public/static/images/neurology_white.svg";
import EmojiIcon from "@/public/static/images/emoji_objects.svg";
import EmojiIconWhite from "@/public/static/images/emoji_objects_white.svg";
import CloseIcon from "@/public/static/images/close_mobile_menu_icon_light_mode.svg";
import AddIconDark from "@/public/static/images/add_dark.svg";
import AddIcon from "@/public/static/images/add.svg";
import TargetIconWhite from "@/public/static/images/target_white.svg";
import TargetIcon from "@/public/static/images/target.svg";
import LanguageIconWhite from "@/public/static/images/language_white.svg";
import LanguageIcon from "@/public/static/images/language.svg";
import ArrowDownIconWhite from "@/public/static/images/arrow_drop_down_circle_white.svg";
import ArrowDownIcon from "@/public/static/images/arrow_drop_down_circle.svg";
import WikiIconWhite from "@/public/static/images/wikimedia_logo_white.svg";
import WikiIcon from "@/public/static/images/wikimedia_logo_black.svg";
import AffiliationIconWhite from "@/public/static/images/affiliation_white.svg";
import AffiliationIcon from "@/public/static/images/affiliation.svg";
import TerritoryIconWhite from "@/public/static/images/territory_white.svg";
import TerritoryIcon from "@/public/static/images/territory.svg";
import BarCodeIconWhite from "@/public/static/images/barcode_white.svg";
import BarCodeIcon from "@/public/static/images/barcode.svg";
import CloseIconWhite from "@/public/static/images/close_mobile_menu_icon_light_mode.svg";
import NoAvatarIcon from "@/public/static/images/no_avatar.svg";
import DeleteIcon from "@/public/static/images/delete.svg";
import capxPersonIcon from "@/public/static/images/capx_person_icon.svg";
import SaveIcon from "@/public/static/images/save_as.svg";
import BaseButton from "@/components/BaseButton";
import AvatarSelectionPopup from "../../components/AvatarSelectionPopup";
// import UserCheckIcon from "@/public/static/images/user_check.svg";
// import UserCheckIconDark from "@/public/static/images/user_check_dark.svg";
import Popup from "@/components/Popup";
// import Banner from "@/components/Banner";
// import LetsConect from "@/public/static/images/lets_connect.svg";
import BadgesIcon from "@/public/static/images/icons/badges_icon.svg";
import BadgesIconWhite from "@/public/static/images/icons/badges_icon_white.svg";
import ExpandIconWhite from "@/public/static/images/expand_all_white.svg";
import ExpandIcon from "@/public/static/images/expand_all.svg";
import BadgeSelectionModal from "@/components/BadgeSelectionModal";

import { Profile } from "@/types/profile";
import { Capacity } from "@/types/capacity";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useAvatars } from "@/hooks/useAvatars";
import { useRouter } from "next/navigation";
import BadgesCarousel from "@/components/BadgesCarousel";
import { useBadges } from "@/contexts/BadgesContext";

interface ProfileEditMobileViewProps {
  selectedAvatar: any;
  handleAvatarSelect: (avatarId: number) => void;
  showAvatarPopup: boolean;
  setShowAvatarPopup: (show: boolean) => void;
  handleWikidataClick: () => void;
  isWikidataSelected: boolean;
  showCapacityModal: boolean;
  setShowCapacityModal: (show: boolean) => void;
  handleCapacitySelect: (capacity: Capacity) => void;
  selectedCapacityType: "known" | "available" | "wanted";
  handleAddCapacity: (type: "known" | "available" | "wanted") => void;
  handleRemoveCapacity: (
    type: "known" | "available" | "wanted",
    index: number
  ) => void;
  handleRemoveLanguage: (index: number) => void;
  getCapacityName: (id: number) => string;
  handleAddProject: () => void;
  handleSubmit: () => void;
  handleCancel: () => void;
  handleDeleteProfile: () => void;
  handleDeleteProject: (index: number) => void;
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
}

export default function ProfileEditMobileView(
  props: ProfileEditMobileViewProps
) {
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
    handleDeleteProject,
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
  } = props;

  const router = useRouter();
  const { data: session } = useSession();
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const username = session?.user?.name;
  const [showDeleteProfilePopup, setShowDeleteProfilePopup] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const { userBadges, isLoading: isBadgesLoading, updateUserBadges } = useBadges();
  const [avatarUrl, setAvatarUrl] = useState<string>(
    profile?.avatar || NoAvatarIcon
  );
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const completedBadges = userBadges.filter(badge => badge.progress === 100);
  const displayedBadges = completedBadges.filter(badge => badge.is_displayed);

  return (
    <>
      <div
        className={`relative w-full overflow-x-hidden min-h-screen ${
          darkMode ? "bg-[#053749] text-white" : "bg-white text-[#053749]"
        }`}
      >
        <section
          className={`w-full max-w-screen-xl mx-auto px-4 py-8 ${
            isMobile ? "mt-[80px]" : "mt-[64px]"
          }`}
        >
          <div
            className={`flex flex-col gap-6 ${
              isMobile ? "" : "mx-[80px]"
            } mx-auto`}
          >
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h1
                className={`font-[Montserrat] text-[16px] not-italic font-normal leading-[29px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["edit-profile-welcome"]}
              </h1>
              <div className="flex items-center gap-[6px]">
                <div className="relative w-[24px] h-[24px]">
                  <Image
                    src={darkMode ? AccountCircleIconWhite : AccountCircleIcon}
                    alt="User circle icon"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <span
                  className={`text-start ${
                    darkMode ? "text-white" : "text-[#053749]"
                  } font-[Montserrat] text-[20px] font-extrabold`}
                >
                  {username}
                </span>
              </div>
            </div>

            {/* Image Profile Section */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-1 items-center">
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={darkMode ? AccountBoxIconWhite : AccountBoxIcon}
                    alt="Account box icon"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <h2
                  className={`${
                    darkMode ? "text-white" : "text-[#053749]"
                  } font-[Montserrat] text-[16px] font-bold`}
                >
                  {pageContent["edit-profile-image-title"]}
                </h2>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <Image
                    src={selectedAvatar.src || avatarUrl}
                    alt="Selected avatar"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <BaseButton
                onClick={() => setShowAvatarPopup(true)}
                label={pageContent["edit-profile-choose-avatar"]}
                customClass={`w-full flex px-[13px] py-[6px] pb-[6px] items-center rounded-[4px] ${
                  darkMode
                    ? "bg-capx-light-bg text-[#053749]"
                    : "bg-[#053749] text-[#F6F6F6]"
                } font-[Montserrat] text-[12px] not-italic font-extrabold leading-[normal] mb-0`}
                imageUrl={darkMode ? ChangeCircleIconWhite : ChangeCircleIcon}
                imageAlt="Change circle icon"
                imageWidth={20}
                imageHeight={20}
              />

              {showAvatarPopup && (
                <AvatarSelectionPopup
                  onClose={() => setShowAvatarPopup(false)}
                  onSelect={handleAvatarSelect}
                  selectedAvatarId={selectedAvatar.id}
                  onUpdate={refetch}
                />
              )}

              <div className="flex flex-col items-center gap-2">
                <BaseButton
                  onClick={handleWikidataClick}
                  label={pageContent["edit-profile-use-wikidata"]}
                  customClass={`w-full flex justify-between items-center px-[13px] py-[6px] font-extrabold rounded-[4px] font-[Montserrat] text-[12px] appearance-none mb-0 pb-[6px] ${
                    darkMode
                      ? "bg-transparent border-white text-white placeholder-capx-dark-box-bg"
                      : "border-[#053749]"
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
                  imageWidth={20}
                  imageHeight={20}
                />
                <span
                  className={`text-[12px] font-[Montserrat] not-italic font-normal leading-[15px] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-consent-wikidata"]}
                </span>
              </div>
              <div className="flex flex-col gap-[10px]">
                {/* Action Buttons */}
                <div className="flex flex-col gap-[10px] mt-0">
                  <BaseButton
                    onClick={handleSubmit}
                    label={pageContent["edit-profile-save"]}
                    customClass="w-full flex items-center px-[13px] py-[6px] text-[14px] pb-[6px] bg-[#851970] text-white rounded-md py-3 font-bold !mb-0"
                    imageUrl={SaveIcon}
                    imageAlt="Save icon"
                    imageWidth={20}
                    imageHeight={20}
                  />
                  <BaseButton
                    onClick={() => router.back()}
                    label={pageContent["edit-profile-cancel"]}
                    customClass={`w-full flex items-center px-[13px] py-[6px] pb-[6px] text-[14px] border border-[#053749] text-[#053749] rounded-md py-3 font-bold mb-0 ${
                      darkMode
                        ? "bg-transparent text-[#F6F6F6] border-[#F6F6F6] border-[2px]"
                        : "bg-[#F6F6F6] border-[#053749] text-[#053749]"
                    }`}
                    imageUrl={darkMode ? CancelIconWhite : CancelIcon}
                    imageAlt="Cancel icon"
                    imageWidth={20}
                    imageHeight={20}
                  />
                  <BaseButton
                    onClick={() => setShowDeleteProfilePopup(true)}
                    label={pageContent["edit-profile-delete-profile"]}
                    customClass={`w-full flex justify-between items-center px-[13px] py-[6px] pb-[6px] text-[14px] rounded-[4px] font-[Montserrat] font-extrabold text-capx-dark-box-bg mb-0 mt-2 bg-[#D43831] text-white`}
                    imageUrl={DeleteIcon}
                    imageAlt="Delete icon"
                    imageWidth={20}
                    imageHeight={20}
                  />

                    <div className="flex items-center gap-2">
                      <Image
                        src={darkMode ? BadgesIconWhite : BadgesIcon}
                        alt="Badges icon"
                        width={20}
                        height={20}
                      />
                      <h2
                        className={`font-[Montserrat] text-[14px] font-bold ${
                          darkMode ? "text-white" : "text-[#053749]"
                        }`}
                      >
                        {pageContent["body-profile-badges-title"]}
                      </h2>
                    </div>

                    {isBadgesLoading && (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2">
                          <div className="w-full h-[48px] bg-gray-200 rounded-md mb-2"></div>
                        </div>
                      </div>
                    )}

                  {displayedBadges.length > 0 && !isBadgesLoading ? (
                    <BadgesCarousel badges={displayedBadges} showFullDescription={false}/>
                  ) : (
                    !isBadgesLoading && (
                      <span className={`text-[12px] font-[Montserrat] not-italic font-normal leading-[15px] ${
                        darkMode ? "text-white" : "text-[#053749]"
                      }`}>
                        {pageContent["body-profile-badges-no-badges"]}
                      </span>
                    )
                  )}

                  {userBadges.length > 0 && (
                    <BaseButton
                      onClick={() => setShowBadgeModal(true)}
                      label={pageContent["body-profile-badges-edit-your-badges"]}
                      customClass={`w-full flex ${
                        darkMode
                          ? "bg-capx-light-box-bg text-[#04222F]"
                          : "bg-[#053749] text-white"
                      } rounded-md py-2 font-[Montserrat] text-[12px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] items-center gap-[4px]`}
                      imageUrl={darkMode ? ChangeCircleIconWhite : ChangeCircleIcon}
                      imageAlt={pageContent["body-profile-badges-edit-your-badges"]}
                      imageWidth={20}
                      imageHeight={20}
                    />
                  )}

                  <div className="flex flex-col ">
                    <BaseButton
                      onClick={() => router.push("/profile/badges")}
                      label={pageContent["body-profile-badges-see-all"]}
                      customClass={`w-full flex mb-2 border ${
                        darkMode
                        ? "border-white text-white"
                        : "border-[#053749] text-[#053749]"
                      } rounded-md py-2 font-[Montserrat] text-[12px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] items-center gap-[4px]`}
                      imageUrl={darkMode ? ExpandIconWhite : ExpandIcon}
                      imageAlt="View all badges"
                      imageWidth={20}
                      imageHeight={20}
                    />

                    <span
                      className={`text-[12px] font-[Montserrat] not-italic font-normal leading-[15px] ${
                        darkMode ? "text-white" : "text-[#053749]"
                      }`}
                    >
                      {pageContent["body-profile-badges-description"]}
                    </span>
                  </div>

                  {showDeleteProfilePopup && (
                    <Popup
                      title={pageContent["edit-profile-delete-profile"]}
                      image={capxPersonIcon}
                      onClose={() => setShowDeleteProfilePopup(false)}
                      onContinue={handleDeleteProfile}
                      continueButtonLabel={
                        pageContent["edit-profile-delete-profile-confirm"]
                      }
                      closeButtonLabel={
                        pageContent["edit-profile-delete-profile-cancel"]
                      }
                    />
                  )}
                </div>
                <div className="flex flex-row gap-2 mt-4">
                  <Image
                    src={darkMode ? PersonIconWhite : PersonIcon}
                    alt="Person icon"
                    width={16}
                    height={16}
                    style={{ objectFit: "cover" }}
                  />
                  <div className="flex flex-row gap-1 items-center">
                    <h2
                      className={`font-[Montserrat] text-[14px] font-bold ${
                        darkMode ? "text-white" : "text-[#053749]"
                      }`}
                    >
                      {pageContent["edit-profile-mini-bio"]}
                    </h2>
                  </div>
                </div>
                <div className="flex w-full px-[4px] py-[6px] flex-col items-start gap-[14px] rounded-[4px] border-[1px] border-[solid] border-capx-light-bg">
                  <textarea
                    value={formData.about || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, about: e.target.value })
                    }
                    placeholder={
                      pageContent["edit-profile-mini-bio-placeholder"]
                    }
                    className={`w-full font-[Montserrat] text-[13px] not-italic font-normal leading-[normal] bg-transparent resize-none min-h-[100px] rounded-[4px] border-[1px] border-[solid] border-[#053749] py-2 px-2 scrollbar-hide ${
                      darkMode
                        ? "text-white placeholder-gray-400"
                        : "text-[#053749] placeholder-[#829BA4]"
                    }`}
                  />
                </div>
                <span
                  className={`font-[Montserrat] text-[12px] not-italic font-normal leading-[15px] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-mini-bio-tooltip"]}
                </span>
              </div>
            </div>

            {/* Capacities Sections */}
            <div className="space-y-6">
              {/* Known Capacities */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? NeurologyIconWhite : NeurologyIcon}
                    alt="Neurology icon"
                    width={20}
                    height={20}
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] font-bold ${
                      darkMode ? "text-white" : "text-[#053749]"
                    }`}
                  >
                    {pageContent["body-profile-section-title-known-capacity"]}
                  </h2>
                </div>
                <div
                  className={`flex flex-wrap gap-2 rounded-[4px] ${
                    darkMode ? "bg-[#04222F]" : "bg-[#EFEFEF]"
                  } flex w-full px-[4px] py-[6px] items-start gap-[12px]`}
                >
                  {formData?.skills_known?.map((capacity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-md"
                    >
                      <BaseButton
                        onClick={() => handleRemoveCapacity("known", index)}
                        label={getCapacityName(capacity)}
                        customClass="rounded-[4px] border-[1px] border-[solid] !mb-0 border-[var(--Links-light-link,#0070B9)] flex p-[4px] pb-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[12px] not-italic font-normal leading-[normal]"
                        imageUrl={CloseIcon}
                        imageAlt="Close icon"
                        imageWidth={16}
                        imageHeight={16}
                      />
                    </div>
                  ))}
                </div>
                <BaseButton
                  onClick={() => handleAddCapacity("known")}
                  label={pageContent["edit-profile-add-capacities"]}
                  customClass={`w-full flex ${
                    darkMode
                      ? "bg-capx-light-box-bg text-[#04222F]"
                      : "bg-[#053749] text-white"
                  } rounded-md py-2 font-[Montserrat] text-[12px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] items-center gap-[4px]`}
                  imageUrl={darkMode ? AddIconDark : AddIcon}
                  imageAlt="Add capacity"
                  imageWidth={20}
                  imageHeight={20}
                />
                <span
                  className={`text-[12px] font-[Montserrat] not-italic font-normal leading-[15px] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-select-skills"]}
                </span>
              </div>

              {/* Available Capacities */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? EmojiIconWhite : EmojiIcon}
                    alt="Available capacities icon"
                    width={20}
                    height={20}
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] font-bold ${
                      darkMode ? "text-white" : "text-[#053749]"
                    }`}
                  >
                    {
                      pageContent[
                        "body-profile-section-title-available-capacity"
                      ]
                    }
                  </h2>
                </div>
                <div
                  className={`flex flex-wrap gap-2 rounded-[4px] ${
                    darkMode ? "bg-[#04222F]" : "bg-[#EFEFEF]"
                  } flex w-full px-[4px] py-[6px] items-start gap-[12px]`}
                >
                  {formData?.skills_available?.map((capacity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-md"
                    >
                      <BaseButton
                        onClick={() => handleRemoveCapacity("available", index)}
                        label={getCapacityName(capacity)}
                        customClass="rounded-[4px] border-[1px] border-[solid] !mb-0 border-[var(--Links-light-link,#05A300)] flex p-[4px] pb-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[12px] not-italic font-normal leading-[normal]"
                        imageUrl={CloseIcon}
                        imageAlt="Close icon"
                        imageWidth={16}
                        imageHeight={16}
                      />
                    </div>
                  ))}
                </div>
                <BaseButton
                  onClick={() => handleAddCapacity("available")}
                  label={pageContent["edit-profile-add-capacities"]}
                  customClass={`w-full flex ${
                    darkMode
                      ? "bg-capx-light-box-bg text-[#04222F]"
                      : "bg-[#053749] text-white"
                  } rounded-md py-2 font-[Montserrat] text-[12px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] items-center gap-[4px]`}
                  imageUrl={darkMode ? AddIconDark : AddIcon}
                  imageAlt="Add capacity"
                  imageWidth={20}
                  imageHeight={20}
                />
                <span
                  className={`text-[12px] font-[Montserrat] not-italic font-normal leading-[15px] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  From your known capacities, choose those you are available to
                  share.
                </span>
              </div>

              {/* Wanted Capacities */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? TargetIconWhite : TargetIcon}
                    alt="Wanted capacities icon"
                    width={20}
                    height={20}
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] font-bold ${
                      darkMode ? "text-white" : "text-[#053749]"
                    }`}
                  >
                    {pageContent["body-profile-section-title-wanted-capacity"]}
                  </h2>
                </div>
                <div
                  className={`flex flex-wrap gap-2 rounded-[4px] ${
                    darkMode ? "bg-[#04222F]" : "bg-[#EFEFEF]"
                  } flex w-full px-[4px] py-[6px] items-start gap-[12px]`}
                >
                  {formData?.skills_wanted?.map((capacity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-md"
                    >
                      <BaseButton
                        onClick={() => handleRemoveCapacity("wanted", index)}
                        label={getCapacityName(capacity)}
                        customClass="rounded-[4px] border-[1px] border-[solid] !mb-0 border-[var(--Links-light-link,#D43831)] flex p-[4px] pb-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[12px] not-italic font-normal leading-[normal]"
                        imageUrl={CloseIcon}
                        imageAlt="Close icon"
                        imageWidth={16}
                        imageHeight={16}
                      />
                    </div>
                  ))}
                </div>
                <BaseButton
                  onClick={() => handleAddCapacity("wanted")}
                  label={pageContent["edit-profile-add-capacities"]}
                  customClass={`w-full flex ${
                    darkMode
                      ? "bg-capx-light-box-bg text-[#04222F]"
                      : "bg-[#053749] text-white"
                  } rounded-md py-2 font-[Montserrat] text-[12px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] items-center gap-[4px]`}
                  imageUrl={darkMode ? AddIconDark : AddIcon}
                  imageAlt="Add capacity"
                  imageWidth={20}
                  imageHeight={20}
                />
                <span
                  className={`text-[12px] font-[Montserrat] not-italic font-normal leading-[15px] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-wanted-capacities"]}
                </span>
              </div>











              {/* Languages Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? LanguageIconWhite : LanguageIcon}
                    alt="Language icon"
                    width={20}
                    height={20}
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] font-bold ${
                      darkMode ? "text-white" : "text-[#053749]"
                    }`}
                  >
                    {pageContent["body-profile-languages-title"]}
                  </h2>
                </div>

                {/* Language List */}
                <div className="flex flex-wrap gap-2">
                  {formData.language?.map((lang, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded ${
                        darkMode ? "bg-capx-dark-bg" : "bg-[#EFEFEF]"
                      }`}
                    >
                      <span className="font-[Montserrat] text-[12px]">
                        {languages[lang.id]}
                      </span>
                      <select
                        value={lang.proficiency}
                        onChange={(e) => {
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
                        className={`ml-2 p-1 rounded border ${
                          darkMode
                            ? "bg-transparent border-white text-white"
                            : "border-[#053749] text-[#829BA4]"
                        }`}
                        style={{
                          backgroundColor: darkMode ? "#053749" : "white",
                          color: darkMode ? "white" : "#053749",
                        }}
                      >
                        <option
                          value="0"
                          style={{
                            backgroundColor: darkMode ? "#053749" : "white",
                            color: darkMode ? "white" : "#053749",
                          }}
                        >
                          {pageContent["profiency-level-not-proficient"]}
                        </option>
                        <option
                          value="1"
                          style={{
                            backgroundColor: darkMode ? "#053749" : "white",
                            color: darkMode ? "white" : "#053749",
                          }}
                        >
                          {pageContent["profiency-level-basic"]}
                        </option>
                        <option
                          value="2"
                          style={{
                            backgroundColor: darkMode ? "#053749" : "white",
                            color: darkMode ? "white" : "#053749",
                          }}
                        >
                          {pageContent["profiency-level-intermediate"]}
                        </option>
                        <option
                          value="3"
                          style={{
                            backgroundColor: darkMode ? "#053749" : "white",
                            color: darkMode ? "white" : "#053749",
                          }}
                        >
                          {pageContent["profiency-level-advanced"]}
                        </option>
                        <option
                          value="4"
                          style={{
                            backgroundColor: darkMode ? "#053749" : "white",
                            color: darkMode ? "white" : "#053749",
                          }}
                        >
                          {pageContent["profiency-level-almost-native"]}
                        </option>
                        <option
                          value="5"
                          style={{
                            backgroundColor: darkMode ? "#053749" : "white",
                            color: darkMode ? "white" : "#053749",
                          }}
                        >
                          {pageContent["profiency-level-professional"]}
                        </option>
                        <option
                          value="n"
                          style={{
                            backgroundColor: darkMode ? "#053749" : "white",
                            color: darkMode ? "white" : "#053749",
                          }}
                        >
                          {pageContent["profiency-level-native"]}
                        </option>
                      </select>
                      <button
                        onClick={() => handleRemoveLanguage(index)}
                        className="ml-2"
                      >
                        <Image
                          src={darkMode ? CloseIconWhite : CloseIcon}
                          alt="Remove language"
                          width={16}
                          height={16}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Language Select */}
                <div className="relative">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        setFormData({
                          ...formData,
                          language: [
                            ...(formData.language || []),
                            { id: Number(e.target.value), proficiency: "3" },
                          ],
                        });
                      }
                    }}
                    className={`w-full px-4 py-2 rounded-[4px] font-[Montserrat] text-[12px] appearance-none ${
                      darkMode
                        ? "bg-transparent border-white text-white opacity-50"
                        : "border-[#053749] text-[#829BA4]"
                    } border`}
                    style={{
                      backgroundColor: darkMode ? "#053749" : "white",
                      color: darkMode ? "white" : "#053749",
                    }}
                  >
                    <option value="">
                      {pageContent["edit-profile-add-language"]}
                    </option>
                    {Object.entries(languages).map(([id, name]) => (
                      <option
                        key={id}
                        value={id}
                        style={{
                          backgroundColor: darkMode ? "#053749" : "white",
                          color: darkMode ? "white" : "#053749",
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
                      width={20}
                      height={20}
                    />
                  </div>
                </div>
              </div>

              <span
                className={`text-[12px] font-[Montserrat] not-italic font-normal leading-[15px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["edit-profile-language-tooltip"]}
              </span>
              {/* Alternative Wikimedia Account */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? WikiIconWhite : WikiIcon}
                    alt="Alternative account icon"
                    width={20}
                    height={20}
                  />
                  <h2
                    className={`font-[Montserrat] text-[12px] font-bold ${
                      darkMode ? "text-white" : "text-[#053749]"
                    }`}
                  >
                    {pageContent["body-profile-box-title-alt-wiki-acc"]}
                  </h2>
                </div>
                <input
                  type="text"
                  placeholder={pageContent["edit-profile-insert-item"]}
                  value={formData.wiki_alt}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wiki_alt: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2 rounded-[4px] font-[Montserrat] text-[12px] ${
                    darkMode
                      ? "bg-transparent border-white text-white opacity-50 placeholder-gray-400"
                      : "border-[#053749] text-[#829BA4]"
                  } border`}
                />
                <span
                  className={`text-[12px] font-[Montserrat] not-italic font-normal leading-[15px] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-share-username"]}
                </span>
              </div>
            {/* Affiliation Section */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? AffiliationIconWhite : AffiliationIcon}
                  alt="Affiliation icon"
                  width={20}
                  height={20}
                />
                <h2
                  className={`font-[Montserrat] text-[12px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-section-title-affiliation"]}
                </h2>
              </div>

              {/* Lista de Afiliações Selecionadas */}
              <div className="flex flex-wrap gap-2">
                {formData.affiliation?.map((affId, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded ${
                      darkMode ? "bg-capx-dark-bg" : "bg-[#EFEFEF]"
                    }`}
                  >
                    <span className="font-[Montserrat] text-[12px]">
                      {affiliations[affId]}
                    </span>
                    <button
                      onClick={() => {
                        const newAffiliations = formData.affiliation?.filter((_, i) => i !== index);
                        setFormData({ ...formData, affiliation: newAffiliations });
                      }}
                      className="ml-2"
                    >
                      <Image
                        src={darkMode ? CloseIconWhite : CloseIcon}
                        alt="Remove affiliation"
                        width={16}
                        height={16}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Dropdown para adicionar nova afiliação */}
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && !formData.affiliation?.includes(value)) {
                      setFormData({
                        ...formData,
                        affiliation: [...(formData.affiliation || []), value],
                      });
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-[4px] font-[Montserrat] text-[12px] appearance-none ${
                    darkMode
                      ? "bg-transparent border-white text-white opacity-50 placeholder-gray-400"
                      : "border-[#053749] text-[#829BA4]"
                  } border`}
                  style={{
                    backgroundColor: darkMode ? "#053749" : "white",
                    color: darkMode ? "white" : "#053749",
                  }}
                >
                  <option value="">
                    {pageContent["edit-profile-insert-item"]}
                  </option>
                  {Object.entries(affiliations).map(([id, name]) => (
                    <option
                      key={id}
                      value={id}
                      style={{
                        backgroundColor: darkMode ? "#053749" : "white",
                        color: darkMode ? "white" : "#053749",
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
                    width={20}
                    height={20}
                  />
                </div>
              </div>

              {/* Tooltip */}
              <span
                className={`text-[12px] font-[Montserrat] not-italic font-normal leading-[15px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["body-profile-section-affiliation-dropdown-menu"]}
              </span>
            </div>
            {/* Territory */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? TerritoryIconWhite : TerritoryIcon}
                  alt="Territory icon"
                  width={20}
                  height={20}
                />
                <h2
                  className={`font-[Montserrat] text-[14px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-section-title-territory"]}
                </h2>
              </div>

              {/* Territory List */}
              <div className="flex flex-wrap gap-2">
                {formData.territory?.map((territoryId, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded ${
                      darkMode ? "bg-capx-dark-bg" : "bg-[#EFEFEF]"
                    }`}
                  >
                    <span className="font-[Montserrat] text-[12px]">
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
                        width={16}
                        height={16}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Territory Select */}
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (
                      selected &&
                      !formData.territory?.includes(selected)
                    ) {
                      setFormData({
                        ...formData,
                        territory: [...(formData.territory || []), selected],
                      });
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-[4px] font-[Montserrat] text-[12px] appearance-none ${
                    darkMode
                      ? "bg-transparent border-white text-white opacity-50"
                      : "border-[#053749] text-[#829BA4]"
                  } border`}
                  style={{
                    backgroundColor: darkMode ? "#053749" : "white",
                    color: darkMode ? "white" : "#053749",
                  }}
                >
                  <option value="">
                    {pageContent["edit-profile-insert-item"]}
                  </option>
                  {Object.entries(territories).map(([id, name]) => (
                    <option
                      key={id}
                      value={id}
                      style={{
                        backgroundColor: darkMode ? "#053749" : "white",
                        color: darkMode ? "white" : "#053749",
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
                    width={20}
                    height={20}
                  />
                </div>
              </div>

              <span
                className={`text-[12px] font-[Montserrat] not-italic font-normal leading-[15px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["edit-profile-territory"]}
              </span>
            </div>
              {/* Wikidata Item */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? BarCodeIconWhite : BarCodeIcon}
                    alt="Wikidata item icon"
                    width={20}
                    height={20}
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] font-bold ${
                      darkMode ? "text-white" : "text-[#053749]"
                    }`}
                  >
                    {pageContent["edit-profile-wikidata-item"]}
                  </h2>
                </div>
                <div className="flex items-center gap-2 py-[6px] ">
                  <BaseButton
                    onClick={handleWikidataClick}
                    label={pageContent["edit-profile-use-wikidata"]}
                    customClass={`w-full flex justify-between items-center px-[13px] py-[6px] rounded-[4px] font-[Montserrat] text-[12px] appearance-none mb-0 pb-[6px] ${
                      darkMode
                        ? "bg-transparent border-white text-white opacity-50 placeholder-gray-400"
                        : "border-[#053749] text-[#829BA4]"
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
                    imageWidth={20}
                    imageHeight={20}
                  />
                </div>
                <span
                  className={`text-[12px] font-[Montserrat] not-italic font-normal leading-[15px] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-consent-wikidata-item"]}
                </span>
              </div>

              {/* Wikimedia Projects */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? WikiIconWhite : WikiIcon}
                    alt="Wikimedia projects icon"
                    width={20}
                    height={20}
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] font-bold ${
                      darkMode ? "text-white" : "text-[#053749]"
                    }`}
                  >
                    {pageContent["body-profile-wikimedia-projects-title"]}
                  </h2>
                </div>

                {/* Display selected projects as tags with delete button */}
                <div
                  className={`flex flex-wrap gap-2 rounded-[4px] ${
                    darkMode ? "bg-[#04222F]" : "bg-[#EFEFEF]"
                  } w-full px-[4px] py-[6px] items-start gap-[12px]`}
                >
                  {formData?.wikimedia_project?.map((projectId, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-md"
                    >
                      <BaseButton
                        onClick={() => {
                          const newProjects = [
                            ...(formData.wikimedia_project || []),
                          ];
                          newProjects.splice(index, 1);
                          setFormData({
                            ...formData,
                            wikimedia_project: newProjects,
                          });
                        }}
                        label={wikimediaProjects[projectId] || projectId}
                        customClass="rounded-[4px] border-[1px] border-[solid] !mb-0 border-[var(--Links-light-link,#0070B9)] flex p-[4px] pb-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[12px] not-italic font-normal leading-[normal]"
                        imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                        imageAlt="Remove project"
                        imageWidth={16}
                        imageHeight={16}
                      />
                    </div>
                  ))}
                </div>

                {/* Selector for adding new projects - only shown when button is clicked */}
                {showProjectSelector && (
                  <div className="relative">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData({
                            ...formData,
                            wikimedia_project: [
                              ...(formData.wikimedia_project || []),
                              e.target.value,
                            ],
                          });
                          setShowProjectSelector(false); // Hide selector after selection
                        }
                      }}
                      className={`w-full px-4 py-2 rounded-[4px] font-[Montserrat] text-[12px] appearance-none ${
                        darkMode
                          ? "bg-transparent border-white text-white opacity-50 placeholder-gray-400"
                          : "border-[#053749] text-[#829BA4]"
                      } border`}
                      style={{
                        backgroundColor: darkMode ? "#053749" : "white",
                        color: darkMode ? "white" : "#053749",
                      }}
                    >
                      <option value="">
                        {pageContent["edit-profile-insert-project"]}
                      </option>
                      {Object.entries(wikimediaProjects).map(([id, name]) => (
                        <option
                          key={id}
                          value={id}
                          style={{
                            backgroundColor: darkMode ? "#053749" : "white",
                            color: darkMode ? "white" : "#053749",
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
                        width={20}
                        height={20}
                      />
                    </div>
                  </div>
                )}

                <BaseButton
                  onClick={() => setShowProjectSelector(true)}
                  label={pageContent["edit-profile-add-projects"]}
                  customClass={`w-full flex ${
                    darkMode
                      ? "bg-capx-light-box-bg text-[#04222F]"
                      : "bg-[#053749] text-white"
                  } rounded-md py-2 font-[Montserrat] text-[12px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] items-center gap-[4px]`}
                  imageUrl={darkMode ? AddIconDark : AddIcon}
                  imageAlt="Add project"
                  imageWidth={20}
                  imageHeight={20}
                />
                <span
                  className={`text-[12px] font-[Montserrat] not-italic font-normal leading-[15px] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-wikimedia-projects"]}
                </span>
              </div>
            </div>

            {/* <div className="bg-[#EFEFEF]">
              <Banner
                image={LetsConect}
                alt={pageContent["privacy-policy-alt-banner"]}
                customClass={{
                  background: "bg-[#EFEFEF]",
                }}
              />

              <BaseButton
                onClick={() => goTo("/profile/lets_connect")}
                label={pageContent["lets-connect-form-user-edit"]}
                customClass={`w-11/12 flex mx-auto ${
                  darkMode
                    ? "bg-capx-light-box-bg text-[#04222F]"
                    : "bg-[#053749] text-white"
                } items-center px-[13px] py-[6px] pb-[6px] rounded-md py-3 font-bold mb-0`}
                imageUrl={darkMode ? UserCheckIconDark : UserCheckIcon}
                imageAlt="Add project"
                imageWidth={20}
                imageHeight={20}
              />
              <p
                className={`text-[12px] font-[Montserrat] not-italic font-normal leading-[15px] p-4 ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["lets-connect-edit-user-info"]}
              </p>
            </div> */}

            {/* Action Buttons */}
            <div className="flex flex-col gap-[10px] mt-0">
              <BaseButton
                onClick={handleSubmit}
                label={pageContent["edit-profile-save"]}
                customClass="w-full flex items-center px-[13px] py-[6px] pb-[6px] bg-[#851970] text-white rounded-md py-3 font-bold mb-0"
                imageUrl={SaveIcon}
                imageAlt="Save icon"
                imageWidth={20}
                imageHeight={20}
              />
              <BaseButton
                onClick={() => router.back()}
                label={pageContent["edit-profile-cancel"]}
                customClass={`w-full flex items-center px-[13px] py-[6px] pb-[6px] border ${
                  darkMode
                    ? "border-white text-white"
                    : "border-[#053749] text-[#053749]"
                } rounded-md py-3 font-bold mb-0`}
                imageUrl={darkMode ? CancelIconWhite : CancelIcon}
                imageAlt="Cancel icon"
                imageWidth={20}
                imageHeight={20}
              />
            </div>
          </div>
        </section>
      </div>
      <CapacitySelectionModal
        isOpen={showCapacityModal}
        onClose={() => setShowCapacityModal(false)}
        onSelect={handleCapacitySelect}
        title={`Choose ${selectedCapacityType} capacity`}
      />
      {showBadgeModal && (
        <BadgeSelectionModal
          badges={completedBadges}
          selectedBadges={displayedBadges.map(badge => badge.id)}
          onClose={() => setShowBadgeModal(false)}
          onUpdate={async (selectedIds) => {
            setShowBadgeModal(false);
            await updateUserBadges(selectedIds);
          }}
        />
      )}
    </>
  );
}
