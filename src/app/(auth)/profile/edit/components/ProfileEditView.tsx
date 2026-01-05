'use client';

import { CapacitySearch } from '@/app/(auth)/capacity/components/CapacitySearch';
import BadgeSelectionModal from '@/components/BadgeSelectionModal';
import Banner from '@/components/Banner';
import BaseButton from '@/components/BaseButton';
import LetsConnectPopup from '@/components/LetsConnectPopup';
import Popup from '@/components/Popup';
import { useApp } from '@/contexts/AppContext';
import { useBadges } from '@/contexts/BadgesContext';
import {
  addAffiliationToFormData,
  addLanguageToFormData,
  addProjectToFormData,
  addTerritoryToFormData,
} from '@/lib/utils/formDataUtils';

import AffiliationIcon from '@/public/static/images/affiliation.svg';
import AffiliationIconWhite from '@/public/static/images/affiliation_white.svg';
import EmojiIcon from '@/public/static/images/emoji_objects.svg';
import EmojiIconWhite from '@/public/static/images/emoji_objects_white.svg';
import NeurologyIcon from '@/public/static/images/neurology.svg';
import NeurologyIconWhite from '@/public/static/images/neurology_white.svg';
import TargetIcon from '@/public/static/images/target.svg';
import TargetIconWhite from '@/public/static/images/target_white.svg';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';

import { Capacity } from '@/types/capacity';
import { Profile } from '@/types/profile';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ActionButtons } from './ProfileEditView/ActionButtons';
import { AlternativeAccountSection } from './ProfileEditView/AlternativeAccountSection';
import { AvatarImageSection } from './ProfileEditView/AvatarImageSection';
import { BadgesSection } from './ProfileEditView/BadgesSection';
import { CapacitySection } from './ProfileEditView/CapacitySection';
import { LanguageSection } from './ProfileEditView/LanguageSection';
import { MiniBioSection } from './ProfileEditView/MiniBioSection';
import { SelectionSection } from './ProfileEditView/SelectionSection';
import { WikidataItemSection } from './ProfileEditView/WikidataItemSection';
import { WikimediaProjectsSection } from './ProfileEditView/WikimediaProjectsSection';
import { useAvatarManagement } from './ProfileEditView/useAvatarManagement';
import { useThemeConfig } from './ProfileEditView/useThemeConfig';
import { getUserCheckIcon } from './ProfileEditView/themeHelpers';

