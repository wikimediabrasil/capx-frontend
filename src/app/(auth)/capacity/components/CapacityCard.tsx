import BaseButton from '@/components/BaseButton';
import { TranslationContributeCTA } from '@/components/TranslationContributeCTA';
import { useIsMobile, usePageContent, useLanguage } from '@/stores';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getCapacityColor, getHueRotate } from '@/lib/utils/capacitiesUtils';
import { capitalizeFirstLetter } from '@/lib/utils/stringUtils';
import BarCodeIcon from '@/public/static/images/barcode.svg';
import BarCodeLightIcon from '@/public/static/images/barcode_white.svg';
import InfoIcon from '@/public/static/images/info.svg';
import InfoFilledIcon from '@/public/static/images/info_filled.svg';
import ArrowDownIcon from '@/public/static/images/keyboard_arrow_down.svg';
import MetabaseIcon from '@/public/static/images/metabase_black.svg';
import MetabaseLightIcon from '@/public/static/images/metabase_light.svg';
import { Capacity } from '@/types/capacity';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { profileService } from '@/services/profileService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '@/types/user';
import { useUserCapacities } from '@/hooks/useUserCapacities';
import { userService } from '@/services/userService';

interface CapacityCardProps {
  code: number;
  name: string;
  icon: string;
  color: string;
  parentCapacity?: Capacity;
  onExpand: () => void;
  isExpanded: boolean;
  hasChildren?: boolean;
  description?: string;
  wd_code?: string;
  metabase_code?: string;
  isRoot?: boolean;
  isSearch?: boolean;
  onInfoClick?: (code: number) => Promise<string | undefined>;
  level?: number;
  rootColor?: string;
  isInfoExpanded?: boolean;
  onToggleInfo?: () => void;
}

// Helper function to calculate background color
const getBackgroundColor = (level?: number, color?: string, parentCapacity?: Capacity): string => {
  if (level === 3) {
    if (parentCapacity?.parentCapacity?.color) {
      return parentCapacity.parentCapacity.color;
    }
    if (parentCapacity?.color) {
      return parentCapacity.color;
    }
    return '#507380';
  }
  if (level === 2 && color) {
    return color;
  }
  if (level === 2 && parentCapacity?.color) {
    return parentCapacity.color;
  }
  if (level === 2) {
    return '#F6F6F6';
  }
  if (color) {
    return getCapacityColor(color);
  }
  return 'white';
};

// Helper function to calculate search card background color
const getSearchCardBackgroundColor = (
  level?: number,
  color?: string,
  parentCapacity?: Capacity
): string => {
  if (level === 3 && parentCapacity?.parentCapacity?.color) {
    return parentCapacity.parentCapacity.color;
  }
  if (level === 3 && parentCapacity?.color) {
    return parentCapacity.color;
  }
  if (level === 2 && parentCapacity?.color) {
    return parentCapacity.color;
  }
  if (color) {
    return getCapacityColor(color);
  }
  return '#507380';
};

// Helper function to get button label based on state
const getButtonLabel = (
  isAdded: boolean,
  isAdding: boolean,
  isLoading: boolean,
  addedText: string,
  loadingText: string,
  defaultText: string
): string => {
  if (isAdded) return addedText;
  if (isAdding || isLoading) return loadingText;
  return defaultText;
};

// Helper function to get button disabled state
const isButtonDisabled = (
  isAdding: boolean,
  isAdded: boolean,
  hasToken: boolean,
  isLoading: boolean,
  hasError: boolean,
  hasProfile: boolean
): boolean => {
  return isAdding || isAdded || !hasToken || isLoading || hasError || !hasProfile;
};

// Helper function to get card shadow classes
const getCardShadowClass = (isInfoVisible: boolean): string => {
  return isInfoVisible ? 'shadow-md' : '';
};

// Helper function to get button shadow classes
const getButtonShadowClass = (isInfoVisible: boolean): string => {
  return isInfoVisible ? '' : 'shadow-sm hover:shadow-md';
};

// Helper function to get button border radius classes
const getButtonBorderRadius = (isMobile: boolean | undefined, isInfoVisible: boolean): string => {
  if (isMobile) {
    return isInfoVisible ? 'rounded-t-[4px]' : 'rounded-[4px]';
  }
  return isInfoVisible ? 'rounded-t-lg' : 'rounded-lg';
};

// Helper function to get card border radius classes
const getCardBorderRadius = (isMobile: boolean | undefined): string => {
  return isMobile ? 'rounded-[4px]' : 'rounded-lg';
};

