'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AccountCircleIcon from '@/public/static/images/account_circle.svg';
import AccountCircleIconWhite from '@/public/static/images/account_circle_white.svg';
import BaseButton from '@/components/BaseButton';
import { useSession } from 'next-auth/react';
import { useProfile } from '@/hooks/useProfile';
import NoAvatarIcon from '@/public/static/images/no_avatar.svg';
import { useEffect, useState } from 'react';
import { useAvatars } from '@/hooks/useAvatars';
import { useBadges } from '@/contexts/BadgesContext';
import ProgressBar from '@/components/ProgressBar';

export default function BadgesPage() {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const router = useRouter();

  const { data: session } = useSession();
  const token = session?.user?.token;
  const userId = session?.user?.id;

  const { profile } = useProfile(token, Number(userId));

  const { getAvatarById } = useAvatars();
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar || NoAvatarIcon);
  const { allBadges, userBadges } = useBadges();
  const userBadgeById = new Map(userBadges.map(b => [b.id, b]));

  useEffect(() => {
    const fetchAvatar = async () => {
      if (typeof profile?.avatar === 'number' && profile?.avatar > 0) {
        try {
          const avatarData = await getAvatarById(profile?.avatar);
          if (avatarData?.avatar_url) {
            setAvatarUrl(avatarData.avatar_url);
          }
        } catch (error) {
          console.error('Error fetching avatar:', error);
        }
      }
    };

    fetchAvatar();
  }, [profile?.avatar, getAvatarById]);

  return (
    <main
      className={`w-full max-w-screen-xl mx-auto px-4 py-8 min-h-screen relative w-full ${darkMode ? 'bg-capx-dark-bg' : 'bg-white'} mt-[80px]
    `}
    >
      <div className="flex flex-col gap-2">
        <h1
          className={`font-[Montserrat] text-[16px] not-italic font-normal leading-[29px] ${
            darkMode ? 'text-white' : 'text-[#053749]'
          }`}
        >
          {pageContent['edit-profile-welcome']}
        </h1>
        <div className="flex items-center gap-[6px]">
          <div className="relative w-[24px] h-[24px]">
            <Image
              src={darkMode ? AccountCircleIconWhite : AccountCircleIcon}
              alt="User circle icon"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>

          <span
            className={`text-start ${
              darkMode ? 'text-white' : 'text-[#053749]'
            } font-[Montserrat] text-[20px] font-extrabold`}
          >
            {session?.user?.name}
          </span>
        </div>

        {/* Image Profile Section */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <Image src={avatarUrl} alt="Selected avatar" fill className="object-contain" />
            </div>
          </div>

          {/* Action Buttons */}
          <BaseButton
            onClick={() => router.back()}
            label={pageContent['badges-back-to-user-profile']}
            customClass={`w-full flex items-center px-[13px] py-[6px] pb-[6px] text-[14px] border border-[#053749] text-[#053749] rounded-md py-3 font-bold mb-0 ${
              darkMode
                ? 'bg-transparent text-[#F6F6F6] border-[#F6F6F6] border-[2px]'
                : 'bg-[#F6F6F6] border-[#053749] text-[#053749]'
            }`}
            imageUrl={darkMode ? AccountCircleIconWhite : AccountCircleIcon}
            imageAlt="Cancel icon"
            imageWidth={20}
            imageHeight={20}
          />
        </div>

        {/* All badges grid; applies P&B to the ones not owned */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allBadges
            .map(badge => {
              const progress = userBadgeById.get(badge.id)?.progress ?? 0;
              return { badge, progress };
            })
            .sort((a, b) => b.progress - a.progress)
            .map(({ badge, progress }) => {
              const isUnlocked = Number(progress) >= 100;

              return (
                <div
                  key={badge.id}
                  className={`
                  p-4 
                  rounded-lg 
                  ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-[#F6F6F6]'}
                  flex flex-col 
                  items-center 
                  text-center
                  h-full
                  justify-between
                `}
                >
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4">
                      <Image
                        src={badge.picture}
                        alt={badge.name}
                        fill
                        className={`object-contain ${!isUnlocked ? 'grayscale opacity-60' : ''}`}
                      />
                    </div>
                    <h3
                      className={`
                    text-base md:text-lg 
                    font-bold 
                    mb-2
                    ${darkMode ? 'text-white' : 'text-[#053749]'}
                    ${!isUnlocked ? 'opacity-60' : ''}
                  `}
                    >
                      {badge.name}
                    </h3>
                    <p
                      className={`
                    text-sm md:text-base 
                    mb-3
                    ${darkMode ? 'text-gray-300' : 'text-gray-600'}
                    ${!isUnlocked ? 'opacity-60' : ''}
                  `}
                    >
                      {badge.description}
                    </p>
                  </div>
                  <div className="w-full mt-auto">
                    <ProgressBar progress={progress} darkMode={darkMode} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </main>
  );
}
