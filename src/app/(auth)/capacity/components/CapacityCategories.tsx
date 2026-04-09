'use client';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import BaseButton from '@/components/BaseButton';
import { useUserCapacities } from '@/hooks/useUserCapacities';
import { capitalizeFirstLetter } from '@/lib/utils/stringUtils';
import BarCodeIcon from '@/public/static/images/barcode.svg';
import BarCodeLightIcon from '@/public/static/images/barcode_white.svg';
import BookIcon from '@/public/static/images/book_5.svg';
import ArrowDownIcon from '@/public/static/images/keyboard_arrow_down.svg';
import LanguageIcon from '@/public/static/images/language.svg';
import MetabaseIcon from '@/public/static/images/metabase_black.svg';
import MetabaseLightIcon from '@/public/static/images/metabase_light.svg';
import NeurologyIcon from '@/public/static/images/neurology.svg';
import { profileService } from '@/services/profileService';
import { userService } from '@/services/userService';
import { useCapacityStore, useDarkMode, useIsMobile, usePageContent } from '@/stores';
import { CapacityData } from '@/stores/types';
import { UserProfile } from '@/types/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Image, { StaticImageData } from 'next/image';
import { useRef, useState } from 'react';

const ICON_COLOR = '#032430';

function MaskedIcon({
  src,
  size,
  color = ICON_COLOR,
  rotate = 0,
}: Readonly<{
  src: StaticImageData;
  size: number;
  color?: string;
  rotate?: number;
}>) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: color,
        maskImage: `url(${src.src})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: `url(${src.src})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        transition: 'transform 200ms',
      }}
    />
  );
}

