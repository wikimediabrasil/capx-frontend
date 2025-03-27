import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getProfileImage } from "@/lib/utils/getProfileImage";
import { useOrganization } from "@/hooks/useOrganizationProfile";
import { useUserProfile } from "@/hooks/useUserProfile";
import UserCircleIcon from "@/public/static/images/supervised_user_circle.svg";
import UserCircleIconWhite from "@/public/static/images/supervised_user_circle_white.svg";
import SaveIcon from "@/public/static/images/save_as.svg";
import CancelIcon from "@/public/static/images/cancel.svg";
import CancelIconWhite from "@/public/static/images/cancel_white.svg";
import ReportIcon from "@/public/static/images/report.svg";
import ReportIconWhite from "@/public/static/images/report_white.svg";
import NeurologyIcon from "@/public/static/images/neurology.svg";
import NeurologyIconWhite from "@/public/static/images/neurology_white.svg";
import WikimediaIcon from "@/public/static/images/wikimedia_logo_black.svg";
import WikimediaIconWhite from "@/public/static/images/wikimedia_logo_white.svg";
import ContactMetaIcon from "@/public/static/images/contact_meta.svg";
import ContactMetaIconWhite from "@/public/static/images/contact_meta_white.svg";
import ContactEmailIcon from "@/public/static/images/contact_alternate_email.svg";
import ContactEmailIconWhite from "@/public/static/images/contact_alternate_email_white.svg";
import ContactPortalIcon from "@/public/static/images/contact_captive_portal.svg";
import ContactPortalIconWhite from "@/public/static/images/contact_captive_portal_white.svg";
import CloseIcon from "@/public/static/images/close_mobile_menu_icon_light_mode.svg";
import CloseIconWhite from "@/public/static/images/close_mobile_menu_icon_dark_mode.svg";
import AddIcon from "@/public/static/images/add_dark.svg";
import AddIconWhite from "@/public/static/images/add.svg";
import NoAvatarIcon from "@/public/static/images/no_avatar.svg";
import BaseButton from "@/components/BaseButton";
import { formatWikiImageUrl } from "@/lib/utils/fetchWikimediaData";
import EmojiIcon from "@/public/static/images/emoji_objects.svg";
import EmojiIconWhite from "@/public/static/images/emoji_objects_white.svg";
import TargetIcon from "@/public/static/images/target.svg";
import TargetIconWhite from "@/public/static/images/target_white.svg";
import CapacitySelectionModal from "@/components/CapacitySelectionModal";
import ProjectsFormItem from "./ProjectsFormItem";
import EventsFormItem from "./EventsFormItem";
import NewsFormItem from "./NewsFormItem";
import DocumentFormItem from "./DocumentFormItem";
import { useAvatars } from "@/hooks/useAvatars";