// Helper function to determine button background color for expanded content
const getExpandedButtonBackgroundColor = (
  isRoot: boolean | undefined,
  level: number | undefined,
  color: string,
  parentCapacity?: Capacity
): string => {
  // For root capacities (level 1), don't try to access bgColorClass
  if (isRoot || level === 1) {
    return getCapacityColor(color || 'technology');
  }

  // For third level (level 3) capacities, try to get root color from parent hierarchy
  if (level === 3) {
    if (parentCapacity?.parentCapacity?.color) {
      return parentCapacity.parentCapacity.color;
    }
    if (parentCapacity?.color) {
      return parentCapacity.color;
    }
    return '#507380';
  }

  // For second level capacities (direct children of root)
  if (level === 2 && parentCapacity?.color && parentCapacity.color !== '') {
    return getCapacityColor(parentCapacity.color);
  }

  // If we have our own color
  if (color && color !== '') {
    return getCapacityColor(color);
  }

  // Fallback
  return '#507380';
};

// Helper function to get text styling classes
const getTextClasses = (isRoot?: boolean, isMobile?: boolean, displayNameLength?: number) => {
  let textBreakClass;
  if (isRoot) {
    textBreakClass = 'break-words hyphens-auto capacity-name';
  } else if (isMobile) {
    textBreakClass = 'break-words hyphens-auto capacity-name-mobile';
  } else {
    textBreakClass = 'truncate';
  }

  let textSizeClass;
  if (isMobile) {
    if (displayNameLength && displayNameLength > 40) {
      textSizeClass = 'text-[14px]';
    } else if (displayNameLength && displayNameLength > 25) {
      textSizeClass = 'text-[16px]';
    } else {
      textSizeClass = 'text-[20px]';
    }
  } else {
    textSizeClass = 'text-[36px]';
  }

  return `font-extrabold hover:underline text-left ${textBreakClass} ${textSizeClass}`;
};

// Helper function to get text styles
const getTextStyles = (
  isRoot?: boolean,
  isMobile?: boolean,
  displayName?: string
): React.CSSProperties => {
  if (isRoot) {
    return { wordBreak: 'break-word', hyphens: 'auto' as const };
  }
  if (isMobile && displayName && displayName.length >= 8) {
    return { wordBreak: 'break-word', hyphens: 'auto' as const };
  }
  return {};
};

// Helper function to render icon with appropriate size
const renderIconByType = (
  icon: string,
  renderIcon: (size: number, iconSrc: string) => React.ReactNode,
  isRoot?: boolean,
  isMobile?: boolean,
  parentCapacity?: Capacity
) => {
  if (icon && isRoot) {
    return isMobile ? renderIcon(32, icon) : renderIcon(48, icon);
  }
  return isMobile ? renderIcon(32, icon) : renderIcon(68, icon);
};