function CapacityInfoPanel({
  capacity,
  bg,
  onClose,
}: Readonly<{
  capacity: CapacityData;
  bg: string;
  onClose: () => void;
}>) {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();
  const { getDescription, getWdCode, getMetabaseCode } = useCapacityStore();
  const { data: session } = useSession();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [isAddingKnown, setIsAddingKnown] = useState(false);
  const [isAddingWanted, setIsAddingWanted] = useState(false);

  const description = getDescription(capacity.code);
  const wd_code = getWdCode(capacity.code);
  const metabase_code = getMetabaseCode(capacity.code);

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ['userProfile', session?.user?.id, session?.user?.token],
    queryFn: () =>
      userService.fetchUserProfile(Number(session?.user?.id), session?.user?.token || ''),
    enabled: !!session?.user?.token && !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { userKnownCapacities, userAvailableCapacities, userWantedCapacities } =
    useUserCapacities(userProfile);

  const isAddedToKnown =
    userKnownCapacities.includes(capacity.code) && userAvailableCapacities.includes(capacity.code);
  const isAddedToWanted = userWantedCapacities.includes(capacity.code);

  const handleAddToKnown = async () => {
    if (!session?.user?.token || !session?.user?.id) {
      showSnackbar(pageContent['login-required'] || 'Please log in to add capacities', 'error');
      return;
    }
    if (!userProfile || isAddingKnown || isAddedToKnown) return;

    setIsAddingKnown(true);
    try {
      const updatePayload: any = {
        skills_known: userKnownCapacities.includes(capacity.code)
          ? userKnownCapacities.map(c => c.toString())
          : [...userKnownCapacities, capacity.code].map(c => c.toString()),
        skills_available: userAvailableCapacities.includes(capacity.code)
          ? userAvailableCapacities.map(c => c.toString())
          : [...userAvailableCapacities, capacity.code].map(c => c.toString()),
      };
      if (userProfile.language && Array.isArray(userProfile.language)) {
        updatePayload.language = userProfile.language;
      }
      const updatedProfile: UserProfile = {
        ...userProfile,
        skills_known: updatePayload.skills_known,
        skills_available: updatePayload.skills_available,
      };
      queryClient.setQueryData(
        ['userProfile', session.user.id, session.user.token],
        updatedProfile
      );
      showSnackbar(pageContent['capacity-added-known'] || 'Capacity added to known', 'success');
      profileService
        .updateProfile(Number(session.user.id), updatePayload, {
          headers: { Authorization: `Token ${session.user.token}` },
        })
        .catch(() => {
          queryClient.invalidateQueries({
            queryKey: ['userProfile', session.user.id, session.user.token],
          });
        });
    } catch {
      showSnackbar(pageContent['error'] || 'Error adding capacity', 'error');
    } finally {
      setIsAddingKnown(false);
    }
  };

  const handleAddToWanted = async () => {
    if (!session?.user?.token || !session?.user?.id) {
      showSnackbar(pageContent['login-required'] || 'Please log in to add capacities', 'error');
      return;
    }
    if (!userProfile || isAddingWanted || isAddedToWanted) return;

    setIsAddingWanted(true);
    try {
      const updatePayload: any = {
        skills_wanted: userWantedCapacities.includes(capacity.code)
          ? userWantedCapacities.map(c => c.toString())
          : [...userWantedCapacities, capacity.code].map(c => c.toString()),
      };
      if (userProfile.language && Array.isArray(userProfile.language)) {
        updatePayload.language = userProfile.language;
      }
      const updatedProfile: UserProfile = {
        ...userProfile,
        skills_wanted: updatePayload.skills_wanted,
      };
      queryClient.setQueryData(
        ['userProfile', session.user.id, session.user.token],
        updatedProfile
      );
      showSnackbar(pageContent['capacity-added-wanted'] || 'Capacity added to wanted', 'success');
      profileService
        .updateProfile(Number(session.user.id), updatePayload, {
          headers: { Authorization: `Token ${session.user.token}` },
        })
        .catch(() => {
          queryClient.invalidateQueries({
            queryKey: ['userProfile', session.user.id, session.user.token],
          });
        });
    } catch {
      showSnackbar(pageContent['error'] || 'Error adding capacity', 'error');
    } finally {
      setIsAddingWanted(false);
    }
  };

  const isDisabledKnown =
    isAddingKnown ||
    isAddedToKnown ||
    !session?.user?.token ||
    isProfileLoading ||
    isProfileError ||
    !userProfile;
  const isDisabledWanted =
    isAddingWanted ||
    isAddedToWanted ||
    !session?.user?.token ||
    isProfileLoading ||
    isProfileError ||
    !userProfile;

  const knownButtonLabel = (() => {
    if (isAddedToKnown) {
      return pageContent['capacity-card-added-to-known'] || '✓ Added to Known';
    }
    if (isAddingKnown || isProfileLoading) {
      return pageContent['loading'] || 'Loading...';
    }
    return pageContent['capacity-card-add-to-known'] || 'Add to Known';
  })();

  const wantedButtonLabel = (() => {
    if (isAddedToWanted) {
      return pageContent['capacity-card-added-to-wanted'] || '✓ Added to Wanted';
    }
    if (isAddingWanted || isProfileLoading) {
      return pageContent['loading'] || 'Loading...';
    }
    return pageContent['capacity-card-add-to-wanted'] || 'Add to Wanted';
  })();

  return (
    <div
      className="rounded-xl shadow-md border border-black/10 p-4 flex flex-col gap-4"
      style={{ backgroundColor: bg }}
    >
      <div className="flex items-center justify-between">
        <span className="font-extrabold text-[#032430] text-lg">{capacity.name}</span>
        <button
          onClick={onClose}
          className="text-[#032430] opacity-60 hover:opacity-100 transition-opacity text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Links */}
      <div className="flex flex-row gap-4 flex-wrap">
        {metabase_code && metabase_code !== '' && (
          <a
            href={`https://metabase.wikibase.cloud/wiki/Item:${metabase_code}`}
            target="_blank"
            rel="noopener noreferrer"
            title={
              pageContent['capacity-card-visit-metabase'] ||
              'Visit the capacity item page on Metabase'
            }
          >
            <div className="flex flex-row items-center gap-2 flex-shrink-0">
              <div className="relative w-[28px] h-[28px]">
                <Image
                  src={darkMode ? MetabaseLightIcon : MetabaseIcon}
                  alt={pageContent['capacity-card-metabase-logo'] || 'Metabase logo'}
                  fill
                  priority
                />
              </div>
              <p className="text-[13px] text-capx-light-link underline break-all">
                {metabase_code}
              </p>
            </div>
          </a>
        )}
        {wd_code && wd_code !== '' && (
          <a
            href={`https://www.wikidata.org/wiki/${wd_code}`}
            target="_blank"
            rel="noopener noreferrer"
            title={
              pageContent['capacity-card-visit-wikidata'] ||
              'Visit the capacity item page on Wikidata'
            }
          >
            <div className="flex flex-row items-center gap-2 flex-shrink-0">
              <div className="relative w-[28px] h-[28px]">
                <Image
                  src={darkMode ? BarCodeLightIcon : BarCodeIcon}
                  alt={pageContent['capacity-card-barcode'] || 'BarCode'}
                  fill
                  priority
                />
              </div>
              <p className="text-[13px] text-capx-light-link underline break-all">{wd_code}</p>
            </div>
          </a>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-[#032430] text-sm break-words text-left">
          {capitalizeFirstLetter(description)}
        </p>
      )}

      {/* Add buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div
          className="rounded-[4px]"
          style={{ backgroundColor: ICON_COLOR, display: 'inline-block' }}
        >
          <BaseButton
            label={knownButtonLabel}
            customClass={`flex justify-center items-center gap-2 px-3 py-2 text-[#F6F6F6] font-extrabold rounded-[4px] text-center text-[14px] ${isAddedToKnown ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleAddToKnown}
            disabled={isDisabledKnown}
          />
        </div>
        <div
          className="rounded-[4px]"
          style={{ backgroundColor: ICON_COLOR, display: 'inline-block' }}
        >
          <BaseButton
            label={wantedButtonLabel}
            customClass={`flex justify-center items-center gap-2 px-3 py-2 text-[#F6F6F6] font-extrabold rounded-[4px] text-center text-[14px] ${isAddedToWanted ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleAddToWanted}
            disabled={isDisabledWanted}
          />
        </div>
      </div>

      <p className="text-xs text-[#032430] opacity-60 text-left leading-relaxed">
        ℹ️{' '}
        {pageContent['capacity-card-profile-info'] ||
          'This will be added to your personal profile.'}
      </p>
    </div>
  );
}

function CapacityChip({
  capacity,
  bg,
  isSelected,
  onSelect,
}: Readonly<{
  capacity: CapacityData;
  bg: string;
  isSelected: boolean;
  onSelect: () => void;
}>) {
  const isMobile = useIsMobile();

  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg border flex-shrink-0 text-left transition-shadow ${isMobile ? 'w-[200px]' : 'w-[240px]'} ${isSelected ? 'shadow-md border-black/30' : 'shadow-sm border-black/10 hover:shadow-md'}`}
      style={{ backgroundColor: bg }}
      aria-pressed={isSelected}
    >
      {capacity.icon && <MaskedIcon src={capacity.icon as unknown as StaticImageData} size={24} />}
      <span
        className="text-sm font-semibold text-[#032430] text-start truncate"
        title={capacity.name}
      >
        {capacity.name}
      </span>
    </button>
  );
}

function SplitDescription({
  text,
  firstClass,
  secondClass,
}: Readonly<{ text: string; firstClass: string; secondClass: string }>) {
  const dotIndex = text.indexOf('. ');
  if (dotIndex === -1) return <p className={firstClass}>{text}</p>;
  const first = text.slice(0, dotIndex + 1);
  const second = text.slice(dotIndex + 2);
  return (
    <div className="flex flex-col gap-1">
      <p className={firstClass}>{first}</p>
      <p className={secondClass}>{second}</p>
    </div>
  );
}

function CategoryCard({
  label,
  icon,
  bg,
  capacities,
  description,
}: Readonly<{
  label: string;
  icon: StaticImageData;
  bg: string;
  capacities: CapacityData[];
  description: string;
}>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCapacity, setSelectedCapacity] = useState<CapacityData | null>(null);
  const isMobile = useIsMobile();
  const chipsScrollRef = useRef<HTMLDivElement>(null);

  const scrollChips = (direction: 'left' | 'right') => {
    if (chipsScrollRef.current) {
      chipsScrollRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth',
      });
    }
  };

  const handleChipSelect = (capacity: CapacityData) => {
    setSelectedCapacity(prev => (prev?.code === capacity.code ? null : capacity));
  };

  const capacityInfoPanel = (
    <div className="flex flex-col gap-4 flex-1 min-w-0">
      {capacities.length === 0 ? (
        <p className="text-[#032430] text-sm py-2">No capacities found for this category.</p>
      ) : (
        <>
          {selectedCapacity && (
            <CapacityInfoPanel
              capacity={selectedCapacity}
              bg={bg}
              onClose={() => setSelectedCapacity(null)}
            />
          )}
        </>
      )}
    </div>
  );

  if (!isMobile) {
    return (
      <div className="w-full rounded-xl overflow-hidden shadow-md" style={{ backgroundColor: bg }}>
        <div className="flex flex-col px-6 py-5">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-3">
              <MaskedIcon src={icon} size={48} />
              <span className={`font-extrabold text-[${ICON_COLOR}] text-3xl`}>{label}</span>
            </div>
            <SplitDescription
              text={description}
              firstClass="text-[16px] font-[Montserrat] text-[#032430] text-start"
              secondClass="text-[13px] font-[Montserrat] text-[#032430] text-start italic"
            />
            <p className="text-[16px] font-[Montserrat] text-[#032430] text-start">
              {capacities.length} specialized {capacities.length === 1 ? 'capacity' : 'capacities'}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-4 pb-4">
            <button
              onClick={() => scrollChips('left')}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
              aria-label="Scroll left"
            >
              <MaskedIcon src={ArrowDownIcon as StaticImageData} size={20} rotate={90} />
            </button>
            <div ref={chipsScrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide">
              {capacities.map(capacity => (
                <CapacityChip
                  key={capacity.code}
                  capacity={capacity}
                  bg={bg}
                  isSelected={selectedCapacity?.code === capacity.code}
                  onSelect={() => handleChipSelect(capacity)}
                />
              ))}
            </div>
            <button
              onClick={() => scrollChips('right')}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
              aria-label="Scroll right"
            >
              <MaskedIcon src={ArrowDownIcon as StaticImageData} size={20} rotate={270} />
            </button>
          </div>
          {capacityInfoPanel}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-md">
      <button
        onClick={() => setIsExpanded(prev => !prev)}
        className="w-full flex items-center justify-between px-6 py-5 transition-opacity hover:opacity-90"
        style={{ backgroundColor: bg }}
        aria-expanded={isExpanded}
      >
        <div className="flex flex-col items-start gap-2">
          <MaskedIcon src={icon} size={32} />
          <span className={`font-extrabold text-[${ICON_COLOR}] text-xl`}>{label}</span>
        </div>
        <MaskedIcon
          src={ArrowDownIcon as StaticImageData}
          size={24}
          rotate={isExpanded ? 180 : 0}
        />
      </button>
      <div className="px-6 py-2" style={{ backgroundColor: bg }}>
        <SplitDescription
          text={description}
          firstClass="text-[12px] font-[Montserrat] text-[#032430] text-start"
          secondClass="text-[11px] font-[Montserrat] text-[#032430] text-start italic"
        />
      </div>
      <p
        className="text-[12px] font-[Montserrat] text-[#032430] text-start px-6 pb-3"
        style={{ backgroundColor: bg }}
      >
        {capacities.length} specialized {capacities.length === 1 ? 'capacity' : 'capacities'}
      </p>
      {isExpanded && (
        <div className="px-6 py-4 border-t border-black/5" style={{ backgroundColor: bg }}>
          <div className="flex gap-3 pb-4 overflow-x-auto scrollbar-hide">
            {capacities.map(capacity => (
              <CapacityChip
                key={capacity.code}
                capacity={capacity}
                bg={bg}
                isSelected={selectedCapacity?.code === capacity.code}
                onSelect={() => handleChipSelect(capacity)}
              />
            ))}
          </div>
          {capacityInfoPanel}
        </div>
      )}
    </div>
  );
}

export default function CapacityCategories() {
  const { capacities, getName, getIcon } = useCapacityStore();
  const pageContent = usePageContent();

  // Capacities curated from capx-unified-cache by thematic relevance (max 10 each)
  const THEMATIC_CATEGORIES = [
    {
      label: pageContent['capacity-category-linguistic-equity'] || 'Linguistic Equity',
      // Language and communication-related capacities
      codes: [39, 38, 116, 123, 47, 48, 46, 44, 43, 49],
      icon: LanguageIcon as StaticImageData,
      bg: '#E2E4FB',
      description:
        pageContent['capacity-category-linguistic-equity-description'],
    },
    {
      label: pageContent['capacity-category-knowledge-gaps'] || 'Knowledge gaps',
      // Advanced Wikimedia tools few users have added to their profiles
      codes: [143, 141, 140, 139, 137, 134, 142, 131, 126, 125],
      icon: NeurologyIcon as StaticImageData,
      bg: '#FBE2EE',
      description:
        pageContent['capacity-category-knowledge-gaps-description'],
    },
    {
      label: pageContent['capacity-category-open-education'] || 'Open education',
      // Education programs and core Wikimedia technology
      codes: [76, 77, 91, 84, 100, 105, 110, 113, 118, 127],
      icon: BookIcon as StaticImageData,
      bg: '#E2FBE7',
      description:
        pageContent['capacity-category-open-education-description'],
    },
  ];
  return (
    <div className="flex flex-col gap-6 w-full">
      {THEMATIC_CATEGORIES.map(({ label, codes, icon, bg, description }) => {
        const matching = codes
          .map(code => capacities[code])
          .filter(Boolean)
          .map(c => ({
            ...c,
            name: getName(c.code) || c.name,
            icon: getIcon(c.code) || c.icon,
          }));

        return (
          <CategoryCard
            key={label}
            label={label}
            icon={icon}
            bg={bg}
            description={description}
            capacities={matching}
          />
        );
      })}
    </div>
  );
}
