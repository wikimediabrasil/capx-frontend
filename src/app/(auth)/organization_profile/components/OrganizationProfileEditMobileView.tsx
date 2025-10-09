import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProfileImage } from '@/lib/utils/getProfileImage';
import { useOrganization } from '@/hooks/useOrganizationProfile';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserCircleIcon from '@/public/static/images/supervised_user_circle.svg';
import UserCircleIconWhite from '@/public/static/images/supervised_user_circle_white.svg';
import SaveIcon from '@/public/static/images/save_as.svg';
import CancelIcon from '@/public/static/images/cancel.svg';
import CancelIconWhite from '@/public/static/images/cancel_white.svg';
import ReportIcon from '@/public/static/images/report.svg';
import ReportIconWhite from '@/public/static/images/report_white.svg';
import NeurologyIcon from '@/public/static/images/neurology.svg';
import NeurologyIconWhite from '@/public/static/images/neurology_white.svg';
import WikimediaIcon from '@/public/static/images/wikimedia_logo_black.svg';
import WikimediaIconWhite from '@/public/static/images/wikimedia_logo_white.svg';
import ContactMetaIcon from '@/public/static/images/contact_meta.svg';
import ContactMetaIconWhite from '@/public/static/images/contact_meta_white.svg';
import ContactEmailIcon from '@/public/static/images/contact_alternate_email.svg';
import ContactEmailIconWhite from '@/public/static/images/contact_alternate_email_white.svg';
import ContactPortalIcon from '@/public/static/images/contact_captive_portal.svg';
import ContactPortalIconWhite from '@/public/static/images/contact_captive_portal_white.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import AddIcon from '@/public/static/images/add_dark.svg';
import AddIconWhite from '@/public/static/images/add.svg';
import NoAvatarIcon from '@/public/static/images/no_avatar.svg';
import BaseButton from '@/components/BaseButton';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import EmojiIcon from '@/public/static/images/emoji_objects.svg';
import EmojiIconWhite from '@/public/static/images/emoji_objects_white.svg';
import TargetIcon from '@/public/static/images/target.svg';
import TargetIconWhite from '@/public/static/images/target_white.svg';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import ArrowDownIcon from '@/public/static/images/arrow_drop_down_circle.svg';
import ArrowDownIconWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';
import CapacitySelectionModal from '@/components/CapacitySelectionModal';
import ProjectsFormItem from './ProjectsFormItem';
import EventsList from '@/app/events/components/EventsList';
import NewsFormItem from './NewsFormItem';
import DocumentFormItem from './DocumentFormItem';
import { useAvatars } from '@/hooks/useAvatars';
import ExpandAllIcon from '@/public/static/images/expand_all.svg';
import ExpandAllIconWhite from '@/public/static/images/expand_all_white.svg';
import LoadingState from '@/components/LoadingState';