export function CapacityCard({
  code,
  name,
  icon,
  color,
  parentCapacity,
  onExpand,
  isExpanded,
  hasChildren,
  description,
  wd_code,
  metabase_code,
  isRoot,
  isSearch,
  onInfoClick,
  level,
  rootColor,
  isInfoExpanded,
  onToggleInfo,
}: CapacityCardProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const pageContent = usePageContent();
  const language = useLanguage();
  const { darkMode } = useTheme();
  const { isFallbackTranslation } = useCapacityCache();
  const [showInfo, setShowInfo] = useState(false);
  const { data: session } = useSession();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [isAddingKnown, setIsAddingKnown] = useState(false);
  const [isAddingWanted, setIsAddingWanted] = useState(false);

  // Fetch user profile - will use cache if available, fetch if not
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ['userProfile', session?.user?.id, session?.user?.token],
    queryFn: () =>
      userService.fetchUserProfile(Number(session?.user?.id), session?.user?.token || ''),
    enabled: !!session?.user?.token && !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get user capacities using custom hook
  const { userKnownCapacities, userAvailableCapacities, userWantedCapacities } =
    useUserCapacities(userProfile);

  // Check if this capacity is using fallback translation
  const isUsingFallback = isFallbackTranslation(code);

  // Use external control when available (main capacity view), internal for search
  const isInfoVisible = isInfoExpanded !== undefined ? isInfoExpanded : showInfo;
  const handleInfoToggle = onToggleInfo || (() => setShowInfo(!showInfo));
  const childrenContainerRef = useRef<HTMLDivElement>(null);

  // Use the hasChildren prop directly since unified cache handles this logic
  const hasChildrenFromCache = hasChildren;

  // Ensures that names that look like QIDs are replaced
  const displayName = useMemo(() => {
    // Checks if the name looks like a QID (common format with Q followed by numbers)
    if (!name || (name.startsWith('Q') && /^Q\d+$/.test(name))) {
      return `${pageContent['capacity-card-capacity-prefix'] || 'Capacity'} ${code}`;
    }
    return name;
  }, [name, code]);

  const handleInfoClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click event from propagating to the card

    if (!isInfoVisible && onInfoClick) {
      await onInfoClick(code);
    }
    handleInfoToggle();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent default behavior to avoid navigation
    e.preventDefault();
    // Only expand/collapse the card
    onExpand();
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onExpand();
    }
  };

  // Check if capacity is already added
  const isAddedToKnown = useMemo(
    () => userKnownCapacities.includes(code) && userAvailableCapacities.includes(code),
    [userKnownCapacities, userAvailableCapacities, code]
  );

  const isAddedToWanted = useMemo(
    () => userWantedCapacities.includes(code),
    [userWantedCapacities, code]
  );

  // Handler to add capacity to known list
  const handleAddToKnown = async () => {
    // Check if user is not logged in
    if (!session?.user?.token || !session?.user?.id) {
      showSnackbar(pageContent['login-required'] || 'Please log in to add capacities', 'error');
      return;
    }

    // Check if no user profile (should not happen if button is properly disabled)
    if (!userProfile) {
      return;
    }

    // Check if already adding or already added
    if (isAddingKnown || isAddedToKnown) {
      return;
    }

    setIsAddingKnown(true);
    try {
      const currentKnown = userKnownCapacities;
      const currentAvailable = userAvailableCapacities;

      const updatePayload: any = {
        skills_known: currentKnown.includes(code)
          ? currentKnown.map(c => c.toString())
          : [...currentKnown, code].map(c => c.toString()),
        skills_available: currentAvailable.includes(code)
          ? currentAvailable.map(c => c.toString())
          : [...currentAvailable, code].map(c => c.toString()),
      };

      // Include language field if it exists (required by backend)
      if (userProfile.language && Array.isArray(userProfile.language)) {
        updatePayload.language = userProfile.language;
      }

      // Optimistically update cache
      const updatedProfile: UserProfile = {
        ...userProfile,
        skills_known: updatePayload.skills_known,
        skills_available: updatePayload.skills_available,
      };

      queryClient.setQueryData(
        ['userProfile', session.user.id, session.user.token],
        updatedProfile
      );

      // Show success immediately (optimistic UI)
      showSnackbar(pageContent['capacity-added-known'] || 'Capacity added to known', 'success');

      // Update on server (non-blocking)
      profileService
        .updateProfile(Number(session.user.id), updatePayload, {
          headers: {
            Authorization: `Token ${session.user.token}`,
          },
        })
        .catch(error => {
          console.error('Error updating profile on server:', error);
          // Optionally revert the optimistic update on error
          queryClient.invalidateQueries({
            queryKey: ['userProfile', session.user.id, session.user.token],
          });
        });
    } catch (error: any) {
      console.error('Error adding capacity to known:', error);
      showSnackbar(pageContent['error'] || 'Error adding capacity', 'error');
    } finally {
      setIsAddingKnown(false);
    }
  };

  // Handler to add capacity to wanted list
  const handleAddToWanted = async () => {
    // Check if user is not logged in
    if (!session?.user?.token || !session?.user?.id) {
      showSnackbar(pageContent['login-required'] || 'Please log in to add capacities', 'error');
      return;
    }

    // Check if no user profile (should not happen if button is properly disabled)
    if (!userProfile) {
      return;
    }

    // Check if already adding or already added
    if (isAddingWanted || isAddedToWanted) {
      return;
    }

    setIsAddingWanted(true);
    try {
      const currentWanted = userWantedCapacities;

      const updatePayload: any = {
        skills_wanted: currentWanted.includes(code)
          ? currentWanted.map(c => c.toString())
          : [...currentWanted, code].map(c => c.toString()),
      };

      // Include language field if it exists (required by backend)
      if (userProfile.language && Array.isArray(userProfile.language)) {
        updatePayload.language = userProfile.language;
      }

      // Optimistically update cache
      const updatedProfile: UserProfile = {
        ...userProfile,
        skills_wanted: updatePayload.skills_wanted,
      };

      queryClient.setQueryData(
        ['userProfile', session.user.id, session.user.token],
        updatedProfile
      );

      // Show success immediately (optimistic UI)
      showSnackbar(pageContent['capacity-added-wanted'] || 'Capacity added to wanted', 'success');

      // Update on server (non-blocking)
      profileService
        .updateProfile(Number(session.user.id), updatePayload, {
          headers: {
            Authorization: `Token ${session.user.token}`,
          },
        })
        .catch(error => {
          console.error('Error updating profile on server:', error);
          // Optionally revert the optimistic update on error
          queryClient.invalidateQueries({
            queryKey: ['userProfile', session.user.id, session.user.token],
          });
        });
    } catch (error: any) {
      console.error('Error adding capacity to wanted:', error);
      showSnackbar(pageContent['error'] || 'Error adding capacity', 'error');
    } finally {
      setIsAddingWanted(false);
    }
  };

  const renderExpandedContent = () => {
    if (!isInfoVisible) return null;

    const buttonBgColor = getExpandedButtonBackgroundColor(isRoot, level, color, parentCapacity);

    return (
      <div
        className={`flex flex-col gap-6 mt-6 mb-16 ${isRoot ? 'px-1 sm:px-3' : 'px-1 sm:px-2'} ${isRoot || isMobile ? 'w-full' : 'max-w-md'}`}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        <div
          className={`flex flex-row text-start gap-2 sm:gap-6 overflow-hidden ${isRoot || isMobile ? 'w-full' : 'max-w-md'}`}
        >
          {metabase_code && metabase_code !== '' && (
            <a
              href={`https://metabase.wikibase.cloud/wiki/Item:${metabase_code}`}
              onClick={e => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              title={
                pageContent['capacity-card-visit-metabase'] ||
                'Visit the capacity item page on Metabase'
              }
            >
              <div className="flex flex-row items-center gap-2 flex-shrink-0">
                <div className="relative w-[36px] h-[36px]">
                  <Image
                    src={darkMode ? MetabaseLightIcon : MetabaseIcon}
                    alt={pageContent['capacity-card-metabase-logo'] || 'Metabase logo'}
                    fill
                    priority
                  />
                </div>
                <p
                  className={`text-[14px] ${darkMode ? 'text-blue-400' : 'text-capx-light-link'} underline break-all`}
                >
                  {metabase_code}
                </p>
              </div>
            </a>
          )}
          {wd_code && wd_code !== '' && (
            <a
              href={`https://www.wikidata.org/wiki/${wd_code}`}
              onClick={e => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              title={
                pageContent['capacity-card-visit-wikidata'] ||
                'Visit the capacity item page on Wikidata'
              }
            >
              <div className="flex flex-row items-center gap-2 flex-shrink-0">
                <div className="relative w-[36px] h-[36px]">
                  <Image
                    src={darkMode ? BarCodeLightIcon : BarCodeIcon}
                    alt={pageContent['capacity-card-barcode'] || 'BarCode'}
                    fill
                    priority
                  />
                </div>
                <p
                  className={`text-[14px] ${darkMode ? 'text-blue-400' : 'text-capx-light-link'} underline break-all`}
                >
                  {wd_code}
                </p>
              </div>
            </a>
          )}
        </div>
        {description && (
          <p
            className={`${darkMode ? 'text-gray-200' : 'text-capx-dark-box-bg'} break-words text-left ${isMobile ? 'text-[16px]' : 'text-[20px]'}`}
          >
            {capitalizeFirstLetter(description)}
          </p>
        )}

        {/* Translation Contribution CTA */}
        {isUsingFallback && (
          <TranslationContributeCTA
            capacityCode={code}
            metabaseCode={metabase_code}
            compact={isMobile}
          />
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-fit">
          <div
            className="rounded-lg w-full sm:w-fit"
            style={{
              backgroundColor: buttonBgColor,
              display: 'inline-block',
            }}
          >
            <BaseButton
              label={getButtonLabel(
                isAddedToKnown,
                isAddingKnown,
                isProfileLoading,
                pageContent['capacity-card-added-to-known'] || '✓ Added to Known',
                pageContent['loading'] || 'Loading...',
                pageContent['capacity-card-add-to-known'] || 'Add to Known'
              )}
              customClass={`flex justify-center items-center gap-2 px-3 py-3 text-[#F6F6F6] font-extrabold rounded-[4px] text-center not-italic leading-[normal] ${
                isMobile ? 'text-[16px]' : 'text-[24px]'
              } ${isAddedToKnown ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleAddToKnown}
              disabled={isButtonDisabled(
                isAddingKnown,
                isAddedToKnown,
                Boolean(session?.user?.token),
                isProfileLoading,
                isProfileError,
                Boolean(userProfile)
              )}
            />
          </div>
          <div
            className="rounded-lg w-full sm:w-fit"
            style={{
              backgroundColor: buttonBgColor,
              display: 'inline-block',
            }}
          >
            <BaseButton
              label={getButtonLabel(
                isAddedToWanted,
                isAddingWanted,
                isProfileLoading,
                pageContent['capacity-card-added-to-wanted'] || '✓ Added to Wanted',
                pageContent['loading'] || 'Loading...',
                pageContent['capacity-card-add-to-wanted'] || 'Add to Wanted'
              )}
              customClass={`flex justify-center items-center gap-2 px-3 py-3 text-[#F6F6F6] font-extrabold rounded-[4px] text-center not-italic leading-[normal] ${
                isMobile ? 'text-[16px]' : 'text-[24px]'
              } ${isAddedToWanted ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleAddToWanted}
              disabled={isButtonDisabled(
                isAddingWanted,
                isAddedToWanted,
                Boolean(session?.user?.token),
                isProfileLoading,
                isProfileError,
                Boolean(userProfile)
              )}
            />
          </div>
        </div>

        {/* Informational tooltip */}
        <div className={`mt-4 pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          <p
            className={`text-xs ${isMobile ? 'text-[12px]' : 'text-[14px]'} ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            } text-left leading-relaxed`}
          >
            ℹ️{' '}
            {pageContent['capacity-card-profile-info'] ||
              'This will be added to your personal profile.'}{' '}
            {pageContent['capacity-card-org-profile-info'] ||
              'To add capacities to an organization profile, please visit the organization profile edit page.'}
          </p>
        </div>
      </div>
    );
  };

  // Function to determine the color of the capacity name text
  const getNameColor = (
    isRoot: boolean | undefined,
    parentCapacity?: Capacity,
    color?: string
  ): string => {
    // Explicit level check first
    if (level === 3) {
      return '#FFFFFF'; // White text for level 3
    }

    // If it's a root item, always use white
    if (isRoot) return '#FFFFFF';

    // For third level capacities, use white text
    if (
      parentCapacity?.parentCapacity ||
      (parentCapacity && parentCapacity.skill_type !== parentCapacity.code)
    ) {
      return '#FFFFFF'; // White text for level 3
    }

    // For second level with colored background, use white text for contrast
    if (level === 2) {
      return '#FFFFFF'; // White text on colored background
    }

    // For level 1 with colored background (root cards in search), use white text
    if (level === 1 && color) {
      return '#FFFFFF'; // White text on colored background
    }

    // If it has a parent, use the parent's color
    if (parentCapacity?.color) {
      return getCapacityColor(parentCapacity.color);
    }

    // Fallback to the passed color
    if (color) {
      return getCapacityColor(color);
    }

    // Default for child capacities without specified color
    return '#4B5563'; // Medium gray
  };

  // Simplified function to determine the correct filter for icons
  const getIconFilter = (isRoot: boolean | undefined, parentCapacity?: Capacity): string => {
    // Explicit level check first
    if (level === 3) {
      return 'brightness(0) invert(1)'; // White icons for level 3
    }

    // If it's root, apply filter to make icon white
    if (isRoot) return 'brightness(0) invert(1)';

    // For third level capacities, make icons white as well (even if root)
    if (
      parentCapacity?.parentCapacity ||
      (parentCapacity && parentCapacity.skill_type !== parentCapacity.code)
    ) {
      return 'brightness(0) invert(1)'; // White icons for level 3
    }

    // For second level with colored background, use white icons for contrast
    if (level === 2) {
      return 'brightness(0) invert(1)'; // White icons on colored background
    }

    // For level 1 with colored background (root cards in search), use white icons
    if (level === 1 && color) {
      return 'brightness(0) invert(1)'; // White icons on colored background
    }

    // If it has a parent, use the parent's color
    if (parentCapacity?.color) {
      return getHueRotate(parentCapacity.color);
    }

    // Fallback to the passed color
    if (color) {
      return getHueRotate(color);
    }

    // Otherwise, use the default icon color
    return 'brightness(0)'; // This will make the icon black
  };

  type IconSource = string | StaticImageData;
  const renderIcon = (size: number, iconSrc: IconSource) => {
    if (!iconSrc) return null;

    return (
      <div style={{ width: `${size}px`, height: `${size}px` }} className="relative">
        <Image
          src={typeof iconSrc === 'string' ? iconSrc : iconSrc.src}
          alt={name}
          fill
          priority
          style={{
            filter: getIconFilter(isRoot, parentCapacity),
          }}
        />
      </div>
    );
  };

  const renderInfoButton = (size: number, icon: string) => {
    // For grandchild capacities, use the grandparent's color (if it has a parent)
    const filterStyle = getIconFilter(isRoot, parentCapacity);

    return (
      <button
        type="button"
        onClick={handleInfoClick}
        className={`p-1 flex-shrink-0 ${isSearch ? 'mr-12' : ''} opacity-100 z-10 cursor-pointer bg-transparent border-none`}
        aria-label={pageContent['capacity-card-info'] || 'Information'}
        style={{ visibility: 'visible' }}
      >
        <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
          <Image
            src={isInfoVisible ? InfoFilledIcon : icon}
            alt={name}
            fill
            priority
            style={{
              filter: filterStyle,
              opacity: 1,
            }}
          />
        </div>
      </button>
    );
  };

  const renderArrowButton = (size: number, icon: string) => {
    // For grandchild capacities, use the grandparent's color
    const filterStyle = getIconFilter(isRoot, parentCapacity);

    return (
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onExpand();
        }}
        className="p-2 flex-shrink-0 opacity-100 cursor-pointer bg-transparent border-none"
        aria-label={pageContent['capacity-card-expand-capacity'] || 'Expand capacity'}
      >
        <div
          style={{ width: `${size}px`, height: `${size}px` }}
          className={`relative transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <Image
            src={icon}
            alt={pageContent['capacity-card-expand-capacity'] || 'Expand capacity'}
            fill
            priority
            style={{
              filter: filterStyle,
              opacity: 1,
            }}
          />
        </div>
      </button>
    );
  };

  // Calculate background color
  const backgroundColor = getBackgroundColor(level, color, parentCapacity);

  if (isSearch) {
    return (
      <SearchCard
        code={code}
        name={name}
        icon={icon}
        color={color}
        level={level}
        parentCapacity={parentCapacity}
        isMobile={isMobile}
        darkMode={darkMode}
        isInfoVisible={isInfoVisible}
        handleCardClick={handleCardClick}
        handleCardKeyDown={handleCardKeyDown}
        renderIcon={renderIcon}
        renderInfoButton={renderInfoButton}
        renderExpandedContent={renderExpandedContent}
      />
    );
  }

  if (isRoot) {
    return (
      <RootCard
        code={code}
        name={name}
        icon={icon}
        color={color}
        isMobile={isMobile}
        darkMode={darkMode}
        language={language}
        isInfoVisible={isInfoVisible}
        isExpanded={isExpanded}
        hasChildrenFromCache={hasChildrenFromCache}
        handleCardClick={handleCardClick}
        handleCardKeyDown={handleCardKeyDown}
        renderIcon={renderIcon}
        renderInfoButton={renderInfoButton}
        renderArrowButton={renderArrowButton}
        renderExpandedContent={renderExpandedContent}
        childrenContainerRef={childrenContainerRef}
      />
    );
  }

  // Child capacity card (non-root)
  return (
    <ChildCard
      code={code}
      displayName={displayName}
      backgroundColor={backgroundColor}
      isRoot={isRoot}
      isMobile={isMobile}
      darkMode={darkMode}
      language={language}
      isInfoVisible={isInfoVisible}
      hasChildrenFromCache={hasChildrenFromCache}
      parentCapacity={parentCapacity}
      color={color}
      handleCardClick={handleCardClick}
      handleCardKeyDown={handleCardKeyDown}
      renderIcon={renderIcon}
      renderInfoButton={renderInfoButton}
      renderArrowButton={renderArrowButton}
      renderExpandedContent={renderExpandedContent}
      getNameColor={getNameColor}
      icon={icon}
    />
  );
}

// Search Card Component
interface SearchCardProps {
  code: number;
  name: string;
  icon: string;
  color: string;
  level?: number;
  parentCapacity?: Capacity;
  isMobile?: boolean;
  darkMode: boolean;
  isInfoVisible: boolean;
  handleCardClick: (e: React.MouseEvent) => void;
  handleCardKeyDown: (e: React.KeyboardEvent) => void;
  renderIcon: (size: number, iconSrc: string) => React.ReactNode;
  renderInfoButton: (size: number, icon: string) => React.ReactNode;
  renderExpandedContent: () => React.ReactNode;
}

const SearchCard: React.FC<SearchCardProps> = ({
  code,
  name,
  icon,
  color,
  level,
  parentCapacity,
  isMobile,
  darkMode,
  isInfoVisible,
  handleCardClick,
  handleCardKeyDown,
  renderIcon,
  renderInfoButton,
  renderExpandedContent,
}) => {
  const backgroundColor = getSearchCardBackgroundColor(level, color, parentCapacity);
  const cardShadow = getCardShadowClass(isInfoVisible);
  const cardRadius = getCardBorderRadius(isMobile);
  const buttonShadow = getButtonShadowClass(isInfoVisible);
  const buttonRadius = getButtonBorderRadius(isMobile, isInfoVisible);

  return (
    <div className={`w-full ${cardShadow} ${cardRadius}`}>
      <button
        onClick={handleCardClick}
        className={`flex flex-col w-full ${buttonShadow} transition-shadow ${buttonRadius} cursor-pointer hover:brightness-95 transition-all`}
        style={{ backgroundColor }}
        tabIndex={0}
        onKeyDown={handleCardKeyDown}
      >
        <div
          className={`flex p-4 ${
            isMobile
              ? 'h-[191px] flex-col mt-12 mx-0 gap-6 md:mx-6'
              : 'flex-row h-[326px] justify-around items-center'
          }`}
        >
          {icon && isMobile ? renderIcon(32, icon) : renderIcon(85, icon)}

          <div className={`flex items-center flex-row ${isMobile ? 'gap-4' : 'gap-16'}`}>
            <div className={`flex items-start ${isMobile ? 'flex-1 min-w-0' : 'w-[378px]'} h-full`}>
              <Link href={`/feed?capacityId=${code}`}>
                <h3
                  className={`font-extrabold text-white hover:underline truncate text-left ${
                    isMobile ? 'text-[20px]' : 'text-[48px]'
                  }`}
                >
                  {capitalizeFirstLetter(name)}
                </h3>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {isMobile ? renderInfoButton(24, InfoIcon) : renderInfoButton(68, InfoIcon)}
            </div>
          </div>
        </div>
      </button>

      {isInfoVisible && (
        <div
          className={`${darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'} rounded-b-lg ${isMobile ? 'p-2 sm:p-4' : 'p-8'} w-full overflow-hidden`}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
        >
          {renderExpandedContent()}
        </div>
      )}
    </div>
  );
};

// Root Card Component
interface RootCardProps {
  code: number;
  name: string;
  icon: string;
  color: string;
  isMobile?: boolean;
  darkMode: boolean;
  language?: string;
  isInfoVisible: boolean;
  isExpanded: boolean;
  hasChildrenFromCache?: boolean;
  handleCardClick: (e: React.MouseEvent) => void;
  handleCardKeyDown: (e: React.KeyboardEvent) => void;
  renderIcon: (size: number, iconSrc: string) => React.ReactNode;
  renderInfoButton: (size: number, icon: string) => React.ReactNode;
  renderArrowButton: (size: number, icon: string) => React.ReactNode;
  renderExpandedContent: () => React.ReactNode;
  childrenContainerRef: React.RefObject<HTMLDivElement>;
}

const RootCard: React.FC<RootCardProps> = ({
  code,
  name,
  icon,
  color,
  isMobile,
  darkMode,
  language,
  isInfoVisible,
  isExpanded,
  hasChildrenFromCache,
  handleCardClick,
  handleCardKeyDown,
  renderIcon,
  renderInfoButton,
  renderArrowButton,
  renderExpandedContent,
  childrenContainerRef,
}) => {
  const cardShadow = getCardShadowClass(isInfoVisible);
  const cardRadius = getCardBorderRadius(isMobile);
  const buttonShadow = getButtonShadowClass(isInfoVisible);
  const buttonRadius = getButtonBorderRadius(isMobile, isInfoVisible);

  return (
    <div className={`w-full ${cardShadow} ${cardRadius}`}>
      <button
        onClick={handleCardClick}
        className={`flex flex-col w-full ${buttonShadow} transition-shadow ${buttonRadius} cursor-pointer hover:brightness-95 transition-all`}
        style={{ backgroundColor: getCapacityColor(color) }}
        tabIndex={0}
        onKeyDown={handleCardKeyDown}
      >
        <div
          className={`flex p-4 ${
            isMobile
              ? 'h-[191px] flex-row items-center mx-0 gap-3 md:mx-6'
              : 'flex-row h-[326px] justify-around items-center'
          }`}
        >
          {icon && isMobile ? renderIcon(32, icon) : renderIcon(85, icon)}

          <div
            className={`flex items-center flex-row ${isMobile ? 'gap-2 flex-1 min-w-0' : 'gap-16'}`}
          >
            <div
              className={`flex items-start ${isMobile ? 'flex-1 min-w-0 pl-2' : 'w-[378px] pl-8'} h-full`}
            >
              <Link href={`/feed?capacityId=${code}`}>
                <h3
                  className={`font-extrabold text-white hover:underline break-words hyphens-auto capacity-name text-left ${
                    isMobile ? 'text-[20px]' : 'text-[48px]'
                  }`}
                  style={{ wordBreak: 'break-word', hyphens: 'auto' }}
                  lang={language || 'en'}
                >
                  {capitalizeFirstLetter(name)}
                </h3>
              </Link>
            </div>

            <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-4'}`}>
              {isMobile ? (
                <>
                  {renderInfoButton(20, InfoIcon)}
                  {hasChildrenFromCache && renderArrowButton(20, ArrowDownIcon)}
                </>
              ) : (
                <>
                  {renderInfoButton(68, InfoIcon)}
                  {hasChildrenFromCache && renderArrowButton(68, ArrowDownIcon)}
                </>
              )}
            </div>
          </div>
        </div>
      </button>

      {isInfoVisible && (
        <div
          className={`${darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'} rounded-b-lg ${isMobile ? 'p-2 sm:p-4' : 'p-8'} w-full overflow-hidden`}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
        >
          {renderExpandedContent()}
        </div>
      )}

      {isExpanded && (
        <div ref={childrenContainerRef} className={`mt-4 w-full overflow-x-auto scrollbar-hide`}>
          <div
            className={`flex flex-nowrap ${isMobile ? 'gap-2' : 'gap-4'} pb-4 ${isMobile ? 'w-full' : ''}`}
          >
            {/* the expanded content will be rendered here by the parent component */}
          </div>
        </div>
      )}
    </div>
  );
};

// Child Card Component
interface ChildCardProps {
  code: number;
  displayName: string;
  backgroundColor: string;
  isRoot?: boolean;
  isMobile?: boolean;
  darkMode: boolean;
  language?: string;
  isInfoVisible: boolean;
  hasChildrenFromCache?: boolean;
  parentCapacity?: Capacity;
  color: string;
  icon: string;
  handleCardClick: (e: React.MouseEvent) => void;
  handleCardKeyDown: (e: React.KeyboardEvent) => void;
  renderIcon: (size: number, iconSrc: string) => React.ReactNode;
  renderInfoButton: (size: number, icon: string) => React.ReactNode;
  renderArrowButton: (size: number, icon: string) => React.ReactNode;
  renderExpandedContent: () => React.ReactNode;
  getNameColor: (isRoot?: boolean, parentCapacity?: Capacity, color?: string) => string;
}

const ChildCard: React.FC<ChildCardProps> = ({
  code,
  displayName,
  backgroundColor,
  isRoot,
  isMobile,
  darkMode,
  language,
  isInfoVisible,
  hasChildrenFromCache,
  parentCapacity,
  color,
  icon,
  handleCardClick,
  handleCardKeyDown,
  renderIcon,
  renderInfoButton,
  renderArrowButton,
  renderExpandedContent,
  getNameColor,
}) => {
  return (
    <div className="w-full">
      <button
        onClick={handleCardClick}
        className={`flex flex-col w-full rounded-lg cursor-pointer hover:shadow-md transition-shadow overflow-hidden`}
        style={{ backgroundColor }}
        tabIndex={0}
      >
        <div
          className={`flex flex-row items-center w-full h-[144px] py-4 justify-between gap-4 px-4`}
        >
          <div className={`flex items-center ${isRoot ? 'gap-12' : 'gap-4'} min-w-0`}>
            {renderIconByType(icon, renderIcon, isRoot, isMobile, parentCapacity)}
            <div
              className={`flex flex-row items-start justify-between ${
                isRoot && !isMobile ? 'w-max' : ''
              } min-w-0 flex-1`}
            >
              <Link href={`/feed?capacityId=${code}`} className="w-full min-w-0">
                <h3
                  className={getTextClasses(isRoot, isMobile, displayName.length)}
                  style={{
                    color: getNameColor(isRoot, parentCapacity, color),
                    ...getTextStyles(isRoot, isMobile, displayName),
                  }}
                  title={capitalizeFirstLetter(displayName)}
                  lang={
                    isRoot || (isMobile && displayName && displayName.length >= 8)
                      ? language || 'en'
                      : undefined
                  }
                >
                  {capitalizeFirstLetter(displayName)}
                </h3>
              </Link>
            </div>
          </div>
          <div
            className={`flex items-center gap-4 ${isMobile ? 'mr-2' : 'mr-4'} z-10 flex-shrink-0`}
          >
            <div className="relative" style={{ zIndex: 10, visibility: 'visible' }}>
              {isRoot || isMobile ? renderInfoButton(24, InfoIcon) : renderInfoButton(40, InfoIcon)}
            </div>

            {hasChildrenFromCache && (
              <div className="relative" style={{ zIndex: 10, visibility: 'visible' }}>
                {isRoot || isMobile
                  ? renderArrowButton(24, ArrowDownIcon)
                  : renderArrowButton(40, ArrowDownIcon)}
              </div>
            )}
          </div>
        </div>
      </button>

      {isInfoVisible && (
        <div
          className={`${darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'} rounded-b-lg ${isMobile ? 'p-2 sm:p-4' : 'p-8'} w-full overflow-hidden`}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
        >
          {renderExpandedContent()}
        </div>
      )}
    </div>
  );
};
