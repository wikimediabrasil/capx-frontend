'use client';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import BaseButton from '@/components/BaseButton';
import LoadingState from '@/components/LoadingState';
import { ProfileItem } from '@/components/ProfileItem';
import { useOrganization } from '@/hooks/useOrganizationProfile';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import EditIcon from '@/public/static/images/edit.svg';
import EditIconWhite from '@/public/static/images/edit_white.svg';
import EmojiIcon from '@/public/static/images/emoji_objects.svg';
import EmojiIconWhite from '@/public/static/images/emoji_objects_white.svg';
import CopyLinkIcon from '@/public/static/images/icons/copy_link.svg';
import CopyLinkIconWhite from '@/public/static/images/icons/copy_link_white.svg';
import NeurologyIcon from '@/public/static/images/neurology.svg';
import NeurologyIconWhite from '@/public/static/images/neurology_white.svg';
const DEFAULT_AVATAR = '/static/images/person.svg';
import ReportActivityIcon from '@/public/static/images/report_of_activities.svg';
import UserCircleIcon from '@/public/static/images/supervised_user_circle.svg';
import UserCircleIconWhite from '@/public/static/images/supervised_user_circle_white.svg';
import TargetIcon from '@/public/static/images/target.svg';
import TargetIconWhite from '@/public/static/images/target_white.svg';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ContactsSection } from './ContactsSection';
import { DocumentsList } from './DocumentsList';
import EventsSection from './EventsSection';
import { NewsSection } from './NewsSection';
import ProjectsList from './ProjectsList';
import { useOrganizationNames } from '@/hooks/useOrganizationNames';
import { getOrganizationDisplayName } from '@/lib/utils/getOrganizationDisplayName';
import { useApp } from '@/contexts/AppContext';

function HeaderSection({
  pageContent,
  darkMode,
  organization,
  isOrgManager,
  organizationId,
  router,
  showSnackbar,
  token,
}) {
  const { language } = useApp();
  const { names } = useOrganizationNames({
    organizationId: organization?.id,
    token,
  });

  const displayName = getOrganizationDisplayName(organization?.display_name || '', names, language);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Content */}
      <div className="w-full flex flex-col gap-4 justify-center">
        <h1
          className={`font-[Montserrat] text-base md:text-
[32px] lg:text-[48px] not-italic font-normal leading-[normal] md:leading-[59px] mb-2 md:mb-4 ${
            darkMode ? 'text-capx-dark-text' : 'text-capx-light-text'
          }`}
        >
          {pageContent['edit-profile-welcome']}
        </h1>

        <div className="flex items-center gap-2 mb-2">
          <Image
            src={darkMode ? UserCircleIconWhite : UserCircleIcon}
            alt="User circle icon"
            style={{ width: 'auto', height: 'auto' }}
            width={20}
            height={20}
            className="md:w-[32px] md:h-[32px]"
          />
          <span
            className={`text-center font-[Montserrat] text-base md:text-[20px] lg:text-[24px] not-italic font-extrabold leading-[normal] pl-2 ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}
          >
            {displayName}
          </span>
        </div>

        {/* Logo */}
        <div className="w-full">
          <div className="relative h-[78px] w-full md:h-[326px] md:w-[595px] bg-[#EFEFEF] rounded-md md:rounded-[16px] flex items-center justify-center">
            {organization?.profile_image ? (
              <Image
                src={formatWikiImageUrl(organization.profile_image) || DEFAULT_AVATAR}
                alt="Organization logo"
                className="object-contain p-4 md:p-24"
                fill
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs md:text-base">
                  {pageContent['logo-not-available']}
                </span>
              </div>
            )}
          </div>
        </div>

        <BaseButton
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
            showSnackbar(pageContent['body-profile-copy-link-success'], 'success');
          }}
          label={pageContent['body-profile-copy-link']}
          customClass={`w-full font-[Montserrat] text-sm md:text-[20px] not-italic font-extrabold leading-[normal] inline-flex h-[32px] md:h-[64px] px-3 py-4 md:px-2 lg:py-2 xl:px-8 xl:py-4 pb-0 justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid] ${
            darkMode ? 'border-white text-white' : 'border-capx-dark-box-bg text-capx-light-text'
          }`}
          imageUrl={darkMode ? CopyLinkIconWhite : CopyLinkIcon}
          imageAlt="Copy link icon"
          imageWidth={20}
          imageHeight={20}
        />

        {isOrgManager && (
          <BaseButton
            onClick={() => router.push(`/organization_profile/${organizationId}/edit`)}
            label={pageContent['body-profile-edit-organization-button']}
            customClass={`w-full font-[Montserrat] text-sm md:text-[20px] not-italic font-extrabold leading-[normal] inline-flex h-[32px] md:h-[64px] px-3 py-4 md:px-2 lg:py-2 xl:px-8 xl:py-4 pb-0 justify-
