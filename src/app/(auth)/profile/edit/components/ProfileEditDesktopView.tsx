"use client";

import { useSession } from "next-auth/react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useWikimediaProject } from "@/hooks/useWikimediaProject";
import { useTerritories } from "@/hooks/useTerritories";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import SaveIcon from "@/public/static/images/save_as.svg";
import PersonIcon from "@/public/static/images/person_book.svg";
import PersonIconWhite from "@/public/static/images/person_book_white.svg";
import NeurologyIcon from "@/public/static/images/neurology.svg";
import NeurologyIconWhite from "@/public/static/images/neurology_white.svg";
import EmojiIcon from "@/public/static/images/emoji_objects.svg";
import EmojiIconWhite from "@/public/static/images/emoji_objects_white.svg";
import AddIconDark from "@/public/static/images/add_dark.svg";
import AddIcon from "@/public/static/images/add.svg";
import UserCheckIcon from "@/public/static/images/user_check.svg";
import UserCheckIconDark from "@/public/static/images/user_check_dark.svg";
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
import CloseIcon from "@/public/static/images/close_mobile_menu_icon_light_mode.svg";
import CloseIconWhite from "@/public/static/images/close_mobile_menu_icon_dark_mode.svg";
import DeleteIcon from "@/public/static/images/delete.svg";
import BaseButton from "@/components/BaseButton";
import AvatarSelectionPopup from "../../components/AvatarSelectionPopup";
import capxPersonIcon from "@/public/static/images/capx_person_icon.svg";
import Popup from "@/components/Popup";
import BadgesIcon from "@/public/static/images/icons/badges_icon.svg";
import BadgesIconWhite from "@/public/static/images/icons/badges_icon_white.svg";
import ExpandIconWhite from "@/public/static/images/expand_all_white.svg";
import ExpandIcon from "@/public/static/images/expand_all.svg";
import NoAvatarIcon from "@/public/static/images/no_avatar.svg";
import LoadingImage from "@/components/LoadingImage";
import Banner from "@/components/Banner";
import LetsConect from "@/public/static/images/lets_connect.svg";
import { useAffiliation } from "@/hooks/useAffiliation";
import { Profile } from "@/types/profile";
import { Capacity } from "@/types/capacity";
import { useState } from "react";
import BadgesCarousel from "@/components/BadgesCarousel";
import { useBadges } from "@/contexts/BadgesContext";
import BadgeSelectionModal from "@/components/BadgeSelectionModal";

interface ProfileEditDesktopViewProps {
  selectedAvatar: any;
  handleAvatarSelect: (avatarId: number) => void;
  showAvatarPopup: boolean;
  setShowAvatarPopup: (show: boolean) => void;
  handleWikidataClick: (newWikidataSelected: boolean) => void;
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
  formData: Partial<Profile>;
  setFormData: (data: Partial<Profile>) => void;
  territories: Record<string, string>;
  languages: Record<string, string>;
  affiliations: Record<string, string>;
  wikimediaProjects: Record<string, string>;
  avatars: any[] | undefined;
  refetch: () => Promise<any>;
  goTo: (path: string) => void;
  isImageLoading: boolean;
}

