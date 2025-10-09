import EventsList from '@/app/events/components/EventsList';
import BaseButton from '@/components/BaseButton';
import CapacitySelectionModal from '@/components/CapacitySelectionModal';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAvatars } from '@/hooks/useAvatars';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import { getProfileImage } from '@/lib/utils/getProfileImage';
import AddIconWhite from '@/public/static/images/add.svg';
import AddIcon from '@/public/static/images/add_dark.svg';
import ArrowDownIcon from '@/public/static/images/arrow_drop_down_circle.svg';
import ArrowDownIconWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';
import CancelIcon from '@/public/static/images/cancel.svg';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import ContactEmailIcon from '@/public/static/images/contact_alternate_email.svg';
import ContactEmailIconWhite from '@/public/static/images/contact_alternate_email_white.svg';
import ContactPortalIcon from '@/public/static/images/contact_captive_portal.svg';
import ContactPortalIconWhite from '@/public/static/images/contact_captive_portal_white.svg';
import ContactMetaIcon from '@/public/static/images/contact_meta.svg';
import ContactMetaIconWhite from '@/public/static/images/contact_meta_white.svg';
import EmojiIcon from '@/public/static/images/emoji_objects.svg';
import EmojiIconWhite from '@/public/static/images/emoji_objects_white.svg';
import ExpandAllIcon from '@/public/static/images/expand_all.svg';
import ExpandAllIconWhite from '@/public/static/images/expand_all_white.svg';
import NeurologyIcon from '@/public/static/images/neurology.svg';
import NeurologyIconWhite from '@/public/static/images/neurology_white.svg';
import NoAvatarIcon from '@/public/static/images/no_avatar.svg';
import ReportIcon from '@/public/static/images/report.svg';
import ReportIconWhite from '@/public/static/images/report_white.svg';
import SaveIcon from '@/public/static/images/save_as.svg';
import UserCircleIcon from '@/public/static/images/supervised_user_circle.svg';
import UserCircleIconWhite from '@/public/static/images/supervised_user_circle_white.svg';
import TargetIcon from '@/public/static/images/target.svg';
import TargetIconWhite from '@/public/static/images/target_white.svg';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import WikimediaIcon from '@/public/static/images/wikimedia_logo_black.svg';
import WikimediaIconWhite from '@/public/static/images/wikimedia_logo_white.svg';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DocumentFormItem from './DocumentFormItem';
import NewsFormItem from './NewsFormItem';
import ProjectsFormItem from './ProjectsFormItem';

