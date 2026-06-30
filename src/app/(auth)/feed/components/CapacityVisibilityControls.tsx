'use client';

import { usePageContent, useDarkMode } from '@/stores';
import Image from 'next/image';
import TargetIcon from '@/public/static/images/target.svg';
import TargetIconWhite from '@/public/static/images/target_white.svg';
import EmojiIcon from '@/public/static/images/emoji_objects.svg';
import EmojiIconWhite from '@/public/static/images/emoji_objects_white.svg';
import NeurologyIcon from '@/public/static/images/neurology.svg';
import NeurologyIconWhite from '@/public/static/images/neurology_white.svg';
import AccountCircleIcon from '@/public/static/images/account_circle.svg';
import AccountCircleIconWhite from '@/public/static/images/account_circle_white.svg';

interface CapacityVisibilityControlsProps {
  showWanted: boolean;
  showAvailable: boolean;
  showKnown: boolean;
  includeIncompleteProfiles: boolean;
  onToggleWanted: () => void;
  onToggleAvailable: () => void;
  onToggleKnown: () => void;
  onToggleIncludeIncompleteProfiles: () => void;
}

interface VisibilityToggleProps {
  active: boolean;
  activeDarkClass: string;
  activeLightClass: string;
  iconLight: any;
  iconDark: any;
  alt: string;
  label: string;
  darkMode: boolean;
  onClick: () => void;
  labelClassName?: string;
  checkboxWrapperClassName?: string;
}

function VisibilityToggle({
  active,
  activeDarkClass,
  activeLightClass,
  iconLight,
  iconDark,
  alt,
  label,
  darkMode,
  onClick,
  labelClassName = '',
  checkboxWrapperClassName = 'ml-auto',
}: VisibilityToggleProps) {
  let stateClass: string;
  if (active) {
    stateClass = darkMode ? activeDarkClass : activeLightClass;
  } else {
    stateClass = darkMode ? 'bg-capx-dark-box-bg border-gray-700' : 'bg-white border-gray-300';
  }

  return (
    <button
      onClick={onClick}
      className={`flex-1 p-3 rounded-lg border flex justify-between items-center transition-colors ${stateClass}`}
    >
      <div className="flex items-center gap-2">
        <Image src={darkMode ? iconDark : iconLight} alt={alt} width={20} height={20} />
        <span className={`${labelClassName} ${darkMode ? 'text-white' : 'text-black'}`.trim()}>
          {label}
        </span>
      </div>
      <div className={checkboxWrapperClassName}>
        <input type="checkbox" checked={active} readOnly className="h-4 w-4" />
      </div>
    </button>
  );
}

export function CapacityVisibilityControls({
  showWanted,
  showAvailable,
  showKnown,
  includeIncompleteProfiles,
  onToggleWanted,
  onToggleAvailable,
  onToggleKnown,
  onToggleIncludeIncompleteProfiles,
}: CapacityVisibilityControlsProps) {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();

  return (
    <div className="w-full mb-4">
      <div className="flex flex-col md:flex-row gap-2 md:gap-3">
        <VisibilityToggle
          active={showWanted}
          onClick={onToggleWanted}
          activeDarkClass="bg-capx-dark-box-bg border-orange-500"
          activeLightClass="bg-orange-100 border-orange-500"
          iconLight={TargetIcon}
          iconDark={TargetIconWhite}
          alt={pageContent['alt-icon-generic'] || 'Wanted capacities icon'}
          label={pageContent['body-profile-wanted-capacities-title'] || 'Wanted capacities'}
          darkMode={darkMode}
        />

        <VisibilityToggle
          active={showAvailable}
          onClick={onToggleAvailable}
          activeDarkClass="bg-capx-dark-box-bg border-green-500"
          activeLightClass="bg-green-100 border-green-500"
          iconLight={EmojiIcon}
          iconDark={EmojiIconWhite}
          alt={pageContent['alt-icon-generic'] || 'Available capacities icon'}
          label={pageContent['body-profile-available-capacities-title'] || 'Available capacities'}
          darkMode={darkMode}
        />

        <VisibilityToggle
          active={showKnown}
          onClick={onToggleKnown}
          activeDarkClass="bg-capx-dark-box-bg border-blue-500"
          activeLightClass="bg-blue-100 border-blue-500"
          iconLight={NeurologyIcon}
          iconDark={NeurologyIconWhite}
          alt={pageContent['alt-icon-generic'] || 'Known capacities icon'}
          label={pageContent['body-profile-known-capacities-title'] || 'Known capacities'}
          darkMode={darkMode}
        />

        <VisibilityToggle
          active={includeIncompleteProfiles}
          onClick={onToggleIncludeIncompleteProfiles}
          activeDarkClass="bg-capx-dark-box-bg border-orange-500"
          activeLightClass="bg-orange-50 border-orange-500"
          iconLight={AccountCircleIcon}
          iconDark={AccountCircleIconWhite}
          alt={pageContent['alt-icon-generic'] || 'Incomplete profiles icon'}
          label={pageContent['feed-toggle-incomplete-profiles'] || 'Incomplete profiles'}
          darkMode={darkMode}
          labelClassName="text-left"
          checkboxWrapperClassName="ml-auto shrink-0"
        />
      </div>
    </div>
  );
}
