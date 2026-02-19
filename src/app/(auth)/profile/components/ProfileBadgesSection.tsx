'use client';

import BadgesCarousel from '@/components/BadgesCarousel';
import ProfileFieldSection from './ProfileFieldSection';
import BadgesIcon from '@/public/static/images/icons/badges_icon.svg';
import BadgesIconWhite from '@/public/static/images/icons/badges_icon_white.svg';
import { useDarkMode, useIsMobile, usePageContent } from '@/stores';
import { Badge } from '@/types/badge';

interface ProfileBadgesSectionProps {
  readonly badges: Badge[];
}

export default function ProfileBadgesSection({ badges }: ProfileBadgesSectionProps) {
  const darkMode = useDarkMode();
  const isMobile = useIsMobile();
  const pageContent = usePageContent();
  const textSize = isMobile ? 'text-[14px]' : 'text-[24px]';

  return (
    <ProfileFieldSection
      icon={darkMode ? BadgesIconWhite : BadgesIcon}
      iconAlt={pageContent['body-profile-badges-title']}
      title={pageContent['body-profile-badges-title']}
    >
      {badges.length > 0 ? (
        <BadgesCarousel badges={badges} />
      ) : (
        <span
          className={`font-[Montserrat] ${textSize} ${darkMode ? 'text-white' : 'text-[#053749]'}`}
        >
          {pageContent['body-profile-badges-no-badges']}
        </span>
      )}
    </ProfileFieldSection>
  );
}
