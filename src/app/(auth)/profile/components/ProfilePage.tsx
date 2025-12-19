'use client';

import { ProfileItem } from '@/components/ProfileItem';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import NeurologyIcon from '@/public/static/images/neurology.svg';
import NeurologyIconWhite from '@/public/static/images/neurology_white.svg';
import EmojiIcon from '@/public/static/images/emoji_objects.svg';
import EmojiIconWhite from '@/public/static/images/emoji_objects_white.svg';
import TargetIcon from '@/public/static/images/target.svg';
import TargetIconWhite from '@/public/static/images/target_white.svg';
import WikiIcon from '@/public/static/images/wikimedia_logo_black.svg';
import WikiIconWhite from '@/public/static/images/wikimedia_logo_white.svg';
import AffiliationIcon from '@/public/static/images/affiliation.svg';
import AffiliationIconWhite from '@/public/static/images/affiliation_white.svg';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import BarCodeIcon from '@/public/static/images/barcode.svg';
import BarCodeIconWhite from '@/public/static/images/barcode_white.svg';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import MiniBio from './MiniBio';
import ProfileHeader from './ProfileHeader';
import ProfileBadgesSection from './ProfileBadgesSection';
import ProfileWikiBirthdaySection from './ProfileWikiBirthdaySection';
import ProfileLanguagesSection from './ProfileLanguagesSection';
import ProfileFieldSection from './ProfileFieldSection';
import ProfileItemsList from './ProfileItemsList';
import ProfileSimpleField from './ProfileSimpleField';
import ProfileWikimediaProjectsSection from './ProfileWikimediaProjectsSection';
import ProfileContactSection from './ProfileContactSection';

import { useAffiliation } from '@/hooks/useAffiliation';
import { useLanguage } from '@/hooks/useLanguage';
import { useTerritories } from '@/hooks/useTerritories';
import { useWikimediaProject } from '@/hooks/useWikimediaProject';
import { useEffect, useMemo, useState } from 'react';

import { useBadges } from '@/contexts/BadgesContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { getWikiBirthday } from '@/lib/utils/fetchWikimediaData';
import { UserProfile } from '@/types/user';
import React from 'react';

interface ProfilePageProps {
  isSameUser: boolean;
  profile: UserProfile;
}

