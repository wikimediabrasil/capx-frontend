'use client';

import BaseButton from '@/components/BaseButton';
import { ProfileItem } from '@/components/ProfileItem';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import AffiliationIcon from '@/public/static/images/affiliation.svg';
import AffiliationIconWhite from '@/public/static/images/affiliation_white.svg';
import BarCodeIcon from '@/public/static/images/barcode.svg';
import BarCodeIconWhite from '@/public/static/images/barcode_white.svg';
import CakeIcon from '@/public/static/images/cake.svg';
import CakeIconWhite from '@/public/static/images/cake_white.svg';
import ContactImage from '@/public/static/images/capx_contact_person.svg';
import ContactImageDesktop from '@/public/static/images/capx_contact_person_desktop.svg';
import EmojiIcon from '@/public/static/images/emoji_objects.svg';
import EmojiIconWhite from '@/public/static/images/emoji_objects_white.svg';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import NeurologyIcon from '@/public/static/images/neurology.svg';
import NeurologyIconWhite from '@/public/static/images/neurology_white.svg';
import TargetIcon from '@/public/static/images/target.svg';
import TargetIconWhite from '@/public/static/images/target_white.svg';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import WikiIcon from '@/public/static/images/wikimedia_logo_black.svg';
import WikiIconWhite from '@/public/static/images/wikimedia_logo_white.svg';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import MiniBio from './MiniBio';
import ProfileHeader from './ProfileHeader';

import { useAffiliation } from '@/hooks/useAffiliation';
import { useLanguage } from '@/hooks/useLanguage';
import { useTerritories } from '@/hooks/useTerritories';
import { useWikimediaProject } from '@/hooks/useWikimediaProject';
import { useEffect, useMemo, useState } from 'react';

import BadgesCarousel from '@/components/BadgesCarousel';
import { useBadges } from '@/contexts/BadgesContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { getWikiBirthday } from '@/lib/utils/fetchWikimediaData';
import BadgesIcon from '@/public/static/images/icons/badges_icon.svg';
import BadgesIconWhite from '@/public/static/images/icons/badges_icon_white.svg';
import { UserProfile } from '@/types/user';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ProfilePageProps {
  isSameUser: boolean;
  profile: UserProfile;
}