export default function OrganizationProfileEditMobileView({
  handleSubmit,
  handleRemoveCapacity,
  handleAddCapacity,
  handleAddDocument,
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
  handleEditEvent,
  handleAddEvent,
  handleDeleteEvent,
  handleDeleteDocument,
  handleDocumentChange,
  capacities,
  handleChooseEvent,
  handleViewAllEvents,
  territories,
}) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const { data: session } = useSession();
  const { userProfile, isLoading: isUserLoading } = useUserProfile();
  const { avatars, isLoading: isAvatarsLoading } = useAvatars();
  const { organization } = useOrganization();
  const router = useRouter();

  return (
    <div
      className={`relative w-full overflow-x-hidden min-h-screen ${
        darkMode ? 'bg-[#053749] text-white' : 'bg-white text-[#053749]'
      }`}
    >
      <section
        className={`w-full max-w-screen-xl mx-auto px-4 py-8 ${
          isMobile ? 'mt-[80px]' : 'mt-[64px]'
        }`}
      >
        <div className="flex flex-col gap-6 max-w-[600px] mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between gap-4 items-center">
              <div className="flex flex-col gap-2">
                <h1
                  className={`font-[Montserrat] text-[16px] not-italic font-normal leading-[29px] ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['edit-profile-welcome']}
                </h1>
                <h2
                  className={`font-[Montserrat] text-[20px] not-italic font-extrabold leading-[normal] ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {session?.user?.name}
                </h2>
              </div>
              <div className="relative w-[75px] h-[75px]">
                {isAvatarsLoading || isUserLoading ? (
                  <LoadingState />
                ) : (
                  <Image
                    src={getProfileImage(userProfile?.profile_image, userProfile?.avatar, avatars)}
                    alt="Avatar"
                    className="w-full h-full"
                    width={75}
                    height={75}
                    priority
                    style={{
                      objectFit: 'cover',
                    }}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Image
                src={darkMode ? UserCircleIconWhite : UserCircleIcon}
                alt="User circle icon"
                width={32}
                height={32}
                style={{ width: 'auto', height: 'auto' }}
              />
              <span
                className={`text-start font-[Montserrat] text-[16px] font-extrabold ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {formData?.display_name}
              </span>
            </div>

            {/* <p
              className={`font-[Montserrat] text-[12px] text-gray-600 ${
                darkMode ? "text-white" : "text-[#053749]"
              }`}
            >
              {formData?.acronym}
            </p> */}

            {/* Logo Section */}
            <div className="w-full h-[78px] bg-[#EFEFEF] flex items-center justify-center">
              <div className="relative h-[51px] w-[127px]">
                <Image
                  src={
                    formData?.profile_image
                      ? formatWikiImageUrl(formData?.profile_image)
                      : NoAvatarIcon
                  }
                  alt="Organization logo"
                  width={127}
                  height={51}
                  className="w-full rounded-lg object-contain"
                  priority
                  loading="eager"
                />
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            <div className="flex flex-col gap-[10px] mt-4">
              <BaseButton
                onClick={handleSubmit}
                label={pageContent['edit-profile-save-organization']}
                customClass="w-full flex items-center px-[13px] py-[6px] pb-[6px] bg-[#851970] text-white rounded-md py-3 font-bold !mb-0"
                imageUrl={SaveIcon}
                imageAlt="Upload icon"
                imageWidth={20}
                imageHeight={20}
              />
              <BaseButton
                onClick={() => router.back()}
                label={pageContent['edit-profile-cancel']}
                customClass="flex border rounded-[4px] !mb-0 border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#FFF] items-center justify-between text-capx-dark-box-bg px-4 py-2 rounded-md font-[Montserrat] text-[14px] font-bold pb-[6px]"
                imageUrl={darkMode ? CancelIconWhite : CancelIcon}
                imageAlt="Cancel icon"
                imageWidth={20}
                imageHeight={20}
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[32px] h-[32px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Organization logo"
                  className="object-contain"
                  width={32}
                  height={32}
                />
              </div>
              <h2 className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold`}>
                {pageContent['edit-profile-organization-logo']}
              </h2>
            </div>

            <div className={`flex flex-col gap-4 ${darkMode ? 'text-white' : 'text-[#053749]'}`}>
              <input
                type="text"
                placeholder="Wikimedia Commons image's link (ex: File:Example.jpg)"
                className={`w-full p-2 md:p-3 text-[14px] md:text-[24px] border rounded-md ${
                  darkMode
                    ? 'bg-transparent border-white text-white placeholder-gray-400'
                    : 'border-gray-300 text-[#829BA4]'
                }`}
                value={formData.profile_image || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    profile_image: e.target.value,
                  })
                }
              />
              <p
                className={`text-[12px] md:text-[20px] ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                } mt-1`}
              >
                {pageContent['edit-profile-organization-logo-help']}
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
                      onError={e => {
                        console.error('Erro ao carregar preview:', e);
                        e.currentTarget.src = NoAvatarIcon;
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Image
                      src={NoAvatarIcon}
                      alt="No image"
                      width={100}
                      height={100}
                      className="opacity-50"
                    />
                    <span className="text-gray-500 mt-2">
                      {pageContent['edit-profile-no-image']}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Report of Activities Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[32px] h-[32px]">
                <Image
                  src={darkMode ? ReportIconWhite : ReportIcon}
                  alt="Report icon"
                  width={28}
                  height={28}
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
              <h2 className={`font-[Montserrat] text-[14px] font-bold`}>
                {pageContent['organization-profile-report-activities-title']}
              </h2>
            </div>
            <input
              type="text"
              placeholder={pageContent['edit-profile-insert-link']}
              className={`w-full p-2 text-[12px] border rounded-md ${
                darkMode
                  ? 'bg-transparent border-white text-white placeholder-gray-400'
                  : 'border-gray-300 text-gray-700'
              }`}
              value={formData?.report || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  report: e.target.value,
                })
              }
            />
            <p className={`text-[12px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}>
              {pageContent['organization-profile-provide-meta-link']}
            </p>
          </div>

          {/* Capacities Sections */}
          <div className="space-y-6">
            {/* Known Capacities */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[32px] h-[32px]">
                  <Image
                    src={darkMode ? NeurologyIconWhite : NeurologyIcon}
                    alt="Neurology icon"
                    className="object-contain"
                    width={32}
                    height={32}
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] font-bold flex items-center gap-2 ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['body-profile-known-capacities-title']}
                </h2>
              </div>
              <div
                className={`flex flex-wrap gap-2 rounded-[4px] ${
                  darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'
                } flex w-full px-[4px] py-[6px] items-start gap-[12px]`}
              >
                {formData?.known_capacities?.map((capacity, index) => {
                  const capacityName = getCapacityName(capacity);

                  // Sanitize the name to avoid it being a URL in any case
                  const displayName =
                    typeof capacityName === 'string' &&
                    (capacityName.startsWith('https://') || capacityName.includes('entity/Q'))
                      ? `Capacity ${capacity}`
                      : capacityName;

                  return (
                    <div
                      key={`known-capacity-${capacity}-${index}`}
                      className="flex items-center gap-1 rounded-md"
                    >
                      <BaseButton
                        onClick={() => handleRemoveCapacity('known', index)}
                        label={displayName}
                        customClass="rounded-[4px] border-[1px] border-[solid] border-[var(--Links-light-link,#0070B9)] flex p-[4px] pb-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[12px] not-italic font-normal leading-[normal]"
                        imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                        imageAlt="Close icon"
                        imageWidth={16}
                        imageHeight={16}
                      />
                    </div>
                  );
                })}
              </div>

              <BaseButton
                onClick={() => handleAddCapacity('known')}
                label={pageContent['edit-profile-add-capacities']}
                customClass={`rounded-[4px] mt-2 flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                  darkMode ? 'text-[#053749] bg-[#EFEFEF]' : 'text-white bg-capx-dark-box-bg'
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={20}
                imageHeight={20}
              />
              <p className={`text-[12px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}>
                {pageContent['edit-profile-select-skills']}
              </p>
            </div>

            {/* Available Capacities */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[32px] h-[32px]">
                  <Image
                    src={darkMode ? EmojiIconWhite : EmojiIcon}
                    alt="Emoji icon"
                    className="object-contain"
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] font-bold flex items-center gap-2 ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['body-profile-available-capacities-title']}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <div
                  className={`flex flex-wrap gap-2 mt-2 px-1 py-[6px] rounded-[4px] ${
                    darkMode ? 'text-white bg-[#04222F]' : 'text-[#053749] bg-transparent'
                  }`}
                >
                  {formData?.available_capacities?.map((capacity, index) => {
                    const capacityName = getCapacityName(capacity);

                    // Sanitize the name to avoid it being a URL in any case
                    const displayName =
                      typeof capacityName === 'string' &&
                      (capacityName.startsWith('https://') || capacityName.includes('entity/Q'))
                        ? `Capacity ${capacity}`
                        : capacityName;

                    return (
                      <div
                        key={`available-capacity-${capacity}-${index}`}
                        className="flex items-center gap-1 rounded-md"
                      >
                        <BaseButton
                          onClick={() => handleRemoveCapacity('available', index)}
                          label={displayName}
                          customClass="rounded-[4px] border-[1px] border-[solid] border-[#05A300] flex p-[4px] pb-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[12px] not-italic font-normal leading-[normal]"
                          imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                          imageAlt="Close icon"
                          imageWidth={16}
                          imageHeight={16}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-2 mt-2 w-full">
                  <BaseButton
                    onClick={() => handleAddCapacity('available')}
                    label={pageContent['edit-profile-add-capacities']}
                    customClass={`rounded-[4px] flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                      darkMode ? 'text-[#053749] bg-[#EFEFEF]' : 'text-white bg-[#053749]'
                    }`}
                    imageUrl={darkMode ? AddIcon : AddIconWhite}
                    imageAlt="Add icon"
                    imageWidth={20}
                    imageHeight={20}
                  />
                  <BaseButton
                    onClick={() => {
                      const knownCapacities = formData?.known_capacities || [];
                      const availableCapacities = formData?.available_capacities || [];
                      const newAvailable = Array.from(
                        new Set([...availableCapacities, ...knownCapacities])
                      );
                      setFormData({ ...formData, available_capacities: newAvailable });
                    }}
                    label={
                      pageContent['edit-profile-import-known-capacities'] ||
                      'Import Known Capacities'
                    }
                    customClass={`rounded-[4px] flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                      darkMode
                        ? 'bg-transparent border-white text-white border-2'
                        : 'bg-transparent border-[#053749] text-[#053749] border-2'
                    }`}
                    imageUrl={darkMode ? AddIcon : AddIconWhite}
                    imageAlt="Import known capacities"
                    imageWidth={20}
                    imageHeight={20}
                  />
                </div>
                <p className={`text-[12px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}>
                  {pageContent['body-profile-choose-skills']}
                </p>
              </div>
            </div>

            {/* Wanted Capacities */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[32px] h-[32px]">
                  <Image
                    src={darkMode ? TargetIconWhite : TargetIcon}
                    alt="Target icon"
                    className="object-contain"
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] font-bold flex items-center gap-2 ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['body-profile-wanted-capacities-title']}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <div
                  className={`flex flex-wrap gap-2 mt-2 px-1 py-[6px] rounded-[4px] ${
                    darkMode ? 'text-white bg-[#04222F]' : 'text-[#053749] bg-transparent'
                  }`}
                >
                  {formData?.wanted_capacities?.map((capacity, index) => {
                    const capacityName = getCapacityName(capacity);

                    // Sanitize the name to avoid it being a URL in any case
                    const displayName =
                      typeof capacityName === 'string' &&
                      (capacityName.startsWith('https://') || capacityName.includes('entity/Q'))
                        ? `Capacity ${capacity}`
                        : capacityName;

                    return (
                      <div
                        key={`wanted-capacity-${capacity}-${index}`}
                        className="flex items-center gap-1 rounded-md"
                      >
                        <BaseButton
                          onClick={() => handleRemoveCapacity('wanted', index)}
                          label={displayName}
                          customClass="rounded-[4px] border-[1px] border-[solid] border-[#D43831] flex p-[4px] pb-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[12px] not-italic font-normal leading-[normal]"
                          imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                          imageAlt="Close icon"
                          imageWidth={16}
                          imageHeight={16}
                        />
                      </div>
                    );
                  })}
                </div>
                <BaseButton
                  onClick={() => handleAddCapacity('wanted')}
                  label={pageContent['edit-profile-add-capacities']}
                  customClass={`rounded-[4px] mt-2 flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                    darkMode ? 'text-[#053749] bg-[#EFEFEF]' : 'text-white bg-[#053749]'
                  }`}
                  imageUrl={darkMode ? AddIcon : AddIconWhite}
                  imageAlt="Add icon"
                  imageWidth={20}
                  imageHeight={20}
                />
                <p className={`text-[12px] ${darkMode ? 'text-white' : 'text-[#053749]'} `}>
                  {pageContent['edit-profile-wanted-capacities']}
                </p>
              </div>
            </div>
          </div>

          {/* Territory Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[32px] h-[32px]">
                <Image
                  src={darkMode ? TerritoryIconWhite : TerritoryIcon}
                  alt="Territory icon"
                  width={24}
                  height={24}
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] font-bold ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['body-profile-section-title-territory']}
              </h2>
            </div>

            {/* Lista de territórios */}
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.territory?.map((terr, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded ${
                    darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
                  }`}
                >
                  <span className="font-[Montserrat] text-[12px]">{territories[terr]}</span>
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
                      width={16}
                      height={16}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Select para adicionar novo território */}
            <div className="relative">
              <select
                value=""
                onChange={e => {
                  if (e.target.value) {
                    const newTerritories = [...(formData.territory || [])];
                    if (!newTerritories.includes(e.target.value)) {
                      newTerritories.push(e.target.value);
                      setFormData({
                        ...formData,
                        territory: newTerritories,
                      });
                    }
                  }
                }}
                className={`w-full px-4 py-2 rounded-[4px] font-[Montserrat] text-[14px] appearance-none ${
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
                    {name as string}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Image
                  src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
                  alt="Select"
                  width={16}
                  height={16}
                />
              </div>
            </div>

            {/* Tooltip */}
            <p className={`text-[12px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-2`}>
              {pageContent['edit-profile-territory']}
            </p>
          </div>

          {/* Projects Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[32px] h-[32px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Project icon"
                  width={24}
                  height={24}
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] font-bold ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['edit-profile-main-projects']}
              </h2>
            </div>

            <div className="flex flex-col w-full gap-2 mb-2">
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
                label={pageContent['edit-profile-add-more-projects']}
                customClass={`rounded-[4px] bg-capx-dark-box-bg flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] md:text-[16px] not-italic font-extrabold leading-[normal] ${
                  darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add project"
                imageWidth={20}
                imageHeight={20}
              />
            </div>
            <p className={`text-[12px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}>
              {pageContent['edit-profile-display-links']}
            </p>
          </div>

          {/* Events Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[32px] h-[32px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Event icon"
                  fill
                  className="object-contain"
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] font-bold ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['body-profile-section-title-events']}
              </h2>
            </div>

            <EventsList
              events={eventsData}
              isHorizontalScroll={true}
              onDelete={handleDeleteEvent}
              onEdit={handleEditEvent}
              onChoose={handleChooseEvent}
            />
            <BaseButton
              onClick={handleAddEvent}
              label={pageContent['edit-profile-add-events']}
              customClass={`mb-2 rounded-[4px] bg-capx-dark-box-bg flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] md:text-[16px] not-italic font-extrabold leading-[normal] ${
                darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
              }`}
              imageUrl={darkMode ? AddIcon : AddIconWhite}
              imageAlt="Add icon"
              imageWidth={20}
              imageHeight={20}
            />
            <BaseButton
              onClick={handleViewAllEvents}
              label={pageContent['organization-profile-view-all-events']}
              customClass={`rounded-[4px] bg-capx-dark-box-bg flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] md:text-[16px] not-italic font-extrabold leading-[normal] ${
                darkMode
                  ? 'text-white bg-capx-dark-box-bg border border-white'
                  : 'text-capx-dark-box-bg bg-transparent border border-capx-dark-box-bg'
              }`}
              imageUrl={darkMode ? ExpandAllIconWhite : ExpandAllIcon}
              imageAlt="Expand all icon"
              imageWidth={20}
              imageHeight={20}
            />

            <p className={`text-[12px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-2`}>
              {pageContent['edit-profile-display-events']}
            </p>
          </div>

          {/* News Section */}
          <div className="">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[32px] h-[32px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="News icon"
                  className="object-contain"
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] font-bold ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['edit-profile-news']}
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
              label={pageContent['edit-profile-add-more-diff-tags']}
              customClass={`rounded-[4px] bg-capx-dark-box-bg flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                darkMode ? 'text-capx-dark-box-bg bg-white' : 'text-white bg-capx-dark-box-bg'
              }`}
              imageUrl={darkMode ? AddIcon : AddIconWhite}
              imageAlt="Add icon"
              imageWidth={20}
              imageHeight={20}
            />
            <p className={`text-[12px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}>
              {pageContent['edit-profile-enter-diff-tags']}
            </p>
          </div>

          {/* Documents Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[32px] h-[32px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Document icon"
                  className="object-contain"
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] font-bold ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['body-profile-section-title-documents']}
              </h2>
            </div>
            <div className="flex flex-col w-full gap-2 mb-2">
              {Array.isArray(documentsData) &&
                documentsData?.map((document, index) => (
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
              label={pageContent['edit-profile-add-more-links']}
              disabled={documentsData?.length >= 4}
              customClass={`rounded-[4px] bg-capx-dark-box-bg flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                documentsData?.length >= 4
                  ? 'text-gray-400 bg-gray-300 cursor-not-allowed opacity-50'
                  : darkMode
                    ? 'text-capx-dark-box-bg bg-white'
                    : 'text-white bg-capx-dark-box-bg'
              }`}
              imageUrl={darkMode ? AddIcon : AddIconWhite}
              imageAlt="Add icon"
              imageWidth={20}
              imageHeight={20}
            />
            <p className={`text-[12px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}>
              {pageContent['edit-profile-share-documents-tooltop']}
            </p>
          </div>
          {/* Contacts Section */}

          <section className="w-full max-w-screen-xl py-8">
            <div className="flex flex-row flex pl-0 pr-[13px] py-[6px] items-center gap-[4px] rounded-[8px] mb-6">
              <div className="relative w-[32px] h-[32px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Wikimedia"
                  className="object-contain"
                  fill
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                  darkMode ? 'text-[#F6F6F6]' : 'text-[#003649]'
                }`}
              >
                {pageContent['body-profile-section-title-contacts']}
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <div
                className={`flex flex-row border-[1px] border-[solid] w-full p-2 items-center gap-[12px] rounded-[4px] ${
                  darkMode ? 'bg-capx-dark-box-bg' : 'bg-[#FFF]'
                }`}
              >
                <div className="relative w-[32px] h-[32px]">
                  <Image
                    src={darkMode ? ContactMetaIconWhite : ContactMetaIcon}
                    alt="Contact Meta"
                    className={`object-contain ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'}`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Metawiki"
                  className={`text-start font-[Montserrat] text-[12px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
                    darkMode ? 'text-[#F6F6F6]' : 'text-[#003649]'
                  }`}
                  value={contactsData.meta_page || ''}
                  onChange={e => {
                    const newValue = e.target.value;
                    setContactsData(prev => ({
                      ...prev,
                      meta_page: newValue,
                    }));
                  }}
                />
              </div>
              <div
                className={`flex flex-row border-[1px] border-[solid] w-full p-2 items-center gap-[12px] rounded-[4px]`}
              >
                <div className="relative w-[32px] h-[32px]">
                  <Image
                    src={darkMode ? ContactEmailIconWhite : ContactEmailIcon}
                    alt="Contact Email"
                    className={`object-contain ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'}`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Email"
                  className={`text-start font-[Montserrat] text-[12px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
                    darkMode ? 'text-[#F6F6F6]' : 'text-[#003649]'
                  }`}
                  value={contactsData.email || ''}
                  onChange={e => {
                    const newValue = e.target.value;
                    setContactsData(prev => ({
                      ...prev,
                      email: newValue,
                    }));
                  }}
                />
              </div>
              <div
                className={`flex flex-row border-[1px] border-[solid] w-full p-2 items-center gap-[12px] rounded-[4px] ${
                  darkMode ? 'bg-capx-dark-box-bg' : 'bg-[#FFF]'
                }`}
              >
                <div className="relative w-[32px] h-[32px]">
                  <Image
                    src={darkMode ? ContactPortalIconWhite : ContactPortalIcon}
                    alt="Contact Website"
                    className={`object-contain ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'}`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Website"
                  className={`text-start font-[Montserrat] text-[12px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
                    darkMode ? 'text-[#F6F6F6]' : 'text-[#003649]'
                  }`}
                  value={contactsData.website || ''}
                  onChange={e => {
                    const newValue = e.target.value;
                    setContactsData(prev => ({
                      ...prev,
                      website: newValue,
                    }));
                  }}
                />
              </div>
            </div>

            <p className={`text-[20px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}></p>
          </section>

          {/* Save/Cancel Buttons */}
          <div className="flex flex-row gap-2">
            <BaseButton
              onClick={handleSubmit}
              label={pageContent['edit-profile-save']}
              customClass="flex border w-full rounded-[4px] border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#851970]  items-center justify-between text-white !px-[13px] !py-[6px] rounded-md font-[Montserrat] text-[14px] font-bold pb-[6px]"
              imageUrl={SaveIcon}
              imageAlt="Save icon"
              imageWidth={20}
              imageHeight={20}
            />
            <BaseButton
              onClick={() => router.back()}
              label={pageContent['edit-profile-cancel']}
              customClass="flex border w-full rounded-[4px] border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#FFF] items-center justify-between text-capx-dark-box-bg !px-[13px] !py-[6px] rounded-md font-[Montserrat] text-[14px] font-bold pb-[6px]"
              imageUrl={CancelIcon}
              imageAlt="Cancel icon"
              imageWidth={20}
              imageHeight={20}
            />
          </div>
        </div>
      </section>
      <CapacitySelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleCapacitySelect}
        title={`Select ${currentCapacityType} capacities`}
      />
    </div>
  );
}
