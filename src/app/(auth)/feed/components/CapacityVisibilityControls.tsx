'use client';

import { usePageContent, useDarkMode } from '@/stores';
import Image from 'next/image';
import TargetIcon from '@/public/static/images/target.svg';
import TargetIconWhite from '@/public/static/images/target_white.svg';
import EmojiIcon from '@/public/static/images/emoji_objects.svg';
import EmojiIconWhite from '@/public/static/images/emoji_objects_white.svg';
import NeurologyIcon from '@/public/static/images/neurology.svg';
import NeurologyIconWhite from '@/public/static/images/neurology_white.svg';

interface CapacityVisibilityControlsProps {
  showWanted: boolean;
  showAvailable: boolean;
  showKnown: boolean;
  onToggleWanted: () => void;
  onToggleAvailable: () => void;
  onToggleKnown: () => void;
}

export function CapacityVisibilityControls({
  showWanted,
  showAvailable,
  showKnown,
  onToggleWanted,
  onToggleAvailable,
  onToggleKnown,
}: CapacityVisibilityControlsProps) {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();

  return (
    <div className="w-full mb-4">
      <div className="flex flex-col md:flex-row gap-2 md:gap-3">
        <button
          onClick={onToggleWanted}
          className={`flex-1 p-3 rounded-lg border flex justify-between items-center transition-colors ${
            showWanted
              ? darkMode
                ? 'bg-capx-dark-box-bg border-orange-500'
                : 'bg-orange-100 border-orange-500'
              : darkMode
                ? 'bg-capx-dark-box-bg border-gray-700'
                : 'bg-white border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Image
              src={darkMode ? TargetIconWhite : TargetIcon}
              alt={pageContent['alt-icon-generic'] || 'Wanted capacities icon'}
              width={20}
              height={20}
            />
            <span className={darkMode ? 'text-white' : 'text-black'}>
              {pageContent['body-profile-wanted-capacities-title'] || 'Wanted capacities'}
            </span>
          </div>
          <div className="ml-auto">
            <input type="checkbox" checked={showWanted} readOnly className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={onToggleAvailable}
          className={`flex-1 p-3 rounded-lg border flex justify-between items-center transition-colors ${
            showAvailable
              ? darkMode
                ? 'bg-capx-dark-box-bg border-green-500'
                : 'bg-green-100 border-green-500'
              : darkMode
                ? 'bg-capx-dark-box-bg border-gray-700'
                : 'bg-white border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Image
              src={darkMode ? EmojiIconWhite : EmojiIcon}
              alt={pageContent['alt-icon-generic'] || 'Available capacities icon'}
              width={20}
              height={20}
            />
            <span className={darkMode ? 'text-white' : 'text-black'}>
              {pageContent['body-profile-available-capacities-title'] || 'Available capacities'}
            </span>
          </div>
          <div className="ml-auto">
            <input type="checkbox" checked={showAvailable} readOnly className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={onToggleKnown}
          className={`flex-1 p-3 rounded-lg border flex justify-between items-center transition-colors ${
            showKnown
              ? darkMode
                ? 'bg-capx-dark-box-bg border-blue-500'
                : 'bg-blue-100 border-blue-500'
              : darkMode
                ? 'bg-capx-dark-box-bg border-gray-700'
                : 'bg-white border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Image
              src={darkMode ? NeurologyIconWhite : NeurologyIcon}
              alt={pageContent['alt-icon-generic'] || 'Known capacities icon'}
              width={20}
              height={20}
            />
            <span className={darkMode ? 'text-white' : 'text-black'}>
              {pageContent['body-profile-known-capacities-title'] || 'Known capacities'}
            </span>
          </div>
          <div className="ml-auto">
            <input type="checkbox" checked={showKnown} readOnly className="h-4 w-4" />
          </div>
        </button>
      </div>
    </div>
  );
}
