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
import NoAvatarIcon from '@/public/static/images/no_avatar.svg';
import ReportActivityIcon from '@/public/static/images/report_of_activities.svg';
import UserCircleIcon from '@/public/static/images/supervised_user_circle.svg';
import UserCircleIconWhite from '@/public/static/images/supervised_user_circle_white.svg';
import TargetIcon from '@/public/static/images/target.svg';
import TargetIconWhite from '@/public/static/images/target_white.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ContactsSection } from './ContactsSection';
import { DocumentsList } from './DocumentsList';
import EventsSection from './EventsSection';
import { NewsSection } from './NewsSection';
import ProjectsList from './ProjectsList';

export default function OrganizationProfileMobileView({
  pageContent,
  darkMode,
  isMobile,
  organization,
  organizationId,
  token,
  isOrgManager,
  getCapacityName,
}) {
  const router = useRouter();
  const {
    organizations,
    isLoading: isOrganizationLoading,
    error,
    refetch,
  } = useOrganization(token, organizationId);
  const { showSnackbar } = useSnackbar();

  if (isOrganizationLoading) {
    return <LoadingState fullScreen={true} />;
  }

  return (
    <>
      <div
        className={`relative w-full overflow-x-hidden ${
          darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'
        }`}
      >
        <section className={`w-full max-w-screen-xl mx-auto px-4 py-8 mt-[80px]`}>
          <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col gap-6">
              {/* Content */}
              <div className="w-full space-y-4">
                <h1
                  className={`font-[Montserrat] text-[16px] md:text-[48px] not-italic font-normal leading-[normal] md:leading-[59px] mb-4 ${
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
                    width={isMobile ? 32 : 42}
                    height={isMobile ? 32 : 48}
                  />
                  <span
                    className={`text-start font-[Montserrat] text-[16px] not-italic font-extrabold leading-[normal] pl-2 ${
                      darkMode ? 'text-capx-dark-text' : 'text-capx-light-text'
                    }`}
                  >
                    {organization?.display_name || pageContent['loading'] || 'Loading...'}
                  </span>
                </div>

                <p
                  className={`font-[Montserrat] text-[12px] not-italic font-normal leading-[normal] md:leading-[29px] mb-4 ${
                    darkMode ? 'text-white' : 'text-capx-dark-box-bg'
                  }`}
                >
                  {/* TODO {pageContent["organization-profile-wiki-subtitle"]}` */}
                </p>

                {/* Logo */}
                <div className="w-full">
                  <div className="w-full h-[78px] bg-[#EFEFEF] flex items-center justify-center">
                    <div className="relative h-[51px] w-[127px]">
                      <Image
                        src={formatWikiImageUrl(organization?.profile_image || '') || NoAvatarIcon}
                        alt="Organization logo"
                        fill
                        priority
                        className="object-contain w-full rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <BaseButton
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    showSnackbar(pageContent['body-profile-copy-link-success'], 'success');
                  }}
                  label={pageContent['body-profile-copy-link']}
                  customClass={`w-full font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid] ${
                    darkMode
                      ? 'border-white text-white'
                      : 'border-capx-dark-box-bg text-capx-light-text'
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
                    customClass={`w-full font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid] ${
                      darkMode
                        ? 'border-white text-white'
                        : 'border-capx-dark-box-bg text-capx-light-text'
                    }`}
                    imageUrl={darkMode ? EditIconWhite : EditIcon}
                    imageAlt="Edit icon"
                    imageWidth={20}
                    imageHeight={20}
                  />
                )}
              </div>
            </div>

            {organization?.report && organization.report.trim() !== '' && (
              <div className="w-full flex flex-col flex-shrink-0 rounded-[4px] bg-[#04222F] justify-center items-center p-6">
                <div className="relative w-[220px] h-[96px] mb-[30px]">
                  <Image
                    src={ReportActivityIcon}
                    alt="Report activity icon"
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col justify-center items-center gap-2">
                  <h2 className="text-[#FFF] font-[Montserrat] text-[20px] not-italic font-extrabold leading-[normal] text-center">
                    {pageContent['organization-profile-report-activities-title']}
                  </h2>
                  <BaseButton
                    onClick={() =>
                      organization?.report && window.open(organization.report, '_blank')
                    }
                    label={pageContent['organization-profile-click-here']}
                    customClass="inline-flex h-[32px] px-[19px] py-[8px] justify-center items-center gap-[10px] flex-shrink-0 rounded-[4px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
                  />
                </div>
              </div>
            )}

            {/* Capacities Lists */}
            <div className="space-y-6 mt-4">
              <ProfileItem
                items={organization?.known_capacities || []}
                icon={darkMode ? NeurologyIconWhite : NeurologyIcon}
                getItemName={id => getCapacityName(id)}
                title={pageContent['body-profile-known-capacities-title']}
                customClass={`font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]`}
              />
              <ProfileItem
                items={organization?.available_capacities || []}
                icon={darkMode ? EmojiIconWhite : EmojiIcon}
                getItemName={id => getCapacityName(id)}
                title={pageContent['body-profile-available-capacities-title']}
                customClass={`font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]
                  `}
              />
              <ProfileItem
                items={organization?.wanted_capacities || []}
                getItemName={id => getCapacityName(id)}
                icon={darkMode ? TargetIconWhite : TargetIcon}
                title={pageContent['body-profile-wanted-capacities-title']}
                customClass={`font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]
                  `}
              />
            </div>

            {/* Projects and Events */}
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

            {/* News Section */}
            {organization?.tag_diff && organization.tag_diff.length > 0 && (
              <NewsSection ids={organization?.tag_diff || []} />
            )}

            {/* Documents Section */}
            <DocumentsList
              title="Documents"
              type="documents"
              items={organization?.documents || []}
              token={token}
            />
            {/* Contacts Section */}
            <ContactsSection
              email={organization?.email || ''}
              meta_page={organization?.meta_page || ''}
              website={organization?.website || ''}
            />
          </div>
        </section>
      </div>
    </>
  );
}