export default function OrganizationProfileEditMobileView({
  handleSubmit,
  handleRemoveCapacity,
  handleAddCapacity,
  handleAddDocument,
  handleDeleteEvent,
  getCapacityName,
  formData,
  setFormData,
  contactsData,
  setContactsData,
  documentsData,
  setDocumentsData,
  isModalOpen,
  setIsModalOpen,
  currentCapacityType,
  handleCapacitySelect,
  projectsData,
  handleDeleteProject,
  handleProjectChange,
  handleAddProject,
  diffTagsData,
  handleDeleteDiffTag,
  handleDiffTagChange,
  handleAddDiffTag,
  eventsData,
  handleEventChange,
  handleAddEvent,
  handleDeleteDocument,
  handleDocumentChange,
}) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const { data: session } = useSession();
  const { userProfile, isLoading: isUserLoading } = useUserProfile();
  const { avatars } = useAvatars();
  const { organization } = useOrganization();
  const router = useRouter();
  return (
    <div
      className={`relative w-full overflow-x-hidden min-h-screen ${
        darkMode ? "bg-capx-dark-box-bg text-white" : "bg-white text-[#053749]"
      }`}
    >
      <section
        className={`flex w-full h-full justify-between pb-6 pt-10 px-4 md:px-8 lg:px-12 max-w-screen-xl mx-auto`}
      >
        <div className="flex flex-col gap-6 mx-auto">
          {/* Header */}
          <div className="flex flex-row gap-12">
            {/* Logo Section */}
            <div className="w-1/2">
              <div className="rounded-[16px] h-full items-center justify-center flex bg-[#EFEFEF]">
                <div className="relative w-[300px] h-[165px]">
                  <Image
                    src={formatWikiImageUrl(formData?.profile_image || "")}
                    alt="Organization logo"
                    className="object-contain w-full rounded-lg"
                    fill
                    sizes="300px"
                    priority
                  />
                </div>
              </div>
            </div>
            <div className="w-1/2">
              <div className="relative w-[114px] h-[114px] mb-[24px]">
                <Image
                  src={getProfileImage(
                    userProfile?.profile_image,
                    userProfile?.avatar,
                    avatars
                  )}
                  alt="User Profile Image"
                  fill
                  sizes="114px"
                  priority
                  className="object-contain w-full rounded-lg"
                />
              </div>
              <div
                className={`flex flex-col gap-2 text-[30px] mb-[24px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                <h1
                  className={`font-[Montserrat] not-italic font-normal leading-[29px] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-welcome"]}
                </h1>
                <h2
                  className={`font-[Montserrat] not-italic font-extrabold leading-[normal] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {session?.user?.name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-[42px] h-[42px]">
                  <Image
                    src={darkMode ? UserCircleIconWhite : UserCircleIcon}
                    alt="User circle icon"
                    className="object-contain"
                  />
                </div>

                <span
                  className={`text-start font-[Montserrat] text-[24px] font-extrabold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {formData?.display_name}
                </span>
              </div>

              {/* <p
                className={`font-[Montserrat] text-[20px] mt-3 mb-6 ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {formData?.acronym}
              </p> */}

              {/* Save/Cancel Buttons */}
              <div className="flex flex-col gap-4 mt-4">
                <BaseButton
                  onClick={handleSubmit}
                  label={pageContent["edit-profile-save"]}
                  customClass="flex bg-[#851970] items-center justify-between text-white px-4 py-2 rounded-[8px] font-[Montserrat] text-[24px] font-bold !px-[32px] !py-[16px] !w-3/4 h-auto !mb-0"
                  imageUrl={SaveIcon}
                  imageAlt="Save icon"
                  imageWidth={32}
                  imageHeight={32}
                />
                <BaseButton
                  onClick={() => router.back()}
                  label={pageContent["edit-profile-cancel"]}
                  customClass="flex border rounded-[4px] border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#FFF] items-center justify-between text-capx-dark-box-bg !px-[32px] !py-[16px] rounded-[8px] font-[Montserrat] text-[24px] w-3/4 font-bold pb-[6px]"
                  imageUrl={CancelIcon}
                  imageAlt="Cancel icon"
                  imageWidth={32}
                  imageHeight={32}
                />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Organization logo"
                  className="object-contain"
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold`}
              >
                {pageContent["edit-profile-organization-logo"]}
              </h2>
            </div>

            <div
              className={`flex flex-col gap-4 ${
                darkMode ? "text-white" : "text-[#053749]"
              }`}
            >
              <input
                type="text"
                placeholder="Wikimedia Commons image's link (ex: File:Example.jpg)"
                className={`w-full p-2 md:p-3 text-[14px] md:text-[24px] border rounded-md ${
                  darkMode
                    ? "bg-transparent border-white text-white placeholder-gray-400"
                    : "border-gray-300 text-[#829BA4]"
                }`}
                value={formData.profile_image || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile_image: e.target.value,
                  })
                }
              />
              <p
                className={`text-[12px] md:text-[20px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                } mt-1`}
              >
                {pageContent["edit-profile-organization-logo-help"]}
              </p>

              {/* Preview da imagem */}
              <div className="w-full h-[200px] bg-[#EFEFEF] rounded-md flex items-center justify-center overflow-hidden">
                {formData.profile_image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={formatWikiImageUrl(formData.profile_image)}
                      alt="Organization logo preview"
                      className="object-contain"
                      fill
                      onError={(e) => {
                        console.error("Erro ao carregar preview:", e);
                        e.currentTarget.src = NoAvatarIcon;
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Image
                      src={NoAvatarIcon}
                      alt="Sem imagem"
                      width={100}
                      height={100}
                      className="opacity-50"
                    />
                    <span className="text-gray-500 mt-2">
                      {pageContent["edit-profile-no-image"]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Report of Activities Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? ReportIconWhite : ReportIcon}
                  alt="Report icon"
                  className="object-contain"
                  fill
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold`}
              >
                {pageContent["organization-profile-report-activities-title"]}
              </h2>
            </div>
            <input
              type="text"
              placeholder={pageContent["edit-profile-insert-link"]}
              className={`w-full p-2 md:p-3 text-[24px] border rounded-md ${
                darkMode
                  ? "bg-transparent border-white text-white placeholder-gray-400"
                  : "border-gray-300 text-[#829BA4]"
              }`}
              value={formData.meta_page || ""}
              onChange={(e) =>
                setFormData({ ...formData, meta_page: e.target.value })
              }
            />
            <p
              className={`text-[20px] ${
                darkMode ? "text-white" : "text-[#053749]"
              } mt-1`}
            >
              {pageContent["organization-profile-provide-meta-link"]}
            </p>
          </div>

          {/* Capacities Sections */}
          <div className="space-y-6 mt-8">
            {/* Known Capacities */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? NeurologyIconWhite : NeurologyIcon}
                    alt="Neurology icon"
                    className="object-contain"
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold flex items-center gap-2 ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-known-capacities-title"]}
                </h2>
              </div>
              <div
                className={`flex flex-wrap gap-2 mt-2 px-[12px] py-[24px] rounded-[16px] ${
                  darkMode
                    ? "text-white bg-[#04222F]"
                    : "text-[#053749] bg-transparent"
                }`}
              >
                {formData.known_capacities?.map((capacity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md"
                  >
                    <BaseButton
                      onClick={() =>
                        handleRemoveCapacity(currentCapacityType, index)
                      }
                      label={getCapacityName(capacity)}
                      customClass={`rounded-[4px] border-[1px] border-[solid] border-[#0070B9] flex p-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[24px] not-italic font-normal leading-[normal]`}
                      imageUrl={darkMode ? CloseIconWhite : CloseIcon}
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
                customClass={`rounded-[8px] !w-fit mt-2 flex !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode
                    ? "text-[#053749] bg-[#EFEFEF]"
                    : "text-white bg-capx-dark-box-bg"
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={32}
                imageHeight={32}
              />
              <p
                className={`text-[20px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                } mt-1`}
              >
                {pageContent["edit-profile-select-skills"]}
              </p>
            </div>

            {/* Available Capacities */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? EmojiIconWhite : EmojiIcon}
                    alt="Emoji icon"
                    className="object-contain"
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold flex items-center gap-2 ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-available-capacities-title"]}
                </h2>
              </div>
              <div
                className={`flex flex-wrap gap-2 mt-2 px-[12px] py-[24px] rounded-[16px] ${
                  darkMode
                    ? "text-white bg-[#04222F]"
                    : "text-[#053749] bg-transparent"
                }`}
              >
                {formData.available_capacities?.map((capacity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md"
                  >
                    <BaseButton
                      onClick={() =>
                        handleRemoveCapacity(currentCapacityType, index)
                      }
                      label={getCapacityName(capacity)}
                      customClass={`rounded-[4px] border-[1px] border-[solid] border-[#05A300] flex p-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[24px] not-italic font-normal leading-[normal]`}
                      imageUrl={darkMode ? CloseIconWhite : CloseIcon}
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
                customClass={`rounded-[8px] w-fit mt-2 flex !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode
                    ? "text-[#053749] bg-[#EFEFEF]"
                    : "text-white bg-capx-dark-box-bg"
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={32}
                imageHeight={32}
              />
              <p
                className={`text-[20px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                } mt-1`}
              >
                {pageContent["body-profile-choose-skills"]}
              </p>
            </div>

            {/* Wanted Capacities */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? TargetIconWhite : TargetIcon}
                    alt="Target icon"
                    className="object-contain"
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold flex items-center gap-2 ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-wanted-capacities-title"]}
                </h2>
              </div>
              <div
                className={`flex flex-wrap gap-2 mt-2 px-[12px] py-[24px] rounded-[16px] ${
                  darkMode
                    ? "text-white bg-[#04222F]"
                    : "text-[#053749] bg-transparent"
                }`}
              >
                {formData.wanted_capacities?.map((capacity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md"
                  >
                    <BaseButton
                      onClick={() =>
                        handleRemoveCapacity(currentCapacityType, index)
                      }
                      label={getCapacityName(capacity)}
                      customClass={`rounded-[4px] border-[1px] border-[solid] border-[#D43831] flex p-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[24px] not-italic font-normal leading-[normal]`}
                      imageUrl={darkMode ? CloseIconWhite : CloseIcon}
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
                customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode
                    ? "text-[#053749] bg-[#EFEFEF]"
                    : "text-white bg-capx-dark-box-bg"
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={32}
                imageHeight={32}
              />
              <p
                className={`text-[20px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                } mt-1`}
              >
                {pageContent["edit-profile-wanted-capacities"]}
              </p>
            </div>
          </div>

          {/* Projects Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Project icon"
                  className="object-contain"
                  fill
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[24px] font-bold ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["edit-profile-main-projects"]}
              </h2>
            </div>

            <div className="flex w-full gap-2 mb-2 flex-col">
              {projectsData.map((project, index) => (
                <ProjectsFormItem
                  key={project.id === 0 ? `new-${index}` : project.id}
                  project={project}
                  index={index}
                  onDelete={handleDeleteProject}
                  onChange={handleProjectChange}
                />
              ))}
              <BaseButton
                onClick={() => {
                  handleAddProject();
                }}
                label={pageContent["edit-profile-add-projects"]}
                customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode
                    ? "text-[#053749] bg-[#EFEFEF]"
                    : "text-white bg-capx-dark-box-bg"
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={32}
                imageHeight={32}
              />
            </div>
            <p
              className={`text-[20px] ${
                darkMode ? "text-white" : "text-[#053749]"
              } mt-1`}
            >
              {pageContent["edit-profile-display-links"]}
            </p>
          </div>

          {/* Events Section */}
          {/*           <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Event icon"
                  fill
                  className="object-contain"
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["body-profile-section-title-events"]}
              </h2>
            </div>

            <div className="flex w-full flex-col mb-2 gap-2">
              {eventsData?.map((event, index) => (
                <EventsFormItem
                  key={event.id === 0 ? `new-${index}` : event.id}
                  eventData={event}
                  index={index}
                  onDelete={handleDeleteEvent}
                  onChange={handleEventChange}
                />
              ))}
              <BaseButton
                onClick={handleAddEvent}
                label={pageContent["edit-profile-add-events"]}
                customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode
                    ? "text-[#053749] bg-[#EFEFEF]"
                    : "text-white bg-capx-dark-box-bg"
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={32}
                imageHeight={32}
              />
            </div>
            <p
              className={`text-[20px] ${
                darkMode ? "text-white" : "text-[#053749]"
              } mt-1`}
            >
              {pageContent["edit-profile-display-events"]}
            </p>
          </div> */}

          {/* News Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="News icon"
                  className="object-contain"
                  fill
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["edit-profile-news"]}
              </h2>
            </div>

            <div className="flex flex-col w-full gap-2 mb-2">
              {diffTagsData?.map((tag, index) => (
                <NewsFormItem
                  key={tag.id === 0 ? `new-${index}` : tag.id}
                  news={tag}
                  index={index}
                  onDelete={handleDeleteDiffTag}
                  onChange={handleDiffTagChange}
                />
              ))}
            </div>

            <BaseButton
              onClick={handleAddDiffTag}
              label={pageContent["edit-profile-add-diff-tags"]}
              customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                darkMode
                  ? "text-[#053749] bg-[#EFEFEF]"
                  : "text-white bg-capx-dark-box-bg"
              }`}
              imageUrl={darkMode ? AddIcon : AddIconWhite}
              imageAlt="Add icon"
              imageWidth={32}
              imageHeight={32}
            />
            <p
              className={`text-[20px] ${
                darkMode ? "text-white" : "text-[#053749]"
              } mt-1`}
            >
              {pageContent["edit-profile-enter-diff-tags"]}
            </p>
          </div>

          {/* Documents Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Document icon"
                  className="object-contain"
                  fill
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["body-profile-section-title-documents"]}
              </h2>
            </div>

            <div className="flex flex-col w-full gap-2 mb-2">
              {documentsData?.map((document, index) => (
                <DocumentFormItem
                  key={index}
                  document={document}
                  index={index}
                  onDelete={handleDeleteDocument}
                  onChange={handleDocumentChange}
                />
              ))}
            </div>

            <BaseButton
              onClick={handleAddDocument}
              label={pageContent["edit-profile-add-more-links"]}
              customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                darkMode
                  ? "text-[#053749] bg-[#EFEFEF]"
                  : "text-white bg-capx-dark-box-bg"
              }`}
              imageUrl={darkMode ? AddIcon : AddIconWhite}
              imageAlt="Add icon"
              imageWidth={32}
              imageHeight={32}
            />
            <p
              className={`text-[20px] ${
                darkMode ? "text-white" : "text-[#053749]"
              } mt-1`}
            >
              {pageContent["edit-profile-share-documents-tooltop"]}
            </p>
          </div>

          {/* Contacts Section */}

          <section className="w-full max-w-screen-xl py-8">
            <div className="flex flex-row flex pl-0 pr-[13px] py-[6px] items-center gap-[4px] rounded-[8px] mb-6">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Wikimedia"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
                }`}
              >
                {pageContent["body-profile-section-title-contacts"]}
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <div
                className={`flex flex-row border-[1px] border-[solid] w-full px-[12px] py-[24px] items-center gap-[12px] rounded-[16px] ${
                  darkMode
                    ? "bg-capx-dark-box-bg border-white"
                    : "bg-[#FFF] border-capx-dark-box-bg"
                }`}
              >
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? ContactMetaIconWhite : ContactMetaIcon}
                    alt="Contact Meta"
                    fill
                    className={`object-contain ${
                      darkMode ? "bg-capx-dark-box-bg" : "bg-white"
                    }`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Metawiki"
                  className={`text-start font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
                    darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
                  }`}
                  value={contactsData.meta_page || ""}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setContactsData((prev) => ({
                      ...prev,
                      meta_page: newValue,
                    }));
                  }}
                />
              </div>
              <div
                className={`flex flex-row border-[1px] border-[solid] w-full px-[12px] py-[24px] items-center gap-[12px] rounded-[16px] ${
                  darkMode
                    ? "bg-capx-dark-box-bg border-white"
                    : "bg-[#FFF] border-capx-dark-box-bg"
                }`}
              >
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? ContactEmailIconWhite : ContactEmailIcon}
                    alt="Contact Email"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Email"
                  className={`text-start font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
                    darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
                  }`}
                  value={contactsData.email || ""}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setContactsData((prev) => ({
                      ...prev,
                      email: newValue,
                    }));
                  }}
                />
              </div>
              <div
                className={`flex flex-row border-[1px] border-[solid] w-full px-[12px] py-[24px] items-center gap-[12px] rounded-[16px] ${
                  darkMode
                    ? "bg-capx-dark-box-bg border-white"
                    : "bg-[#FFF] border-capx-dark-box-bg"
                }`}
              >
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? ContactPortalIconWhite : ContactPortalIcon}
                    alt="Contact Website"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Website"
                  className={`text-start font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
                    darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
                  }`}
                  value={contactsData.website || ""}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setContactsData((prev) => ({
                      ...prev,
                      website: newValue,
                    }));
                  }}
                />
              </div>
            </div>

            <p
              className={`text-[20px] ${
                darkMode ? "text-white" : "text-[#053749]"
              } mt-1`}
            ></p>
          </section>

          {/* Save/Cancel Buttons */}
          <div className="flex flex-row gap-2 mt-6 w-[50%] md:w-[75%] lg:w-[50%]">
            <BaseButton
              onClick={handleSubmit}
              label={pageContent["edit-profile-save"]}
              customClass="flex border w-1/2 rounded-[4px] border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#851970]  items-center justify-between text-white !px-[32px] !py-[16px] rounded-md font-[Montserrat] text-[24px] font-bold pb-[6px]"
              imageUrl={SaveIcon}
              imageAlt="Save icon"
              imageWidth={32}
              imageHeight={32}
            />
            <BaseButton
              onClick={() => router.back()}
              label={pageContent["edit-profile-cancel"]}
              customClass="flex border w-1/2 rounded-[4px] border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#FFF] items-center justify-between text-capx-dark-box-bg !px-[32px] !py-[16px] rounded-md font-[Montserrat] text-[24px] font-bold pb-[6px]"
              imageUrl={CancelIcon}
              imageAlt="Cancel icon"
              imageWidth={32}
              imageHeight={32}
            />
          </div>
        </div>
      </section>
      <CapacitySelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleCapacitySelect}
        title={pageContent["edit-profile-select-capacities"]?.replace(
          "$1",
          pageContent[currentCapacityType]
        )}
      />
    </div>
  );
}