export default function OrganizationProfileEditDesktopView({
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
  capacities,
  handleEditEvent,
  handleChooseEvent,
  handleViewAllEvents,
  territories,
}) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const { data: session } = useSession();
  const { userProfile, isLoading: isUserLoading } = useUserProfile();
  const { avatars } = useAvatars();
  const router = useRouter();

  // Helper function to import known capacities to available
  const handleImportKnownCapacities = () => {
    const knownCapacities = formData?.known_capacities || [];
    const availableCapacities = formData?.available_capacities || [];
    const newAvailable = Array.from(new Set([...availableCapacities, ...knownCapacities]));
    setFormData({ ...formData, available_capacities: newAvailable });
  };

  return (
    <div
      className={`relative w-full overflow-x-hidden min-h-screen ${
        darkMode ? 'bg-capx-dark-box-bg text-white' : 'bg-white text-[#053749]'
      }`}
    >
      <section
        className={`flex w-full h-full justify-between pb-6 pt-10 px-4 md:px-8 lg:px-12 max-w-screen-xl mx-auto`}
      >
        <div className="flex flex-col gap-6 mx-auto w-full">
          {/* Header */}
          <div className="flex flex-row gap-12 w-full">
            {/* Logo Section */}
            <div className="w-1/2 flex-shrink-0">
              <div className="rounded-[16px] h-full items-center justify-center flex bg-[#EFEFEF]">
                <div className="relative w-[300px] h-[165px]">
                  <Image
                    src={formatWikiImageUrl(formData?.profile_image || '')}
                    alt="Organization logo"
                    className="object-contain w-full rounded-lg"
                    fill
                    sizes="300px"
                    priority
                    loading="eager"
                  />
                </div>
              </div>
            </div>
            <div className="w-1/2 flex-1">
              <div className="relative w-[114px] h-[114px] mb-[24px]">
                <Image
                  src={getProfileImage(userProfile?.profile_image, userProfile?.avatar, avatars)}
                  alt="User Profile Image"
                  fill
                  sizes="114px"
                  priority
                  className="object-contain w-full rounded-lg"
                />
              </div>
              <div
                className={`flex flex-col gap-2 text-[30px] mb-[24px] ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                <h1
                  className={`font-[Montserrat] not-italic font-normal leading-[29px] ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['edit-profile-welcome']}
                </h1>
                <h2
                  className={`font-[Montserrat] not-italic font-extrabold leading-[normal] ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {session?.user?.name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-[42px] h-[42px] flex-shrink-0">
                  <Image
                    src={darkMode ? UserCircleIconWhite : UserCircleIcon}
                    alt="User circle icon"
                    className="object-contain"
                    width={42}
                    height={42}
                  />
                </div>

                <span
                  className={`text-start font-[Montserrat] text-[24px] font-extrabold ${
                    darkMode ? 'text-white' : 'text-[#053749]'
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
                  label={pageContent['edit-profile-save']}
                  customClass="flex bg-[#851970] items-center justify-between text-white px-4 py-2 rounded-[8px] font-[Montserrat] text-[24px] font-bold !px-[32px] !py-[16px] !w-3/4 h-auto !mb-0"
                  imageUrl={SaveIcon}
                  imageAlt="Save icon"
                  imageWidth={32}
                  imageHeight={32}
                />
                <BaseButton
                  onClick={() => router.back()}
                  label={pageContent['edit-profile-cancel']}
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
              <div className="relative w-[48px] h-[48px] flex-shrink-0">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Organization logo"
                  width={48}
                  height={48}
                  className="object-contain"
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
              <div className="w-full max-w-[600px] h-[200px] bg-[#EFEFEF] rounded-md flex items-center justify-center overflow-hidden">
                {formData.profile_image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={formatWikiImageUrl(formData.profile_image)}
                      alt="Organization logo preview"
                      className="object-contain"
                      fill
                      sizes="600px"
                      onError={e => {
                        console.error('Erro ao carregar preview:', e);
                        e.currentTarget.src = NoAvatarIcon;
                      }}
                      priority
                      loading="eager"
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
              <div className="relative w-[48px] h-[48px] flex-shrink-0">
                <Image
                  src={darkMode ? ReportIconWhite : ReportIcon}
                  alt="Report icon"
                  className="object-contain"
                  width={48}
                  height={48}
                />
              </div>
              <h2 className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold`}>
                {pageContent['organization-profile-report-activities-title']}
              </h2>
            </div>
            <input
              type="text"
              placeholder={pageContent['edit-profile-insert-link']}
              className={`w-full p-2 md:p-3 text-[24px] border rounded-md ${
                darkMode
                  ? 'bg-transparent border-white text-white placeholder-gray-400'
                  : 'border-gray-300 text-[#829BA4]'
              }`}
              value={formData.report || ''}
              onChange={e => setFormData({ ...formData, report: e.target.value })}
            />
            <p className={`text-[20px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}>
              {pageContent['organization-profile-provide-meta-link']}
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
                    width={48}
                    height={48}
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold flex items-center gap-2 ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['body-profile-known-capacities-title']}
                </h2>
              </div>
              <div
                className={`flex flex-wrap gap-2 mt-2 px-[12px] py-[24px] rounded-[16px] ${
                  darkMode ? 'text-white bg-[#04222F]' : 'text-[#053749] bg-transparent'
                }`}
              >
                {formData.known_capacities?.map((capacity, index) => {
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
                        customClass={`rounded-[4px] border-[1px] border-[solid] border-[#0070B9] flex !p-[8px] justify-center items-center gap-[4px] font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] !mb-0`}
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
                customClass={`rounded-[8px] !w-fit mt-2 flex !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode ? 'text-[#053749] bg-[#EFEFEF]' : 'text-white bg-capx-dark-box-bg'
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={32}
                imageHeight={32}
              />
              <p className={`text-[20px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}>
                {pageContent['edit-profile-select-skills']}
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
                    width={48}
                    height={48}
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold flex items-center gap-2 ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['body-profile-available-capacities-title']}
                </h2>
              </div>
              <div
                className={`flex flex-wrap gap-2 mt-2 px-[12px] py-[24px] rounded-[16px] ${
                  darkMode ? 'text-white bg-[#04222F]' : 'text-[#053749] bg-transparent'
                }`}
              >
                {formData.available_capacities?.map((capacity, index) => {
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
                        customClass={`rounded-[4px] border-[1px] border-[solid] border-[#05A300] flex !p-[8px] justify-center items-center gap-[4px] font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] !mb-0`}
                        imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                        imageAlt="Close icon"
                        imageWidth={16}
                        imageHeight={16}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-2">
                <BaseButton
                  onClick={() => handleAddCapacity('available')}
                  label={pageContent['edit-profile-add-capacities']}
                  customClass={`rounded-[8px] w-fit flex !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                    darkMode ? 'text-[#053749] bg-[#EFEFEF]' : 'text-white bg-capx-dark-box-bg'
                  }`}
                  imageUrl={darkMode ? AddIcon : AddIconWhite}
                  imageAlt="Add icon"
                  imageWidth={32}
                  imageHeight={32}
                />
                <BaseButton
                  onClick={handleImportKnownCapacities}
                  label={
                    pageContent['edit-profile-import-known-capacities'] || 'Import Known Capacities'
                  }
                  customClass={`rounded-[8px] w-fit flex !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                    darkMode
                      ? 'bg-transparent border-white text-white border-2'
                      : 'bg-transparent border-capx-dark-box-bg text-capx-dark-box-bg border-2'
                  }`}
                  imageUrl={darkMode ? AddIcon : AddIconWhite}
                  imageAlt="Import known capacities"
                  imageWidth={32}
                  imageHeight={32}
                />
              </div>
              <p className={`text-[20px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}>
                {pageContent['body-profile-choose-skills']}
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
                    width={48}
                    height={48}
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold flex items-center gap-2 ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['body-profile-wanted-capacities-title']}
                </h2>
              </div>
              <div
                className={`flex flex-wrap gap-2 mt-2 px-[12px] py-[24px] rounded-[16px] ${
                  darkMode ? 'text-white bg-[#04222F]' : 'text-[#053749] bg-transparent'
                }`}
              >
                {formData.wanted_capacities?.map((capacity, index) => {
                  const capacityName = getCapacityName(capacity);

                  // Sanitizar o nome para evitar que seja uma URL em qualquer caso
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
                        customClass={`rounded-[4px] border-[1px] border-[solid] border-[#D43831] flex !p-[8px] justify-center items-center gap-[4px] font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] !mb-0`}
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
                customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode ? 'text-[#053749] bg-[#EFEFEF]' : 'text-white bg-capx-dark-box-bg'
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={32}
                imageHeight={32}
              />
              <p className={`text-[20px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}>
                {pageContent['edit-profile-wanted-capacities']}
              </p>
            </div>
          </div>

          {/* Territory Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? TerritoryIconWhite : TerritoryIcon}
                  alt="Territory icon"
                  className="object-contain"
                  width={48}
                  height={48}
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
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
                  <span className="font-[Montserrat] text-[24px]">{territories[terr]}</span>
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
                className={`w-full px-4 py-2 rounded-[16px] font-[Montserrat] text-[24px] appearance-none ${
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
                  width={24}
                  height={24}
                />
              </div>
            </div>

            {/* Tooltip */}
            <p className={`text-[20px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-2`}>
              {pageContent['edit-profile-territory']}
            </p>
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
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['edit-profile-main-projects']}
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
                label={pageContent['edit-profile-add-projects']}
                customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode ? 'text-[#053749] bg-[#EFEFEF]' : 'text-white bg-capx-dark-box-bg'
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={32}
                imageHeight={32}
              />
            </div>
            <p className={`text-[20px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}>
              {pageContent['edit-profile-display-links']}
            </p>
          </div>

          {/* Events Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[48px] h-[48px] flex-shrink-0">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Event icon"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
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
              customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                darkMode ? 'text-[#053749] bg-[#EFEFEF]' : 'text-white bg-capx-dark-box-bg'
              }`}
              imageUrl={darkMode ? AddIcon : AddIconWhite}
              imageAlt="Add icon"
              imageWidth={32}
              imageHeight={32}
            />

            <BaseButton
              onClick={handleViewAllEvents}
              label={pageContent['organization-profile-view-all-events']}
              customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                darkMode
                  ? 'text-white bg-capx-dark-box-bg border border-white'
                  : 'text-capx-dark-box-bg bg-transparent border border-capx-dark-box-bg'
              }`}
              imageUrl={darkMode ? ExpandAllIconWhite : ExpandAllIcon}
              imageAlt="Expand all icon"
              imageWidth={32}
              imageHeight={32}
            />

            <p className={`text-[20px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-4`}>
              {pageContent['edit-profile-display-events']}
            </p>
          </div>

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
              label={pageContent['edit-profile-add-diff-tags']}
              customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                darkMode ? 'text-[#053749] bg-[#EFEFEF]' : 'text-white bg-capx-dark-box-bg'
              }`}
              imageUrl={darkMode ? AddIcon : AddIconWhite}
              imageAlt="Add icon"
              imageWidth={32}
              imageHeight={32}
            />
            <p className={`text-[20px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}>
              {pageContent['edit-profile-enter-diff-tags']}
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
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['body-profile-section-title-documents']}
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
              label={pageContent['edit-profile-add-more-links']}
              disabled={documentsData?.length >= 4}
              customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                documentsData?.length >= 4
                  ? 'text-gray-400 bg-gray-300 cursor-not-allowed opacity-50'
                  : darkMode
                    ? 'text-[#053749] bg-[#EFEFEF]'
                    : 'text-white bg-capx-dark-box-bg'
              }`}
              imageUrl={darkMode ? AddIcon : AddIconWhite}
              imageAlt="Add icon"
              imageWidth={32}
              imageHeight={32}
            />
            <p className={`text-[20px] ${darkMode ? 'text-white' : 'text-[#053749]'} mt-1`}>
              {pageContent['edit-profile-share-documents-tooltop']}
            </p>
          </div>

          {/* Contacts Section */}

          <section className="w-full max-w-screen-xl py-8">
            <div className="flex flex-row flex pl-0 pr-[13px] py-[6px] items-center gap-[4px] rounded-[8px] mb-6">
              <div className="relative w-[48px] h-[48px]">
                <Image src={darkMode ? WikimediaIconWhite : WikimediaIcon} alt="Wikimedia" fill />
              </div>
              <h2
                className={`font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode ? 'text-[#F6F6F6]' : 'text-[#003649]'
                }`}
              >
                {pageContent['body-profile-section-title-contacts']}
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <div
                className={`flex flex-row border-[1px] border-[solid] w-full px-[12px] py-[24px] items-center gap-[12px] rounded-[16px] ${
                  darkMode
                    ? 'bg-capx-dark-box-bg border-white'
                    : 'bg-[#FFF] border-capx-dark-box-bg'
                }`}
              >
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? ContactMetaIconWhite : ContactMetaIcon}
                    alt="Contact Meta"
                    fill
                    className={`object-contain ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'}`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Metawiki"
                  className={`text-start font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
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
                className={`flex flex-row border-[1px] border-[solid] w-full px-[12px] py-[24px] items-center gap-[12px] rounded-[16px] ${
                  darkMode
                    ? 'bg-capx-dark-box-bg border-white'
                    : 'bg-[#FFF] border-capx-dark-box-bg'
                }`}
              >
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? ContactEmailIconWhite : ContactEmailIcon}
                    alt="Contact Email"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Email"
                  className={`text-start font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
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
                className={`flex flex-row border-[1px] border-[solid] w-full px-[12px] py-[24px] items-center gap-[12px] rounded-[16px] ${
                  darkMode
                    ? 'bg-capx-dark-box-bg border-white'
                    : 'bg-[#FFF] border-capx-dark-box-bg'
                }`}
              >
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? ContactPortalIconWhite : ContactPortalIcon}
                    alt="Contact Website"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Website"
                  className={`text-start font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
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
          <div className="flex flex-row gap-2 mt-6 w-[50%] md:w-[75%] lg:w-[50%]">
            <BaseButton
              onClick={handleSubmit}
              label={pageContent['edit-profile-save']}
              customClass="flex border w-1/2 rounded-[4px] border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#851970]  items-center justify-between text-white !px-[32px] !py-[16px] rounded-md font-[Montserrat] text-[24px] font-bold pb-[6px]"
              imageUrl={SaveIcon}
              imageAlt={pageContent['alt-save'] || 'Save changes'}
              imageWidth={32}
              imageHeight={32}
            />
            <BaseButton
              onClick={() => router.back()}
              label={pageContent['edit-profile-cancel']}
              customClass="flex border w-1/2 rounded-[4px] border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#FFF] items-center justify-between text-capx-dark-box-bg !px-[32px] !py-[16px] rounded-md font-[Montserrat] text-[24px] font-bold pb-[6px]"
              imageUrl={CancelIcon}
              imageAlt={pageContent['alt-cancel'] || 'Cancel operation'}
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
        title={pageContent['edit-profile-select-capacities']?.replace(
          '$1',
          pageContent[currentCapacityType]
        )}
      />
    </div>
  );
}
