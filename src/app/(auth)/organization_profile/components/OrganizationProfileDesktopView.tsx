"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useOrganization } from "@/hooks/useOrganizationProfile";
import { formatWikiImageUrl } from "@/lib/utils/fetchWikimediaData";
import NoAvatarIcon from "@/public/static/images/no_avatar.svg";
import UserCircleIcon from "@/public/static/images/supervised_user_circle.svg";
import UserCircleIconWhite from "@/public/static/images/supervised_user_circle_white.svg";
import NeurologyIcon from "@/public/static/images/neurology.svg";
import NeurologyIconWhite from "@/public/static/images/neurology_white.svg";
import EmojiIcon from "@/public/static/images/emoji_objects.svg";
import EmojiIconWhite from "@/public/static/images/emoji_objects_white.svg";
import TargetIcon from "@/public/static/images/target.svg";
import TargetIconWhite from "@/public/static/images/target_white.svg";
import EditIcon from "@/public/static/images/edit.svg";
import EditIconWhite from "@/public/static/images/edit_white.svg";
import ReportActivityIcon from "@/public/static/images/report_of_activities.svg";
import BaseButton from "@/components/BaseButton";
import { ProfileItem } from "@/components/ProfileItem";
import ProjectsList from "./ProjectsList";
import EventsSection from "./EventsSection";
import { NewsSection } from "./NewsSection";
import { DocumentsList } from "./DocumentsList";
import { ContactsSection } from "./ContactsSection";
import { useCapacityDetails } from "@/hooks/useCapacityDetails";
import LoadingState from "@/components/LoadingState";
import { useEffect } from "react";

