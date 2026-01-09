import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import BaseButton from '@/components/BaseButton';
import BadgesCarousel from '@/components/BadgesCarousel';
import BadgesIcon from '@/public/static/images/icons/badges_icon.svg';
import BadgesIconWhite from '@/public/static/images/icons/badges_icon_white.svg';
import ChangeCircleIcon from '@/public/static/images/change_circle.svg';
import ChangeCircleIconWhite from '@/public/static/images/change_circle_white.svg';
import ExpandIcon from '@/public/static/images/expand_all.svg';
import ExpandIconWhite from '@/public/static/images/expand_all_white.svg';

interface BadgesSectionProps {
  readonly isBadgesLoading: boolean;
  readonly displayedBadges: any[];
  readonly userBadges: any[];
  readonly setShowBadgeModal: (show: boolean) => void;
  readonly onSeeAllClick: () => void;
}

const getBadgesContent = (
  isBadgesLoading: boolean,
  displayedBadges: any[],
  pageContent: any,
  darkMode: boolean
) => {
  if (isBadgesLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="w-full h-[48px] bg-gray-200 rounded-md mb-2"></div>
      </div>
    );
  }

  if (displayedBadges.length > 0) {
    return <BadgesCarousel badges={displayedBadges} showFullDescription={false} />;
  }

  const textColor = darkMode ? 'text-white' : 'text-[#053749]';
  return (
    <span
      className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${textColor}`}
    >
      {pageContent['body-profile-badges-no-badges']}
    </span>
  );
};

export function BadgesSection({
  isBadgesLoading,
  displayedBadges,
  userBadges,
  setShowBadgeModal,
  onSeeAllClick,
}: BadgesSectionProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  const badgeIcon = darkMode ? BadgesIconWhite : BadgesIcon;
  const iconSize = isMobile ? 20 : 48;
  const buttonIconSize = isMobile ? 20 : 30;
  const titleColor = darkMode ? 'text-white' : 'text-[#053749]';
  const editButtonClass = darkMode
    ? 'bg-capx-light-box-bg text-[#04222F]'
    : 'bg-[#053749] text-white';
  const seeAllButtonClass = darkMode
    ? 'border-white text-white'
    : 'border-[#053749] text-[#053749]';
  const descriptionColor = darkMode ? 'text-white' : 'text-[#053749]';
  const changeIcon = darkMode ? ChangeCircleIconWhite : ChangeCircleIcon;
  const expandIcon = darkMode ? ExpandIconWhite : ExpandIcon;

  return (
    <>
      <div className="flex items-center gap-2 mt-4 mb-4">
        <Image src={badgeIcon} alt="Badges icon" width={iconSize} height={iconSize} />
        <h2 className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${titleColor}`}>
          {pageContent['body-profile-badges-title']}
        </h2>
      </div>

      {getBadgesContent(isBadgesLoading, displayedBadges, pageContent, darkMode)}

      {userBadges.length > 0 && (
        <BaseButton
          onClick={() => setShowBadgeModal(true)}
          label={pageContent['body-profile-badges-edit-your-badges']}
          customClass={`w-full md:w-fit flex ${editButtonClass} rounded-md py-2 font-[Montserrat] text-[12px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] md:px-8 md:py-4 items-center gap-[4px] mt-4 md:mb-4`}
          imageUrl={changeIcon}
          imageAlt={pageContent['body-profile-badges-edit-your-badges']}
          imageWidth={buttonIconSize}
          imageHeight={buttonIconSize}
        />
      )}

      <div className="flex flex-col gap-2">
        <BaseButton
          onClick={onSeeAllClick}
          label={pageContent['body-profile-badges-see-all']}
          customClass={`w-full md:w-fit flex mb-2 md:mb-4 border ${seeAllButtonClass} rounded-md py-2 font-[Montserrat] text-[12px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0 pb-[6px] px-[13px] py-[6px] md:px-8 md:py-4 items-center gap-[4px]`}
          imageUrl={expandIcon}
          imageAlt="View all badges"
          imageWidth={buttonIconSize}
          imageHeight={buttonIconSize}
        />

        <span
          className={`text-[12px] md:text-[20px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${descriptionColor}`}
        >
          {pageContent['body-profile-badges-description']}
        </span>
      </div>
    </>
  );
}