export default function ProfilePage({ isSameUser, profile }: ProfilePageProps) {
  const { data: session } = useSession();
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const token = session?.user?.token;
  const { allBadges } = useBadges();
  const activeBadges = useMemo(() => {
    return allBadges.filter(badge => profile?.badges.includes(badge.id));
  }, [allBadges, profile?.badges]);

  const { languages } = useLanguage(token);
  const { affiliations } = useAffiliation(token);
  const { territories } = useTerritories(token);
  const { wikimediaProjects, wikimediaProjectImages } = useWikimediaProject(
    token,
    profile?.wikimedia_project || []
  );
  const [wikiBirthday, setWikiBirthday] = useState<string | null>(null);

  const { getName } = useCapacityCache();

  useEffect(() => {
    const fetchWikiBirthday = async () => {
      if (profile?.user?.username) {
        const registrationDate = await getWikiBirthday(profile.user.username);
        if (registrationDate) {
          const date = new Date(registrationDate);
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          setWikiBirthday(`${day}/${month}/${year}`);
        }
      }
    };

    fetchWikiBirthday();
  }, [profile?.user?.username]);

  const getProficiencyLabel = (proficiency: string) => {
    const labels = {
      '0': pageContent['profiency-level-not-proficient'],
      '1': pageContent['profiency-level-basic'],
      '2': pageContent['profiency-level-intermediate'],
      '3': pageContent['profiency-level-advanced'],
      '4': pageContent['profiency-level-almost-native'],
      '5': pageContent['profiency-level-professional'],
      n: pageContent['profiency-level-native'],
    };
    return labels[proficiency as keyof typeof labels] || 'Not specified';
  };

  // only renders empty fields for the logged user
  const shouldRenderEmptyField = (field: string | any[]) => {
    if (typeof field === 'string') {
      return isSameUser || field != '';
    }
    if (Array.isArray(field)) {
      return isSameUser || field.length > 0;
    }
    return isSameUser;
  };

  const containerClass = `relative w-full overflow-x-hidden ${
    darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'
  }`;

  const sectionClass = isMobile
    ? 'w-full max-w-screen-xl mx-auto px-4 py-8 mt-[80px]'
    : 'flex w-full h-full justify-between pb-6 pt-10 px-4 md:px-8 lg:px-12 max-w-screen-xl mx-auto';

  const contentClass = isMobile
    ? 'flex flex-col max-w-[600px] mx-auto gap-6'
    : 'flex flex-col mx-auto gap-6 w-full max-w-full';

  const MainWrapper = isMobile ? 'div' : 'main';
  const mainProps = isMobile ? {} : { className: 'flex-grow overflow-x-hidden' };

  return (
    <MainWrapper {...mainProps}>
      <div className={containerClass}>
        <section className={sectionClass}>
          <div className={contentClass}>
            <ProfileHeader
              username={profile?.user?.username || ''}
              avatar={profile?.avatar}
              wikidataQid={profile?.wikidata_qid}
              isSameUser={isSameUser}
            />
            {shouldRenderEmptyField(profile?.about) && <MiniBio about={profile?.about || ''} />}

            {/* Badges */}
            {shouldRenderEmptyField(activeBadges) && <ProfileBadgesSection badges={activeBadges} />}

            {/* Wiki Birthday */}
            <ProfileWikiBirthdaySection wikiBirthday={wikiBirthday} />

            {/* Known Capacities */}
            {shouldRenderEmptyField(profile?.skills_known) && (
              <ProfileItem
                icon={darkMode ? NeurologyIconWhite : NeurologyIcon}
                title={pageContent['body-profile-known-capacities-title']}
                items={profile?.skills_known || []}
                getItemName={id => getName(Number(id))}
                customClass={`font-[Montserrat] ${isMobile ? 'text-[14px]' : ''} not-italic leading-[normal]`}
              />
            )}

            {/* Available Capacities */}
            {shouldRenderEmptyField(profile?.skills_available) && (
              <ProfileItem
                icon={darkMode ? EmojiIconWhite : EmojiIcon}
                title={pageContent['body-profile-available-capacities-title']}
                items={profile?.skills_available || []}
                getItemName={id => getName(Number(id))}
                customClass={`font-[Montserrat] ${isMobile ? 'text-[14px]' : ''} not-italic leading-[normal]`}
              />
            )}

            {/* Wanted Capacities */}
            {shouldRenderEmptyField(profile?.skills_wanted) && (
              <ProfileItem
                icon={darkMode ? TargetIconWhite : TargetIcon}
                title={pageContent['body-profile-wanted-capacities-title']}
                items={profile?.skills_wanted || []}
                getItemName={id => getName(Number(id))}
                customClass={`font-[Montserrat] ${isMobile ? 'text-[14px]' : ''} not-italic leading-[normal]`}
              />
            )}

            {/* Languages */}
            {shouldRenderEmptyField(profile?.language) && (
              <ProfileLanguagesSection
                languages={profile?.language || []}
                languagesMap={languages}
                getProficiencyLabel={getProficiencyLabel}
              />
            )}

            {/* Wiki Alt */}
            {shouldRenderEmptyField(profile?.wiki_alt) && (
              <ProfileSimpleField
                icon={darkMode ? WikiIconWhite : WikiIcon}
                title={pageContent['body-profile-box-title-alt-wiki-acc']}
                value={profile?.wiki_alt || ''}
                emptyText={pageContent['empty-field']}
              />
            )}

            {/* Affiliation */}
            {shouldRenderEmptyField(profile?.affiliation) && (
              <ProfileFieldSection
                icon={darkMode ? AffiliationIconWhite : AffiliationIcon}
                iconAlt="Affiliation icon"
                title={pageContent['body-profile-section-title-affiliation']}
              >
                <ProfileItemsList
                  items={(profile?.affiliation || []).map(id => ({
                    id,
                    label: affiliations[id] || id.toString(),
                  }))}
                />
              </ProfileFieldSection>
            )}

            {/* Territory */}
            {shouldRenderEmptyField(profile?.territory) && (
              <ProfileFieldSection
                icon={darkMode ? TerritoryIconWhite : TerritoryIcon}
                iconAlt="Territory icon"
                title={pageContent['body-profile-section-title-territory']}
              >
                <ProfileItemsList
                  items={(profile?.territory || []).map(id => ({
                    id,
                    label: territories[id] || id.toString(),
                  }))}
                />
              </ProfileFieldSection>
            )}

            {/* Wikidata QID */}
            {shouldRenderEmptyField(profile?.wikidata_qid) && (
              <ProfileSimpleField
                icon={darkMode ? BarCodeIconWhite : BarCodeIcon}
                title={pageContent['body-profile-box-title-wikidata-item']}
                value={profile?.wikidata_qid || ''}
                emptyText={pageContent['empty-field']}
              />
            )}

            {/* Wikimedia Projects */}
            {shouldRenderEmptyField(profile?.wikimedia_project) && (
              <ProfileWikimediaProjectsSection
                projects={profile?.wikimedia_project || []}
                projectImages={wikimediaProjectImages}
                projectNames={wikimediaProjects}
              />
            )}

            {/* Contact Section Header */}
            <div className={`flex flex-row gap-2 items-center ${isMobile ? '' : 'mb-[16px]'}`}>
              <div className={`relative ${isMobile ? 'h-[20px] w-[20px]' : 'h-[48px] w-[48px]'}`}>
                <Image
                  src={darkMode ? WikiIconWhite : WikiIcon}
                  alt="Wikidata Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <p
                className={`font-[Montserrat] ${isMobile ? 'text-[14px]' : 'text-[24px]'} not-italic font-extrabold leading-[normal] ${
                  darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
                }`}
              >
                {pageContent['body-profile-section-title-contact']}
              </p>
            </div>

            {/* Contact Section */}
            <ProfileContactSection username={profile?.user?.username || ''} />
          </div>
        </section>
      </div>
    </MainWrapper>
  );
}