export default function ProfileEditDesktopView(
  props: ProfileEditDesktopViewProps
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
    handleSubmit,
    handleDeleteProfile,
    formData,
    setFormData,
    territories,
    languages,
    affiliations,
    wikimediaProjects,
    avatars,
    refetch,
    goTo,
    isImageLoading,
  } = props;

  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.token;

  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const { languages: languagesData, loading: languagesLoading } =
    useLanguage(token);
  const { wikimediaProjects: wikimediaProjectsData } =
    useWikimediaProject(token);
  const username = session?.user?.name;
  const [showDeleteProfilePopup, setShowDeleteProfilePopup] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const {
    userBadges,
    updateUserBadges,
    isLoading: isBadgesLoading,
  } = useBadges();
  const completedBadges = userBadges.filter((badge) => badge.progress === 100);
  const displayedBadges = completedBadges.filter((badge) => badge.is_displayed);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  return (
    <div
      className={`relative w-full overflow-x-hidden min-h-screen ${
        darkMode ? "bg-[#053749] text-white" : "bg-white text-[#053749]"
      }`}
    >
      <section
        className={`w-full max-w-screen-xl mx-auto px-12 py-8 ${
          isMobile ? "mt-[80px]" : "mt-[64px]"
        }`}
      >
        <div className={`flex flex-col gap-6 mx-[80px] mx-auto`}>
          {/* Image Profile Section */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-4 mb-12">
              <div className="flex flex-col gap-2 items-start">
                <h1
                  className={`font-[Montserrat] text-[48px] not-italic font-normal leading-[29px] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-welcome"]}
                </h1>
                <div className="flex items-center gap-[6px] py-6">
                  <div className="relative w-[48px] h-[48px]">
                    <Image
                      src={
                        darkMode ? AccountCircleIconWhite : AccountCircleIcon
                      }
                      alt="User circle icon"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <span
                    className={`text-start ${
                      darkMode ? "text-white" : "text-[#053749]"
                    } font-[Montserrat] text-[24px] font-extrabold`}
                  >
                    {username}
                  </span>
                </div>
              </div>
              <div className="flex flex-row gap-6 mt-0 w-3/4">
                <BaseButton
                  onClick={handleSubmit}
                  label={pageContent["edit-profile-save"]}
                  customClass="w-full flex items-center text-[24px] px-8 py-4 bg-[#851970] text-white rounded-md py-3 font-bold mb-0"
                  imageUrl={SaveIcon}
                  imageAlt="Save icon"
                  imageWidth={30}
                  imageHeight={30}
                />
                <BaseButton
                  onClick={() => router.back()}
                  label={pageContent["edit-profile-cancel"]}
                  customClass={`w-full flex items-center text-[24px] px-8 py-4 border border-[#053749] text-[#053749] rounded-md py-3 font-bold mb-0 ${
                    darkMode
                      ? "bg-transparent text-[#F6F6F6] border-[#F6F6F6] border-[2px]"
                      : "bg-[#F6F6F6] border-[#053749] text-[#053749]"
                  }`}
                  imageUrl={darkMode ? CancelIconWhite : CancelIcon}
                  imageAlt="Cancel icon"
                  imageWidth={30}
                  imageHeight={30}
                />
              </div>
            </div>
            <div className="flex flex-row gap-12 w-4/5">
              <div className="flex flex-col gap-4 w-1/2">
                <div className="flex flex-row gap-1 items-center">
                  <div className="relative w-[48px] h-[48px]">
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
                    } font-[Montserrat] text-[24px] font-bold`}
                  >
                    {pageContent["edit-profile-image-title"]}
                  </h2>
                </div>

                <div className="flex bg-gray-100 p-4 rounded-lg h-full items-center justify-center">
                  <div className="w-64 h-64 mx-auto mb-4 relative flex items-center justify-center">
                    {isImageLoading ? (
                      <LoadingImage />
                    ) : (
                      <Image
                        src={selectedAvatar.src}
                        alt="Selected avatar"
                        fill
                        className="object-contain"
                        onError={(e) => {
                          e.currentTarget.src = NoAvatarIcon;
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start mt-12 gap-2 w-1/2">
                <BaseButton
                  onClick={() => setShowAvatarPopup(true)}
                  label={pageContent["edit-profile-choose-avatar"]}
                  customClass={`w-full flex px-8 py-4 items-center rounded-[8px] ${
                    darkMode
                      ? "bg-capx-light-bg text-[#053749]"
                      : "bg-[#053749] text-[#F6F6F6]"
                  } font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] mb-0`}
                  imageUrl={darkMode ? ChangeCircleIconWhite : ChangeCircleIcon}
                  imageAlt="Change circle icon"
                  imageWidth={30}
                  imageHeight={30}
                />
                <span
                  className={`text-[20px] font-[Montserrat] not-italic font-normal leading-normal ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-choose-avatar-tooltip"]}
                </span>
                {showAvatarPopup && (
                  <AvatarSelectionPopup
                    onClose={() => setShowAvatarPopup(false)}
                    onSelect={handleAvatarSelect}
                    selectedAvatarId={selectedAvatar.id}
                  />
                )}
                <BaseButton
                  onClick={() => handleWikidataClick(!isWikidataSelected)}
                  label={pageContent["edit-profile-use-wikidata"]}
                  customClass={`w-full flex justify-between items-center px-8 py-4 rounded-[8px] font-[Montserrat] text-[24px] font-extrabold mb-0 mt-4 text-left ${
                    darkMode
                      ? "bg-transparent border-white text-capx-light-bg placeholder-white"
                      : "border-[#053749] text-capx-dark-box-bg"
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
                  imageWidth={30}
                  imageHeight={30}
                />
                <span
                  className={`text-[20px] font-[Montserrat] not-italic font-normal leading-normal ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-consent-wikidata"]}
                </span>
                <BaseButton
                  onClick={() => setShowDeleteProfilePopup(true)}
                  label={pageContent["edit-profile-delete-profile"]}
                  customClass={`w-full flex justify-between items-center px-8 py-4 rounded-[8px] font-[Montserrat] text-[24px] font-extrabold text-capx-dark-box-bg mb-0 mt-8 bg-[#D43831] text-white`}
                  imageUrl={DeleteIcon}
                  imageAlt="Delete icon"
                  imageWidth={30}
                  imageHeight={30}
                />
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
            </div>

            <div className="flex items-center gap-2 mt-4 mb-4">
              <Image
                src={darkMode ? BadgesIconWhite : BadgesIcon}
                alt="Badges icon"
                width={48}
                height={48}
              />
              <h2
                className={`font-[Montserrat] text-[24px] font-bold ${
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
              <BadgesCarousel
                badges={displayedBadges}
                showFullDescription={false}
              />
            ) : (
              !isBadgesLoading && (
                <span
                  className={`font-[Montserrat] text-[20px] not-italic font-normal leading-normal ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-badges-no-badges"]}
                </span>
              )
            )}

            {userBadges.length > 0 && (
              <BaseButton
                onClick={() => setShowBadgeModal(true)}
                label={pageContent["body-profile-badges-edit-your-badges"]}
                customClass={`w-fit flex mt-4 mb-4 ${
                  darkMode
                    ? "bg-capx-light-box-bg text-[#04222F]"
                    : "bg-[#053749] text-white"
                } rounded-md py-2 font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] mb-0 px-8 py-4 items-center gap-[4px]`}
                imageUrl={darkMode ? ChangeCircleIconWhite : ChangeCircleIcon}
                imageAlt={pageContent["body-profile-badges-edit-your-badges"]}
                imageWidth={30}
                imageHeight={30}
              />
            )}
            <div className="flex flex-col gap-2">
              <BaseButton
                onClick={() => router.push("/profile/badges")}
                label={pageContent["body-profile-badges-see-all"]}
                customClass={`w-fit flex mb-4 border ${
                  darkMode
                    ? "border-white text-white"
                    : "border-[#053749] text-[#053749]"
                } rounded-md py-2 font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] mb-0 px-8 py-4 items-center gap-[4px]`}
                imageUrl={darkMode ? ExpandIconWhite : ExpandIcon}
                imageAlt="Add capacity"
                imageWidth={30}
                imageHeight={30}
              />
              <span
                className={`font-[Montserrat] text-[20px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["body-profile-badges-description"]}
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-2 ">
            <div className="flex flex-row gap-2 items-center">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? PersonIconWhite : PersonIcon}
                  alt="Person icon"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="flex flex-row gap-1 items-center">
                <h2
                  className={`font-[Montserrat] text-[24px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-mini-bio"]}
                </h2>
              </div>
            </div>
            <div className="flex w-full px-3 py-4 flex-col items-start gap-[14px] rounded-[16px] border-[1px] border-[solid] border-capx-light-bg">
              <textarea
                value={formData.about || ""}
                onChange={(e) =>
                  setFormData({ ...formData, about: e.target.value })
                }
                placeholder={pageContent["edit-profile-mini-bio-placeholder"]}
                className={`w-full font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] p-6 bg-transparent resize-none min-h-[100px] rounded-[16px] border-[1px] border-[solid] border-[#053749] px-8 py-4 scrollbar-hide ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-[#053749] placeholder-[#829BA4]"
                }`}
              />
            </div>
            <span
              className={`font-[Montserrat] text-[20px] ${
                darkMode ? "text-white" : "text-[#053749]"
              }`}
            >
              {pageContent["edit-profile-mini-bio-tooltip"]}
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
                  width={48}
                  height={48}
                />
                <h2
                  className={`font-[Montserrat] text-[24px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-section-title-known-capacity"]}
                </h2>
              </div>
              <div
                className={`flex flex-wrap gap-2 rounded-[16px] ${
                  darkMode ? "bg-[#04222F]" : "bg-[#EFEFEF]"
                } flex w-full px-3 py-6 items-start gap-[12px]`}
              >
                {formData?.skills_known?.map((capacity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md"
                  >
                    <BaseButton
                      onClick={() => handleRemoveCapacity("known", index)}
                      label={getCapacityName(capacity)}
                      customClass="rounded-[4px] border-[1px] border-[solid] border-[var(--Links-light-link,#0070B9)] border-2 flex py-4 px-4 justify-center items-center gap-[4px] font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] !mb-0"
                      imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                      imageAlt="Close icon"
                      imageWidth={24}
                      imageHeight={24}
                    />
                  </div>
                ))}
              </div>
              <BaseButton
                onClick={() => handleAddCapacity("known")}
                label={pageContent["edit-profile-add-capacities"]}
                customClass={`w-fit flex ${
                  darkMode
                    ? "bg-capx-light-box-bg text-[#04222F]"
                    : "bg-[#053749] text-white"
                } rounded-md py-2 font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] mb-0 px-8 py-4 items-center gap-[4px]`}
                imageUrl={darkMode ? AddIconDark : AddIcon}
                imageAlt="Add capacity"
                imageWidth={30}
                imageHeight={30}
              />
              <span
                className={`text-[20px] font-[Montserrat] not-italic font-normal leading-normal ${
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
                  width={48}
                  height={48}
                />
                <h2
                  className={`font-[Montserrat] text-[24px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-section-title-available-capacity"]}
                </h2>
              </div>
              <div
                className={`flex flex-wrap gap-2 rounded-[16px] ${
                  darkMode ? "bg-[#04222F]" : "bg-[#EFEFEF]"
                } flex w-full px-3 py-6 items-start gap-[12px]`}
              >
                {formData?.skills_available?.map((capacity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md"
                  >
                    <BaseButton
                      onClick={() => handleRemoveCapacity("available", index)}
                      label={getCapacityName(capacity)}
                      customClass="rounded-[4px] border-[1px] border-[solid] border-[var(--Links-light-link,#05A300)] flex py-4 px-4 justify-center items-center gap-[4px] font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] !mb-0"
                      imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                      imageAlt="Close icon"
                      imageWidth={24}
                      imageHeight={24}
                    />
                  </div>
                ))}
              </div>
              <BaseButton
                onClick={() => handleAddCapacity("available")}
                label={pageContent["edit-profile-add-capacities"]}
                customClass={`w-fit flex ${
                  darkMode
                    ? "bg-capx-light-box-bg text-[#04222F]"
                    : "bg-[#053749] text-white"
                } rounded-md py-2 font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] mb-0 px-8 py-4 items-center gap-[4px]`}
                imageUrl={darkMode ? AddIconDark : AddIcon}
                imageAlt="Add capacity"
                imageWidth={30}
                imageHeight={30}
              />
              <span
                className={`text-[20px] font-[Montserrat] not-italic font-normal leading-normal ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["edit-profile-available-capacities"]}
              </span>
            </div>

            {/* Wanted Capacities */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? TargetIconWhite : TargetIcon}
                  alt="Wanted capacities icon"
                  width={48}
                  height={48}
                />
                <h2
                  className={`font-[Montserrat] text-[24px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-section-title-wanted-capacity"]}
                </h2>
              </div>
              <div
                className={`flex flex-wrap gap-2 rounded-[16px] ${
                  darkMode ? "bg-[#04222F]" : "bg-[#EFEFEF]"
                } flex w-full px-3 py-6 items-start gap-[12px]`}
              >
                {formData?.skills_wanted?.map((capacity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md"
                  >
                    <BaseButton
                      onClick={() => handleRemoveCapacity("wanted", index)}
                      label={getCapacityName(capacity)}
                      customClass="rounded-[4px] border-[1px] border-[solid] border-[var(--Links-light-link,#D43831)] flex px-2 py-2 pb-2 justify-center items-center gap-[4px] font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] !mb-0"
                      imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                      imageAlt="Close icon"
                      imageWidth={24}
                      imageHeight={24}
                    />
                  </div>
                ))}
              </div>
              <BaseButton
                onClick={() => handleAddCapacity("wanted")}
                label={pageContent["edit-profile-add-capacities"]}
                customClass={`w-fit flex ${
                  darkMode
                    ? "bg-capx-light-box-bg text-[#04222F]"
                    : "bg-[#053749] text-white"
                } rounded-md py-2 font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] mb-0 px-8 py-4 items-center gap-[4px]`}
                imageUrl={darkMode ? AddIconDark : AddIcon}
                imageAlt="Add capacity"
                imageWidth={30}
                imageHeight={30}
              />
              <span
                className={`text-[20px] font-[Montserrat] not-italic font-normal leading-normal ${
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
                  width={48}
                  height={48}
                />
                <h2
                  className={`font-[Montserrat] text-[24px] font-bold ${
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
                    <span className="font-[Montserrat] text-[24px]">
                      {languagesData[lang.id]}
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
                      className={`ml-2 p-1 rounded border text-[24px] ${
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
                        width={24}
                        height={24}
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
                  className={`w-full px-4 py-2 rounded-[16px] font-[Montserrat] text-[24px] appearance-none ${
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
                  {Object.entries(languagesData).map(([id, name]) => (
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
                    width={24}
                    height={24}
                  />
                </div>
              </div>
            </div>

            <span
              className={`text-[20px] font-[Montserrat] not-italic font-normal leading-normal ${
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
                  width={48}
                  height={48}
                />
                <h2
                  className={`font-[Montserrat] text-[24px] font-bold ${
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
                className={`w-full px-4 py-2 rounded-[16px] font-[Montserrat] text-[24px] ${
                  darkMode
                    ? "bg-transparent border-white text-white opacity-50 placeholder-gray-400"
                    : "border-[#053749] text-[#829BA4]"
                } border`}
              />
              <span
                className={`text-[24px] font-[Montserrat] not-italic font-normal leading-normal ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["edit-profile-share-username"]}
              </span>
            </div>
            {/* Affiliation Section */}
            <div className="flex flex-col gap-4 mt-4">
              {/* Título e ícone */}
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? AffiliationIconWhite : AffiliationIcon}
                  alt="Affiliation icon"
                  width={48}
                  height={48}
                />
                <h2
                  className={`font-[Montserrat] text-[24px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-section-title-affiliation"]}
                </h2>
              </div>

              {/* Lista de afiliações */}
              <div className="flex flex-wrap gap-2">
                {formData.affiliation?.map((aff, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded ${
                      darkMode ? "bg-capx-dark-bg" : "bg-[#EFEFEF]"
                    }`}
                  >
                    <span className="font-[Montserrat] text-[24px]">
                      {affiliations[aff]}
                    </span>
                    <button
                      onClick={() => {
                        const newAffiliations = [
                          ...(formData.affiliation || []),
                        ];
                        newAffiliations.splice(index, 1);
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
                        width={24}
                        height={24}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Select para adicionar nova afiliação */}
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    if (
                      e.target.value &&
                      !formData.affiliation?.includes(e.target.value)
                    ) {
                      setFormData({
                        ...formData,
                        affiliation: [
                          ...(formData.affiliation || []),
                          e.target.value,
                        ],
                      });
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-[16px] font-[Montserrat] text-[24px] appearance-none ${
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
                    width={24}
                    height={24}
                  />
                </div>
              </div>

              {/* Tooltip */}
              <span
                className={`text-[20px] font-[Montserrat] not-italic font-normal leading-normal ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["body-profile-section-affiliation-dropdown-menu"]}
              </span>
            </div>
            {/* Territory Section */}
            <div className="flex flex-col gap-4 mt-4">
              {/* Título e ícone */}
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? TerritoryIconWhite : TerritoryIcon}
                  alt="Territory icon"
                  width={48}
                  height={48}
                />
                <h2
                  className={`font-[Montserrat] text-[24px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-section-title-territory"]}
                </h2>
              </div>

              {/* Lista de territórios */}
              <div className="flex flex-wrap gap-2">
                {formData.territory?.map((terr, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded ${
                      darkMode ? "bg-capx-dark-bg" : "bg-[#EFEFEF]"
                    }`}
                  >
                    <span className="font-[Montserrat] text-[24px]">
                      {territories[terr]}
                    </span>
                    <button
                      onClick={() => {
                        const newTerritories = [...(formData.territory || [])];
                        newTerritories.splice(index, 1);
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
                        width={24}
                        height={24}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Select para adicionar novo território */}
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    if (
                      e.target.value &&
                      !formData.territory?.includes(e.target.value)
                    ) {
                      setFormData({
                        ...formData,
                        territory: [
                          ...(formData.territory || []),
                          e.target.value,
                        ],
                      });
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-[16px] font-[Montserrat] text-[24px] appearance-none ${
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
                    width={24}
                    height={24}
                  />
                </div>
              </div>

              {/* Tooltip */}
              <span
                className={`text-[20px] font-[Montserrat] not-italic font-normal leading-normal ${
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
                  width={24}
                  height={24}
                />
                <h2
                  className={`font-[Montserrat] text-[24px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-wikidata-item"]}
                </h2>
              </div>
              <div className="flex items-center gap-2 py-[6px] ">
                <BaseButton
                  onClick={() => handleWikidataClick(!isWikidataSelected)}
                  label={pageContent["edit-profile-use-wikidata"]}
                  customClass={`w-full flex justify-between items-center px-[13px] py-[6px] rounded-[16px] font-[Montserrat] text-[24px] appearance-none mb-0 pb-[6px] ${
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
                  imageWidth={24}
                  imageHeight={24}
                />
              </div>
              <span
                className={`text-[20px] font-[Montserrat] not-italic font-normal leading-normal ${
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
                  width={48}
                  height={48}
                />
                <h2
                  className={`font-[Montserrat] text-[24px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-wikimedia-projects-title"]}
                </h2>
              </div>

              {/* Display selected projects as tags with delete button */}
              <div
                className={`flex flex-wrap gap-2 rounded-[16px] ${
                  darkMode ? "bg-[#04222F]" : "bg-[#EFEFEF]"
                } w-full px-3 py-6 items-start gap-[12px]`}
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
                      label={wikimediaProjectsData[projectId] || projectId}
                      customClass="rounded-[16px] border-[1px] border-[solid] border-[var(--Links-light-link,#0070B9)] flex py-4 px-4 justify-center items-center gap-[4px] font-[Montserrat] text-[24px] not-italic font-normal leading-[normal]"
                      imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                      imageAlt="Remove project"
                      imageWidth={24}
                      imageHeight={24}
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
                    className={`w-full px-4 py-2 rounded-[16px] font-[Montserrat] text-[24px] appearance-none ${
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
                    {Object.entries(wikimediaProjectsData).map(([id, name]) => (
                      <option
                        key={id}
                        value={id}
                        style={{
                          backgroundColor: darkMode ? "#053749" : "white",
                          color: darkMode ? "white" : "#053749",
                        }}
                        className="font-[Montserrat] text-[24px]"
                      >
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Image
                      src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
                      alt="Select"
                      width={24}
                      height={24}
                    />
                  </div>
                </div>
              )}

              <BaseButton
                onClick={() => setShowProjectSelector(true)}
                label={pageContent["edit-profile-add-projects"]}
                customClass={`w-1/4 flex ${
                  darkMode
                    ? "bg-capx-light-box-bg text-[#04222F]"
                    : "bg-[#053749] text-white"
                } rounded-md py-2 font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] mb-0 px-8 py-4 items-center gap-[4px]`}
                imageUrl={darkMode ? AddIconDark : AddIcon}
                imageAlt="Add project"
                imageWidth={30}
                imageHeight={30}
              />
              <span
                className={`text-[24px] font-[Montserrat] not-italic font-normal leading-normal ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["edit-profile-wikimedia-projects"]}
              </span>
            </div>
          </div>
          {/* <div className="p-4 bg-[#EFEFEF]">
            <Banner
              image={LetsConect}
              alt={pageContent["privacy-policy-alt-banner"]}
              customClass={{
                background: "bg-[#EFEFEF]",
                wrapper: "mb-0",
              }}
            />

            <BaseButton
              onClick={() => goTo("/profile/lets_connect")}
              label={pageContent["lets-connect-form-user-edit"]}
              customClass={`w-1/3 flex ${
                darkMode
                  ? "bg-capx-light-box-bg text-[#04222F]"
                  : "bg-[#053749] text-white"
              } rounded-md py-2 font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] mb-0 px-8 py-4 items-center gap-[4px]`}
              imageUrl={darkMode ? UserCheckIconDark : UserCheckIcon}
              imageAlt="Add project"
              imageWidth={20}
              imageHeight={20}
            />
            <p
              className={`text-[20px] font-[Montserrat] not-italic font-normal leading-normal ${
                darkMode ? "text-white" : "text-[#053749]"
              }`}
            >
              {pageContent["lets-connect-edit-user-info"]}
            </p>
          </div> */}
          {/* Action Buttons */}
          <div className="flex flex-row gap-6 mt-6">
            <BaseButton
              onClick={handleSubmit}
              label={pageContent["edit-profile-save"]}
              customClass="w-full flex items-center text-[24px] px-8 py-4 bg-[#851970] text-white rounded-md py-3 font-bold mb-0"
              imageUrl={SaveIcon}
              imageAlt="Save icon"
              imageWidth={30}
              imageHeight={30}
            />
            <BaseButton
              onClick={() => router.back()}
              label={pageContent["edit-profile-cancel"]}
              customClass={`w-full flex items-center text-[24px] px-8 py-4 border ${
                darkMode
                  ? "border-white text-white"
                  : "border-[#053749] text-[#053749]"
              } rounded-md py-3 font-bold mb-0`}
              imageUrl={darkMode ? CancelIconWhite : CancelIcon}
              imageAlt="Cancel icon"
              imageWidth={30}
              imageHeight={30}
            />
          </div>
        </div>
      </section>
      <CapacitySelectionModal
        isOpen={showCapacityModal}
        onClose={() => setShowCapacityModal(false)}
        onSelect={handleCapacitySelect}
        title={`Choose ${selectedCapacityType} capacity`}
      />

      {showBadgeModal && (
        <BadgeSelectionModal
          badges={completedBadges}
          selectedBadges={displayedBadges.map((badge) => badge.id)}
          onClose={() => setShowBadgeModal(false)}
          onUpdate={async (selectedIds) => {
            setShowBadgeModal(false);
            await updateUserBadges(selectedIds);
          }}
        />
      )}
    </div>
  );
}
