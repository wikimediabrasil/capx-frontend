'use client';

import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import WikiIcon from '@/public/static/images/wikimedia_logo_black.svg';
import WikiIconWhite from '@/public/static/images/wikimedia_logo_white.svg';

interface ProfileWikimediaProjectsSectionProps {
  readonly projects: ReadonlyArray<number>;
  readonly projectImages: { readonly [key: number]: string };
  readonly projectNames: { readonly [key: number]: string };
}

export default function ProfileWikimediaProjectsSection({
  projects,
  projectImages,
  projectNames,
}: ProfileWikimediaProjectsSectionProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  const iconSize = isMobile ? { width: 20, height: 20 } : { width: 48, height: 48 };
  const titleSize = isMobile ? 'text-[14px]' : 'text-[24px]';
  const textSize = isMobile ? 'text-[14px]' : 'text-[24px]';
  const projectSize = isMobile
    ? { height: 123, width: 98, padding: 'p-[12px]' }
    : { height: 250, width: 180, padding: 'p-[24px]' };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 items-center">
        <div className={`relative h-[${iconSize.height}px] w-[${iconSize.width}px]`}>
          <Image
            src={darkMode ? WikiIconWhite : WikiIcon}
            alt="Wikidata Logo"
            fill
            className="object-cover"
          />
        </div>
        <p
          className={`font-[Montserrat] ${titleSize} not-italic font-extrabold leading-[normal] ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {pageContent['body-profile-wikimedia-projects-title']}
        </p>
      </div>
      {projects && projects.length > 0 ? (
        <div className={`flex flex-row ${isMobile ? 'gap-2' : 'gap-5'} items-center`}>
          {projects.map(projectId =>
            projectId ? (
              <div
                key={projectId}
                className={`relative h-[${projectSize.height}px] w-[${projectSize.width}px] rounded-[16px] flex items-center justify-center ${
                  darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
                }`}
              >
                <Image
                  src={projectImages[projectId] || (darkMode ? WikiIconWhite : WikiIcon)}
                  alt={projectNames[projectId] || 'Project icon'}
                  className={`object-contain ${projectSize.padding}`}
                  fill
                />
              </div>
            ) : null
          )}
        </div>
      ) : (
        <span
          className={`font-[Montserrat] ${textSize} ${darkMode ? 'text-white' : 'text-[#053749]'}`}
        >
          {pageContent['empty-field']}
        </span>
      )}
    </div>
  );
}