interface ProfileEditViewProps {
  readonly selectedAvatar: any;
  readonly handleAvatarSelect: (avatarId: number | null) => void;
  readonly showAvatarPopup: boolean;
  readonly setShowAvatarPopup: (show: boolean) => void;
  readonly handleWikidataClick: (newWikidataSelected: boolean) => void;
  readonly isWikidataSelected: boolean;
  readonly showCapacityModal: boolean;
  readonly setShowCapacityModal: (show: boolean) => void;
  readonly handleCapacitySelect: (capacities: Capacity[]) => void;
  readonly selectedCapacityType: 'known' | 'available' | 'wanted';
  readonly handleAddCapacity: (type: 'known' | 'available' | 'wanted') => void;
  readonly handleRemoveCapacity: (type: 'known' | 'available' | 'wanted', index: number) => void;
  readonly handleRemoveLanguage: (index: number) => void;
  readonly getCapacityName: (id: number) => string;
  readonly handleAddProject: () => void;
  readonly handleSubmit: () => void;
  readonly handleCancel: () => void;
  readonly handleDeleteProfile: () => void;
  readonly formData: Partial<Profile>;
  readonly setFormData: (data: Partial<Profile>) => void;
  readonly territories: Record<string, string>;
  readonly languages: Record<string, string>;
  readonly affiliations: Record<string, string>;
  readonly wikimediaProjects: Record<string, string>;
  readonly profile: Profile;
  readonly avatars: any[] | undefined;
  readonly refetch: () => Promise<any>;
  readonly goTo: (path: string) => void;
  readonly isImageLoading: boolean;
  readonly hasLetsConnectAccount: boolean;
  readonly hasLetsConnectData: boolean;
  readonly setIsImageLoading: (loading: boolean) => void;
  readonly showLetsConnectPopup: boolean;
  readonly setShowLetsConnectPopup: (show: boolean) => void;
  readonly handleLetsConnectImport: () => void;
  readonly isLetsConnectLoading: boolean;
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
    handleSubmit,
    handleDeleteProfile,
    formData,
    setFormData,
    territories,
    languages,
    affiliations,
    wikimediaProjects,
    profile,
    refetch,
    goTo,
    isImageLoading,
    hasLetsConnectData,
    hasLetsConnectAccount,
    showLetsConnectPopup,
    setShowLetsConnectPopup,
    handleLetsConnectImport,
    isLetsConnectLoading,
  } = props;

  const router = useRouter();
  const { data: session } = useSession();
  const { isMobile, pageContent } = useApp();
  const username = session?.user?.name;
  const [showDeleteProfilePopup, setShowDeleteProfilePopup] = useState(false);
  const { userBadges, isLoading: isBadgesLoading, updateUserBadges } = useBadges();
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const completedBadges = userBadges.filter(badge => badge.progress === 100);
  const displayedBadges = completedBadges.filter(badge => badge.is_displayed);
  const avatarUrl = useAvatarManagement(profile);

  // Theme configuration (consolidated)
  const {
    bgColor,
    topMargin,
    contentMargin,
    titleColor,
    accountIcon,
    iconSize,
    letsConnect,
    darkMode,
  } = useThemeConfig();

  // Icon selections
  const userCheckIconSrc = getUserCheckIcon(darkMode);

  // Named event handlers (extracted from inline)
  const handleNavigateBack = () => router.back();
  const handleShowDeletePopup = () => setShowDeleteProfilePopup(true);
  const handleNavigateToLetsConnect = () => goTo('/profile/lets_connect');
  const handleWikiAltChange = (value: string) => {
    setFormData({ ...formData, wiki_alt: value });
  };
  const handleImportKnownCapacities = () => {
    const knownCapacities = formData?.skills_known || [];
    const availableCapacities = formData?.skills_available || [];
    const newAvailable = Array.from(new Set([...availableCapacities, ...knownCapacities]));
    setFormData({ ...formData, skills_available: newAvailable });
  };
  const handleAffiliationRemove = (index: number) => {
    const newAffiliations = formData.affiliation?.filter((_, i) => i !== index);
    setFormData({ ...formData, affiliation: newAffiliations });
  };
  const handleAffiliationAdd = (value: string) => {
    setFormData(addAffiliationToFormData(formData, value));
  };
  const handleTerritoryRemove = (index: number) => {
    const newTerritories = formData.territory?.filter((_, i) => i !== index);
    setFormData({ ...formData, territory: newTerritories });
  };
  const handleTerritoryAdd = (value: string) => {
    setFormData(addTerritoryToFormData(formData, value));
  };

  return (
    <>
      <div className={`relative w-full overflow-x-hidden min-h-screen ${bgColor}`}>
        <section className={`w-full max-w-screen-xl mx-auto px-4 md:px-12 py-8 ${topMargin}`}>
          <div className={`flex flex-col gap-6 ${contentMargin} mx-auto`}>
            {/* Header - Responsive */}
            <div className="flex flex-col gap-2">
              <h1
                className={`font-[Montserrat] text-[16px] md:text-[48px] not-italic font-normal leading-[29px] ${titleColor}`}
              >
                {pageContent['edit-profile-welcome']}
              </h1>
              <div className="flex items-center gap-[6px] md:py-6">
                <div className="relative w-[24px] h-[24px] md:w-[48px] md:h-[48px]">
                  <Image
                    src={accountIcon}
                    alt="User circle icon"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <span
                  className={`text-start ${titleColor} font-[Montserrat] text-[20px] md:text-[24px] font-extrabold`}
                >
                  {username}
                </span>
              </div>
            </div>

            {/* Action Buttons - Mobile shows first, Desktop shows later */}
            <ActionButtons
              onSave={handleSubmit}
              onCancel={handleNavigateBack}
              onDelete={handleShowDeletePopup}
              variant="mobile-top"
            />

            {/* Desktop Action Buttons - only show on desktop */}
            <ActionButtons
              onSave={handleSubmit}
              onCancel={handleNavigateBack}
              variant="desktop-top"
            />

            {/* Image Profile Section - Responsive layout */}
            <AvatarImageSection
              selectedAvatar={selectedAvatar}
              avatarUrl={avatarUrl}
              isImageLoading={isImageLoading}
              showAvatarPopup={showAvatarPopup}
              setShowAvatarPopup={setShowAvatarPopup}
              handleAvatarSelect={handleAvatarSelect}
              isWikidataSelected={isWikidataSelected}
              handleWikidataClick={handleWikidataClick}
              hasLetsConnectData={hasLetsConnectData}
              formData={formData}
              setShowLetsConnectPopup={setShowLetsConnectPopup}
              isLetsConnectLoading={isLetsConnectLoading}
              showDeleteProfilePopup={showDeleteProfilePopup}
              setShowDeleteProfilePopup={setShowDeleteProfilePopup}
              handleDeleteProfile={handleDeleteProfile}
              refetch={refetch}
            />

            {/* Badges Section */}
            <BadgesSection
              isBadgesLoading={isBadgesLoading}
              displayedBadges={displayedBadges}
              userBadges={userBadges}
              setShowBadgeModal={setShowBadgeModal}
              onSeeAllClick={() => router.push('/profile/badges')}
            />

            {/* Mini Bio Section */}
            <MiniBioSection formData={formData} setFormData={setFormData} />

            {/* Capacities Sections */}
            <div className="space-y-6">
              {/* Known Capacities */}
              <CapacitySection
                type="known"
                title={pageContent['body-profile-section-title-known-capacity']}
                icon={NeurologyIcon}
                iconDark={NeurologyIconWhite}
                capacities={formData?.skills_known || []}
                getCapacityName={getCapacityName}
                onRemove={handleRemoveCapacity}
                onAdd={handleAddCapacity}
                helpText={pageContent['edit-profile-select-skills']}
              />

              {/* Available Capacities */}
              <CapacitySection
                type="available"
                title={pageContent['body-profile-section-title-available-capacity']}
                icon={EmojiIcon}
                iconDark={EmojiIconWhite}
                capacities={formData?.skills_available || []}
                getCapacityName={getCapacityName}
                onRemove={handleRemoveCapacity}
                onAdd={handleAddCapacity}
                helpText={
                  isMobile
                    ? 'From your known capacities, choose those you are available to share.'
                    : pageContent['edit-profile-available-capacities']
                }
                showImportButton={true}
                onImport={handleImportKnownCapacities}
              />

              {/* Wanted Capacities */}
              <CapacitySection
                type="wanted"
                title={pageContent['body-profile-section-title-wanted-capacity']}
                icon={TargetIcon}
                iconDark={TargetIconWhite}
                capacities={formData?.skills_wanted || []}
                getCapacityName={getCapacityName}
                onRemove={handleRemoveCapacity}
                onAdd={handleAddCapacity}
                helpText={pageContent['edit-profile-wanted-capacities']}
              />

              {/* Languages Section */}
              <LanguageSection
                formData={formData}
                setFormData={setFormData}
                languages={languages}
                handleRemoveLanguage={handleRemoveLanguage}
                addLanguageToFormData={addLanguageToFormData}
              />

              <span
                className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                  darkMode ? 'text-white' : 'text-[#053749]'
                }`}
              >
                {pageContent['edit-profile-language-tooltip']}
              </span>

              {/* Alternative Wikimedia Account */}
              <AlternativeAccountSection
                wikiAlt={formData.wiki_alt}
                onChange={handleWikiAltChange}
              />

              {/* Affiliation Section */}
              <SelectionSection
                title={pageContent['body-profile-section-title-affiliation']}
                icon={AffiliationIcon}
                iconDark={AffiliationIconWhite}
                selectedItems={formData.affiliation || []}
                availableOptions={affiliations}
                onRemove={handleAffiliationRemove}
                onAdd={handleAffiliationAdd}
                helpText={pageContent['body-profile-section-affiliation-dropdown-menu']}
                placeholder={pageContent['edit-profile-insert-item']}
              />

              {/* Territory */}
              <SelectionSection
                title={pageContent['body-profile-section-title-territory']}
                icon={TerritoryIcon}
                iconDark={TerritoryIconWhite}
                selectedItems={formData.territory || []}
                availableOptions={territories}
                onRemove={handleTerritoryRemove}
                onAdd={handleTerritoryAdd}
                helpText={pageContent['edit-profile-territory']}
                placeholder={pageContent['edit-profile-insert-item']}
              />

              {/* Wikidata Item */}
              <WikidataItemSection
                isWikidataSelected={isWikidataSelected}
                handleWikidataClick={handleWikidataClick}
              />

              {/* Wikimedia Projects */}
              <WikimediaProjectsSection
                formData={formData}
                setFormData={setFormData}
                wikimediaProjects={wikimediaProjects}
                addProjectToFormData={addProjectToFormData}
              />
            </div>

            {/* Let's Connect Section */}
            <div className="flex flex-col">
              <div className="w-[300px] md:w-[580px] h-auto">
                <Image
                  src={letsConnect.titleImage}
                  alt="Let's Connect"
                  className="w-full h-auto"
                  priority
                />
              </div>
              <p
                className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-[30px] mb-4 ${letsConnect.textColor}`}
              >
                {pageContent['lets-connect-edit-user-info-1']}
              </p>
              <div className={letsConnect.bgClass}>
                <Banner
                  image={letsConnect.banner}
                  alt={pageContent['lets-connect-alt-banner']}
                  title={{
                    mobile: letsConnect.titleImageMobile,
                    desktop: letsConnect.titleImageDesktop,
                  }}
                  customClass={{
                    background: 'bg-[#EFEFEF]',
                    wrapper: isMobile ? '' : 'mb-0',
                  }}
                />
              </div>
              <BaseButton
                onClick={handleNavigateToLetsConnect}
                label={
                  hasLetsConnectAccount
                    ? pageContent['lets-connect-form-user-button-update-profile']
                    : pageContent['lets-connect-form-user-edit']
                }
                customClass={`w-full md:w-1/2 flex ${letsConnect.buttonClass} rounded-md py-2 font-[Montserrat] text-[14px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] md:px-8 md:py-4 items-center gap-[4px]`}
                imageUrl={userCheckIconSrc.src}
                imageAlt="Add project"
                imageWidth={iconSize}
                imageHeight={iconSize}
              />
              <p
                className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-[30px] mt-4 ${letsConnect.textColor}`}
              >
                {pageContent['lets-connect-edit-user-info-2']}
              </p>
            </div>

            {/* Action Buttons - Bottom (Mobile and Desktop) */}
            <ActionButtons onSave={handleSubmit} onCancel={handleNavigateBack} variant="bottom" />
          </div>
        </section>
      </div>

      {showCapacityModal && (
        <Popup
          onClose={() => setShowCapacityModal(false)}
          title={`Choose ${selectedCapacityType} capacity`}
          minHeight="min-h-[200px] md:min-h-[250px]"
          contentScrollable={true}
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