const ProfileItemsComponent = ({
  icon,
  title,
  value,
  emptyText,
}: {
  icon: string;
  title: string;
  value: string | string[];
  emptyText?: string;
}) => {
  const { darkMode } = useTheme();
  const { isMobile } = useApp();

  if (isMobile) {
    return (
      <>
        <div className="flex flex-row gap-2 items-center">
          <div className="relative h-[20px] w-[20px]">
            <Image src={icon} alt={title} fill className="object-cover" />
          </div>
          <h2
            className={`font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
              darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
            }`}
          >
            {title}
          </h2>
        </div>
        <div
          className={`rounded-[4px] inline-flex px-[4px] py-[6px] items-center  ${
            darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
          }`}
        >
          <p
            className={`font-[Montserrat] text-[14px] not-italic font-normal leading-[normal] ${
              darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
            }`}
          >
            {typeof value === 'string' ? (value || emptyText) : value}
          </p>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="flex flex-row gap-2 items-center">
        <div className="relative h-[48px] w-[48px]">
          <Image src={icon} alt={title} fill className="object-cover" />
        </div>
        <h2
          className={`font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {title}
        </h2>
      </div>
      <div
        className={`rounded-[4px] inline-flex px-[4px] py-[6px] items-center  ${
          darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
        }`}
      >
        <p
          className={`font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {typeof value === 'string' ? (value || emptyText) : value}
        </p>
      </div>
    </>
  );
};

export default function ProfilePage({ isSameUser, profile }: ProfilePageProps) {
  const { data: session } = useSession();
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const token = session?.user?.token;
  const router = useRouter();
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

  const { getName, isLoadingTranslations } = useCapacityCache();

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

  if (isMobile) {
    return (
      <div
        className={`relative w-full overflow-x-hidden ${
          darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'
        }`}
      >
        <section className={`w-full max-w-screen-xl mx-auto px-4 py-8 mt-[80px]`}>
          <div className={'flex flex-col max-w-[600px] mx-auto gap-6'}>
            <ProfileHeader
              username={profile?.user?.username || ''}
              profileImage={profile?.profile_image}
              avatar={profile?.avatar}
              isSameUser={isSameUser}
            />
            {shouldRenderEmptyField(profile?.about) && <MiniBio about={profile?.about || ''} />}

            {/* Badges */}
            {shouldRenderEmptyField(activeBadges) && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? BadgesIconWhite : BadgesIcon}
                    alt={pageContent['body-profile-badges-title']}
                    width={20}
                    height={20}
                  />
                  <h2
                    className={`text-[14px] font-[Montserrat] font-bold ${
                      darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
                    }`}
                  >
                    {pageContent['body-profile-badges-title']}
                  </h2>
                </div>
                {activeBadges.length > 0 ? (
                  <BadgesCarousel badges={activeBadges} />
                ) : (
                  <span
                    className={`font-[Montserrat] text-[14px] ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-badges-no-badges']}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2 items-center">
                <div className="relative h-[16px] w-[16px]">
                  <Image
                    src={darkMode ? CakeIconWhite : CakeIcon}
                    alt="Cake icon"
                    fill
                    className="object-cover"
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] font-bold ${
                    darkMode ? 'text-white' : 'text-capx-dark-box-bg'
                  }`}
                >
                  {pageContent['body-profile-birthday-title']}
                </h2>
              </div>

              <div className="w-full">
                <p
                  className={`font-[Montserrat] text-[14px] px-[10px] py-[6px] rounded-[4px] not-italic font-normal leading-[normal] ${
                    darkMode ? 'text-white bg-capx-dark-bg' : 'text-capx-dark-box-bg bg-[#EFEFEF]'
                  }`}
                >
                  {wikiBirthday || pageContent['loading'] || 'Loading...'}
                </p>
              </div>
            </div>
            {shouldRenderEmptyField(profile?.skills_known) && (
              <ProfileItem
                icon={darkMode ? NeurologyIconWhite : NeurologyIcon}
                title={pageContent['body-profile-known-capacities-title']}
                items={profile?.skills_known || []}
                getItemName={id => getName(Number(id))}
                customClass={`font-[Montserrat] text-[14px] not-italic leading-[normal]`}
              />
            )}
            {shouldRenderEmptyField(profile?.skills_available) && (
              <ProfileItem
                icon={darkMode ? EmojiIconWhite : EmojiIcon}
                title={pageContent['body-profile-available-capacities-title']}
                items={profile?.skills_available || []}
                getItemName={id => getName(Number(id))}
                customClass={`font-[Montserrat] text-[14px] not-italic leading-[normal] `}
              />
            )}
            {shouldRenderEmptyField(profile?.skills_wanted) && (
              <ProfileItem
                icon={darkMode ? TargetIconWhite : TargetIcon}
                title={pageContent['body-profile-wanted-capacities-title']}
                items={profile?.skills_wanted || []}
                getItemName={id => getName(Number(id))}
                customClass={`font-[Montserrat] text-[14px] not-italic leading-[normal] `}
              />
            )}
            {shouldRenderEmptyField(profile?.language) && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? LanguageIconWhite : LanguageIcon}
                    alt="Language icon"
                    width={20}
                    height={20}
                    className="object-cover"
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-languages-title']}
                  </h2>
                </div>
                {profile?.language && profile.language.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.language.map((lang, index) => (
                      <div
                        key={index}
                        className={`rounded-[4px] px-[4px] py-[6px] ${
                          darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
                        }`}
                      >
                        <span
                          className={`font-[Montserrat] text-[14px] ${
                            darkMode ? 'text-white' : 'text-[#053749]'
                          }`}
                        >
                          {languages[lang.id]} - {getProficiencyLabel(lang.proficiency)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span
                    className={`font-[Montserrat] text-[14px] ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['empty-field']}
                  </span>
                )}
              </div>
            )}
            {shouldRenderEmptyField(profile?.wiki_alt) && (
              <ProfileItemsComponent
                icon={darkMode ? WikiIconWhite : WikiIcon}
                title={pageContent['body-profile-box-title-alt-wiki-acc']}
                value={profile?.wiki_alt || ''}
                emptyText={pageContent['empty-field']}
              />
            )}

            {shouldRenderEmptyField(profile?.affiliation) && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? AffiliationIconWhite : AffiliationIcon}
                    alt="Affiliation icon"
                    width={20}
                    height={20}
                    className="object-cover"
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-section-title-affiliation']}
                  </h2>
                </div>
                {profile?.affiliation && profile.affiliation.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.affiliation.map((territoryId, index) => (
                      <div
                        key={index}
                        className={`rounded-[4px] px-[4px] py-[6px] ${
                          darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
                        }`}
                      >
                        <span
                          className={`font-[Montserrat] text-[14px] ${
                            darkMode ? 'text-white' : 'text-[#053749]'
                          }`}
                        >
                          {affiliations[territoryId] || territoryId}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span
                    className={`font-[Montserrat] text-[14px] ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['empty-field']}
                  </span>
                )}
              </div>
            )}
            {shouldRenderEmptyField(profile?.territory) && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? TerritoryIconWhite : TerritoryIcon}
                    alt="Territory icon"
                    width={20}
                    height={20}
                    className="object-cover"
                  />
                  <h2
                    className={`font-[Montserrat] text-[14px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-section-title-territory']}
                  </h2>
                </div>
                {profile?.territory && profile.territory.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.territory.map((territoryId, index) => (
                      <div
                        key={index}
                        className={`rounded-[4px] px-[4px] py-[6px] ${
                          darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
                        }`}
                      >
                        <span
                          className={`font-[Montserrat] text-[14px] ${
                            darkMode ? 'text-white' : 'text-[#053749]'
                          }`}
                        >
                          {territories[territoryId] || territoryId}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span
                    className={`font-[Montserrat] text-[14px] ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['empty-field']}
                  </span>
                )}
              </div>
            )}
            {shouldRenderEmptyField(profile?.wikidata_qid) && (
              <ProfileItemsComponent
                icon={darkMode ? BarCodeIconWhite : BarCodeIcon}
                title={pageContent['body-profile-box-title-wikidata-item']}
                value={profile?.wikidata_qid || ''}
                emptyText={pageContent['empty-field']}
              />
            )}
            {shouldRenderEmptyField(profile?.wikimedia_project) && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                  <div className="relative h-[20px] w-[20px]">
                    <Image
                      src={darkMode ? WikiIconWhite : WikiIcon}
                      alt={'Wikidata Logo'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p
                    className={`font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                      darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
                    }`}
                  >
                    {pageContent['body-profile-wikimedia-projects-title']}
                  </p>
                </div>
                {profile?.wikimedia_project && profile.wikimedia_project.length > 0 ? (
                  <div className="flex flex-row gap-2">
                    {profile.wikimedia_project.map(projectId =>
                      projectId ? (
                        <div
                          key={projectId}
                          className={`relative h-[123px] w-[98px] rounded-[16px] flex items-center justify-center ${
                            darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
                          }`}
                        >
                          <Image
                            src={
                              wikimediaProjectImages[projectId] ||
                              (darkMode ? WikiIconWhite : WikiIcon)
                            }
                            className="object-contain p-[12px] object-cover"
                            alt={wikimediaProjects[projectId] || 'Project icon'}
                            fill
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                ) : (
                  <span
                    className={`font-[Montserrat] text-[14px] ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['empty-field']}
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-row gap-2">
              <div className="relative h-[20px] w-[20px]">
                <Image
                  src={darkMode ? ContactImage : ContactImage}
                  alt={'Contact Image'}
                  fill
                  className="object-cover"
                />
              </div>
              <p
                className={`font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                  darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
                }`}
              >
                {pageContent['body-profile-section-title-contact']}
              </p>
            </div>

            {isMobile && (
              <div className="flex w-[273px] m-auto px-[34px] py-[24px] flex-col items-center gap-[31px] rounded-[4px] bg-[#0070B9]">
                <div className="relative h-[200px] w-[200px]">
                  <Image src={ContactImage} alt={'Contact Image'} fill className="object-cover" />
                </div>
                <BaseButton
                  label={pageContent['body-profile-contact-button']}
                  customClass="inline-flex h-[32px] px-[19px] py-[8px] justify-center items-center gap-[10px] flex-shrink-0 rounded-[4px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
                  onClick={() => router.push(`/message?username=${profile?.user?.username}`)}
                />
              </div>
            )}

            {!isMobile && (
              <div className="flex w-full justify-center m-auto px-[34px] flex-row items-center gap-[31px] rounded-[4px] bg-[#0070B9]">
                <div className="relative h-[248px] w-[248px]">
                  <Image
                    src={ContactImageDesktop}
                    alt={'Contact Image'}
                    fill
                    className="object-cover"
                  />
                </div>
                <BaseButton
                  label={pageContent['body-profile-contact-button']}
                  customClass="inline-flex h-[32px] px-[19px] py-[8px] justify-center items-center gap-[10px] flex-shrink-0 rounded-[4px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
                  onClick={() => router.push(`/message?username=${profile?.user?.username}`)}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }
  // Desktop
  return (
    <main className="flex-grow">
      <div
        className={`relative w-full overflow-x-hidden ${
          darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'
        }`}
      >
        <section
          className={`flex w-full h-full justify-between pb-6 pt-10 px-4 px-8 lg:px-12 max-w-screen-xl mx-auto`}
        >
          <div className={`flex flex-col mx-auto gap-6`}>
            <ProfileHeader
              username={profile?.user?.username || ''}
              profileImage={profile?.profile_image}
              avatar={profile?.avatar}
              isSameUser={isSameUser}
            />
            {shouldRenderEmptyField(profile?.about) && <MiniBio about={profile?.about || ''} />}

            {/* Badges */}
            {shouldRenderEmptyField(activeBadges) && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? BadgesIconWhite : BadgesIcon}
                    alt={pageContent['body-profile-badges-title']}
                    width={42}
                    height={42}
                  />
                  <h2
                    className={`text-[24px] font-[Montserrat] font-bold ${
                      darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
                    }`}
                  >
                    {pageContent['body-profile-badges-title']}
                  </h2>
                </div>
                {activeBadges.length > 0 ? (
                  <BadgesCarousel badges={activeBadges} />
                ) : (
                  <span
                    className={`font-[Montserrat] text-[24px] ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-badges-no-badges']}
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-2 items-center">
                <Image
                  src={darkMode ? CakeIconWhite : CakeIcon}
                  alt="Cake icon"
                  width={42}
                  height={42}
                  className="object-cover"
                />
                <h2
                  className={`font-[Montserrat] text-[24px] font-bold ${
                    darkMode ? 'text-white' : 'text-capx-dark-box-bg'
                  }`}
                >
                  {pageContent['body-profile-birthday-title']}
                </h2>
              </div>
              <div
                className={`flex flex-col rounded-[4px] ${
                  darkMode ? 'bg-capx-dark-bg' : 'bg-capx-light-bg'
                }`}
              >
                <p
                  className={`font-[Montserrat] text-[24px] px-3 py-6 rounded-[4px] not-italic font-normal leading-[normal] ${
                    darkMode ? 'text-white bg-capx-dark-bg' : 'text-capx-dark-box-bg bg-[#EFEFEF]'
                  }`}
                >
                  {wikiBirthday || pageContent['loading'] || 'Loading...'}
                </p>
              </div>
            </div>
            {shouldRenderEmptyField(profile?.skills_known) && (
              <ProfileItem
                icon={darkMode ? NeurologyIconWhite : NeurologyIcon}
                title={pageContent['body-profile-known-capacities-title']}
                items={profile?.skills_known || []}
                getItemName={id => getName(Number(id))}
                customClass={`font-[Montserrat] not-italic leading-[normal]`}
              />
            )}
            {shouldRenderEmptyField(profile?.skills_available) && (
              <ProfileItem
                icon={darkMode ? EmojiIconWhite : EmojiIcon}
                title={pageContent['body-profile-available-capacities-title']}
                items={profile?.skills_available || []}
                getItemName={id => getName(Number(id))}
                customClass={`font-[Montserrat] not-italic leading-[normal] `}
              />
            )}
            {shouldRenderEmptyField(profile?.skills_wanted) && (
              <ProfileItem
                icon={darkMode ? TargetIconWhite : TargetIcon}
                title={pageContent['body-profile-wanted-capacities-title']}
                items={profile?.skills_wanted || []}
                getItemName={id => getName(Number(id))}
                customClass={`font-[Montserrat] not-italic leading-[normal] `}
              />
            )}
            {shouldRenderEmptyField(profile?.language) && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 items-center">
                  <Image
                    src={darkMode ? LanguageIconWhite : LanguageIcon}
                    alt="Language icon"
                    width={42}
                    height={42}
                    className="object-cover"
                  />
                  <h2
                    className={`font-[Montserrat] text-[24px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-languages-title']}
                  </h2>
                </div>
                {profile?.language && profile.language.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.language.map((lang, index) => (
                      <div
                        key={index}
                        className={`rounded-[4px] px-[4px] py-[6px] ${
                          darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
                        }`}
                      >
                        <span
                          className={`font-[Montserrat] text-[24px] ${
                            darkMode ? 'text-white' : 'text-[#053749]'
                          }`}
                        >
                          {languages[lang.id]} - {getProficiencyLabel(lang.proficiency)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span
                    className={`font-[Montserrat] text-[24px] ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['empty-field']}
                  </span>
                )}
              </div>
            )}
            {shouldRenderEmptyField(profile?.wiki_alt) && (
              <ProfileItemsComponent
                icon={darkMode ? WikiIconWhite : WikiIcon}
                title={pageContent['body-profile-box-title-alt-wiki-acc']}
                value={profile?.wiki_alt || ''}
                emptyText={pageContent['empty-field']}
              />
            )}
            {shouldRenderEmptyField(profile?.affiliation) && (
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? AffiliationIconWhite : AffiliationIcon}
                    alt="Affiliation icon"
                    width={42}
                    height={42}
                    className="object-cover"
                  />
                  <h2
                    className={`font-[Montserrat] text-[24px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-section-title-affiliation']}
                  </h2>
                </div>
                {profile?.affiliation && profile.affiliation.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.affiliation.map((aff, index) => (
                      <div
                        key={index}
                        className={`rounded-[4px] px-[4px] py-[6px] ${
                          darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
                        }`}
                      >
                        <span
                          className={`font-[Montserrat] text-[24px] ${
                            darkMode ? 'text-white' : 'text-[#053749]'
                          }`}
                        >
                          {affiliations[aff] || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span
                    className={`font-[Montserrat] text-[24px] ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['empty-field']}
                  </span>
                )}
              </div>
            )}
            {shouldRenderEmptyField(profile?.territory) && (
              <div className="flex flex-col gap-2 md:mt-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={darkMode ? TerritoryIconWhite : TerritoryIcon}
                    alt="Territory icon"
                    width={42}
                    height={42}
                    className="object-cover"
                  />
                  <h2
                    className={`font-[Montserrat] text-[24px] font-bold ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['body-profile-section-title-territory']}
                  </h2>
                </div>
                {profile?.territory && profile.territory.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.territory.map((terr, index) => (
                      <div
                        key={index}
                        className={`rounded-[4px] px-[4px] py-[6px] ${
                          darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
                        }`}
                      >
                        <span
                          className={`font-[Montserrat] text-[24px] ${
                            darkMode ? 'text-white' : 'text-[#053749]'
                          }`}
                        >
                          {territories[terr] || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span
                    className={`font-[Montserrat] text-[24px] ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['empty-field']}
                  </span>
                )}
              </div>
            )}
            {shouldRenderEmptyField(profile?.wikidata_qid) && (
              <ProfileItemsComponent
                icon={darkMode ? BarCodeIconWhite : BarCodeIcon}
                title={pageContent['body-profile-box-title-wikidata-item']}
                value={profile?.wikidata_qid || ''}
                emptyText={pageContent['empty-field']}
              />
            )}
            {shouldRenderEmptyField(profile?.wikimedia_project) && (
              <>
                <div className="flex flex-row gap-2 items-center">
                  <div className="relative h-[48px] w-[48px]">
                    <Image
                      src={darkMode ? WikiIconWhite : WikiIcon}
                      alt={'Wikidata Logo'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p
                    className={`font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                      darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
                    }`}
                  >
                    {pageContent['body-profile-wikimedia-projects-title']}
                  </p>
                </div>
                {profile?.wikimedia_project && profile.wikimedia_project.length > 0 ? (
                  <div className="flex flex-row gap-5 items-center">
                    {profile.wikimedia_project.map(projectId =>
                      projectId ? (
                        <div
                          key={projectId}
                          className={`relative h-[250px] w-[180px] bg-[#EFEFEF] rounded-[16px] flex items-center justify-center ${
                            darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
                          }`}
                        >
                          <Image
                            src={
                              wikimediaProjectImages[projectId] ||
                              (darkMode ? WikiIconWhite : WikiIcon)
                            }
                            alt={wikimediaProjects[projectId] || 'Project icon'}
                            className="object-contain p-[24px]"
                            fill
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                ) : (
                  <span
                    className={`font-[Montserrat] text-[24px] ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {pageContent['empty-field']}
                  </span>
                )}
              </>
            )}
            <div className="flex flex-row gap-2 items-center mb-[16px]">
              <div className="relative h-[48px] w-[48px]">
                <Image
                  src={darkMode ? WikiIconWhite : WikiIcon}
                  alt={'Wikidata Logo'}
                  fill
                  className="object-cover"
                />
              </div>
              <p
                className={`font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
                }`}
              >
                {pageContent['body-profile-section-title-contact']}
              </p>
            </div>
            <div className="flex w-full justify-center m-auto px-[34px] flex-row items-center gap-[31px] rounded-[4px] bg-[#0070B9]">
              <div className="relative h-[248px] w-[248px]">
                <Image
                  src={ContactImageDesktop}
                  alt={'Contact Image'}
                  fill
                  className="object-cover"
                />
              </div>
              <BaseButton
                label={pageContent['body-profile-contact-button']}
                customClass="inline-flex h-[32px] px-[19px] py-[8px] justify-center items-center gap-[10px] flex-shrink-0 rounded-[4px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
                onClick={() => router.push(`/message?username=${profile?.user?.username}`)}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