center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid] ${
              darkMode ? 'border-white text-white' : 'border-capx-dark-box-bg text-capx-light-text'
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

function ReportActivitySection({ organization, pageContent }) {
  if (!(organization?.report && organization.report.trim() !== '')) return null;
  return (
    <div className="flex flex-col md:flex-row justify-between px-4 py-6 md:px-[85px] md:py-[64px] items-center rounded-[4px] bg-[#04222F] w-full h-auto md:h-[399px] flex-shrink-0 gap-4">
      <div className="relative w-[220px] h-[96px] md:w-[619px] md:h-[271px]">
        <Image
          src={ReportActivityIcon}
          alt="Report activity icon"
          className="object-contain"
          fill
          priority
        />
      </div>
      <div className="flex flex-col justify-center items-center gap-2">
        <h2 className="text-[#FFF] text-[20px] md:text-[30px] not-italic font-extrabold leading-[normal] md:leading-[37px] mb-2 md:mb-6 text-center">
          {pageContent['organization-profile-report-activities-title']}
        </h2>
        <BaseButton
          onClick={() => organization?.report && window.open(organization.report, '_blank')}
          label={pageContent['organization-profile-click-here']}
          customClass="inline-flex h-[32px] md:h-[64px] px-[19px] py-[8px] md:px-[32px] md:py-[16px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[4px] md:rounded-[8px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] text-sm md:text-[24px] not-italic font-extrabold leading-[normal]"
        />
      </div>
    </div>
  );
}

function CapacitiesSection({ organization, pageContent, darkMode, getCapacityName }) {
  return (
    <div className="space-y-6 mt-4">
      <ProfileItem
        items={organization?.known_capacities || []}
        icon={darkMode ? NeurologyIconWhite : NeurologyIcon}
        title={pageContent['body-profile-known-capacities-title']}
        getItemName={id => getCapacityName(id)}
        customClass={`font-[Montserrat] text-sm md:text-[24px] not-italic font-extrabold leading-[normal] md:leading-[29px] ${
          darkMode ? 'text-white' : 'text-capx-dark-box-bg'
        }`}
      />
      <ProfileItem
        items={organization?.available_capacities || []}
        icon={darkMode ? EmojiIconWhite : EmojiIcon}
        getItemName={id => getCapacityName(id)}
        title={pageContent['body-profile-available-capacities-title']}
        customClass={`font-[Montserrat] text-sm
 md:text-[24px] not-italic font-extrabold leading-[normal] md:leading-[29px] ${
   darkMode ? 'text-white' : 'text-capx-dark-box-bg'
 }`}
      />
      <ProfileItem
        items={organization?.wanted_capacities || []}
        icon={darkMode ? TargetIconWhite : TargetIcon}
        getItemName={id => getCapacityName(id)}
        title={pageContent['body-profile-wanted-capacities-title']}
        customClass={`font-[Montserrat] text-sm md:text-[24px] not-italic font-extrabold leading-[normal] md:leading-[29px] ${
          darkMode ? 'text-white' : 'text-capx-dark-box-bg'
        }`}
      />
    </div>
  );
}

function TerritorySection({ organization, pageContent, darkMode, territories }) {
  if (!(organization?.territory && organization.territory.length > 0)) return null;
  return (
    <div className="mt-6">
      <ProfileItem
        items={organization.territory}
        icon={darkMode ? TerritoryIconWhite : TerritoryIcon}
        title={pageContent['body-profile-section-title-territory']}
        getItemName={id => territories[id] || id}
        customClass={`font-[Montserrat] text-sm md:text-[24px] not-italic font-extrabold leading-[normal] md:leading-[29px] ${
          darkMode ? 'text-white' : 'text-capx-dark-box-bg'
        }`}
        useDefaultStyle={false}
        itemCustomClass={`font-[Montserrat] text-sm md:text-[24px] not-italic font-normal leading-[normal] break-all hover:underline ${
          darkMode ? 'text-white' : 'text-capx-dark-box-bg'
        }`}
      />
    </div>
  );
}

function ProjectsAndEventsSection({ organization, pageContent, token }) {
  return (
    <div className="space-y-6 mt-4">
      <ProjectsList
        title={pageContent['body-profile-section-title-main-projects']}
        itemIds={organization?.projects || []}
        token={token}
      />
      {/* Featured Events */}
      {organization?.choose_events && organization.choose_events.length > 0 && (
        <div className="space-y-6 mt-4">
          <EventsSection
            title={pageContent['body-profile-section-title-events'] || 'Featured Events'}
            itemIds={organization?.choose_events || []}
            token={token}
          />
        </div>
      )}
    </div>
  );
}

function NewsSectionWrapper({ organization }) {
  if (!(organization?.tag_diff && organization.tag_diff.length > 0)) return null;
  return <NewsSection ids={organization?.tag_diff || []} />;
}

export default function OrganizationProfileView({
  pageContent,
  darkMode,
  organization,
  organizationId,
  token,
  isOrgManager,
  getCapacityName,
  territories,
}) {
  const router = useRouter();
  const { isLoading: isOrganizationLoading } = useOrganization(token, organizationId);
  const { showSnackbar } = useSnackbar();

  if (isOrganizationLoading) {
    return <LoadingState fullScreen={true} />;
  }

  return (
    <div
      className={`relative w-full overflow-x-hidden ${
        darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'
      }`}
    >
      <section className={`w-full max-w-screen-xl mx-auto px-4 py-8 mt-[80px]`}>
        <div className="flex flex-col gap-6 md:gap-8">
          <HeaderSection
            pageContent={pageContent}
            darkMode={darkMode}
            organization={organization}
            isOrgManager={isOrgManager}
            organizationId={organizationId}
            router={router}
            showSnackbar={showSnackbar}
            token={token}
          />
          <ReportActivitySection organization={organization} pageContent={pageContent} />
          <CapacitiesSection
            organization={organization}
            pageContent={pageContent}
            darkMode={darkMode}
            getCapacityName={getCapacityName}
          />
          <TerritorySection
            organization={organization}
            pageContent={pageContent}
            darkMode={darkMode}
            territories={territories}
          />
          <ProjectsAndEventsSection
            organization={organization}
            pageContent={pageContent}
            token={token}
          />
          <NewsSectionWrapper organization={organization} />
          <DocumentsList
            title={pageContent['body-profile-section-title-documents']}
            type="documents"
            items={organization?.documents || []}
            token={token}
          />
          <ContactsSection
            email={organization?.email || ''}
            meta_page={organization?.meta_page || ''}
            website={organization?.website || ''}
          />
        </div>
      </section>
    </div>
  );
}