export default function OrganizationProfileDesktopView({
  pageContent,
  darkMode,
  isMobile,
  organization,
  organizationId,
  token,
  isOrgManager,
  getCapacityName,
  allCapacityIds,
}) {
  const router = useRouter();
  const {
    organizations,
    isLoading: isOrganizationLoading,
    error,
    refetch,
  } = useOrganization(token, organizationId);

  if (isOrganizationLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <div
        className={`relative w-full overflow-x-hidden ${
          darkMode ? "bg-capx-dark-box-bg" : "bg-capx-light-bg"
        }`}
      >
        <section
          className={`w-full max-w-screen-xl mx-auto px-4 py-8 mt-[80px]`}
        >
          <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-row gap-6">
              {/* Logo */}
              <div className="w-full">
                <div className="relative h-[326px] w-[595px] bg-[#EFEFEF] rounded-[16px] flex items-center justify-center">
                  {organization?.profile_image ? (
                    <Image
                      src={
                        formatWikiImageUrl(organization.profile_image) ||
                        NoAvatarIcon
                      }
                      alt="Organization logo"
                      className="object-contain p-24"
                      fill
                      priority
                    />
                  ) : (
                    <div className="w-[595px] h-[326px] bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">
                        {pageContent["logo-not-available"]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="w-full flex flex-col gap-4 justify-center">
                <h1
                  className={`font-[Montserrat] text-[32px] md:text-[48px] not-italic font-normal leading-[normal] md:leading-[59px] mb-4 ${
                    darkMode ? "text-capx-dark-text" : "text-capx-light-text"
                  }`}
                >
                  {pageContent["edit-profile-welcome"]}
                </h1>

                <div className="flex items-center gap-2 mb-2">
                  <Image
                    src={darkMode ? UserCircleIconWhite : UserCircleIcon}
                    alt="User circle icon"
                    style={{ width: "auto", height: "auto" }}
                    width={20}
                    height={20}
                  />
                  <span
                    className={`text-center font-[Montserrat] text-[20px] md:text-[24px] not-italic font-extrabold leading-[normal] pl-2 ${
                      darkMode ? "text-white" : "text-capx-dark-box-bg"
                    }`}
                  >
                    {organization?.display_name}
                  </span>
                </div>

                {/* <p
                  className={`font-[Montserrat] text-[16px] md:text-[20px] not-italic font-normal leading-[normal] md:leading-[29px] mb-4 ${
                    darkMode ? "text-white" : "text-capx-dark-box-bg"
                  }`}
                >
                  TODO
                </p> */}

                {isOrgManager && (
                  <BaseButton
                    onClick={() =>
                      router.push(
                        `/organization_profile/${organizationId}/edit`
                      )
                    }
                    label={pageContent["body-profile-edit-organization-button"]}
                    customClass={`w-full md:w-2/3 sm:w-full font-[Montserrat] text-[20px] not-italic font-extrabold leading-[normal] inline-flex h-[64px] px-[32px] py-[16px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid] ${
                      darkMode
                        ? "border-white text-white"
                        : "border-capx-dark-box-bg text-capx-light-text"
                    }`}
                    imageUrl={darkMode ? EditIconWhite : EditIcon}
                    imageAlt="Edit icon"
                    imageWidth={32}
                    imageHeight={32}
                  />
                )}
              </div>
            </div>

            {/* Report Activity Image */}
            {organization?.report_link && (
              <div className="flex flex-row justify-between px-[85px] py-[64px] items-center rounded-[4px] bg-[#04222F] w-full h-[399px] flex-shrink-0">
                <div className="relative w-[619px] h-[271px]">
                  <Image
                    src={ReportActivityIcon}
                    alt="Report activity icon"
                    className="object-contain"
                    width={619}
                    height={271}
                    priority
                  />
                </div>
                <div className="flex flex-col justify-center items-center gap-2">
                  <h2 className="text-[#FFF] text-[30px] not-italic font-extrabold leading-[37px] mb-6">
                    {
                      pageContent[
                        "organization-profile-report-activities-title"
                      ]
                    }
                  </h2>
                  <BaseButton
                    onClick={() =>
                      organization?.report_link &&
                      window.open(organization.report_link, "_blank")
                    }
                    label={pageContent["organization-profile-click-here"]}
                    customClass="inline-flex h-[64px] px-[32px] py-[16px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]"
                  />
                </div>
              </div>
            )}

            {/* Capacities Lists */}
            <div className="space-y-6 mt-4">
              <ProfileItem
                items={organization?.known_capacities || []}
                icon={darkMode ? NeurologyIconWhite : NeurologyIcon}
                title={pageContent["body-profile-known-capacities-title"]}
                getItemName={(id) => getCapacityName(id)}
                customClass={`text-center text-[24px] not-italic font-extrabold leading-[29px] font-[Montserrat] ${
                  darkMode ? "text-white" : "text-capx-dark-box-bg"
                }`}
              />
              <ProfileItem
                items={organization?.available_capacities || []}
                icon={darkMode ? EmojiIconWhite : EmojiIcon}
                getItemName={(id) => getCapacityName(id)}
                title={pageContent["body-profile-available-capacities-title"]}
                customClass={`text-center text-[24px] not-italic font-extrabold leading-[29px] font-[Montserrat] ${
                  darkMode ? "text-white" : "text-capx-dark-box-bg"
                }`}
              />
              <ProfileItem
                items={organization?.wanted_capacities || []}
                icon={darkMode ? TargetIconWhite : TargetIcon}
                getItemName={(id) => getCapacityName(id)}
                title={pageContent["body-profile-wanted-capacities-title"]}
                customClass={`text-center text-[24px] not-italic font-extrabold leading-[29px] font-[Montserrat] ${
                  darkMode ? "text-white" : "text-capx-dark-box-bg"
                }`}
              />
            </div>

            {/* Projects */}
            <div className="space-y-6 mt-4">
              <ProjectsList
                title={pageContent["body-profile-section-title-main-projects"]}
                itemIds={organization?.projects || []}
                token={token}
              />
              {/* Featured Events */}
              {organization?.choose_events &&
                organization.choose_events.length > 0 && (
                  <div className="space-y-6 mt-4">
                    <EventsSection
                      title={
                        pageContent["body-profile-section-title-events"] ||
                        "Featured Events"
                      }
                      itemIds={organization?.choose_events || []}
                      token={token}
                    />
                  </div>
                )}
            </div>

            {/* News Section */}
            <NewsSection ids={organization?.tag_diff || []} />

            {/* Documents Section */}
            <DocumentsList
              title={pageContent["body-profile-section-title-documents"]}
              type="documents"
              items={organization?.documents || []}
              token={token}
            />

            {/* Contacts Section */}
            <ContactsSection
              email={organization?.email || ""}
              meta_page={organization?.meta_page || ""}
              website={organization?.website || ""}
            />
          </div>
        </section>
      </div>
    </>
  );
}
