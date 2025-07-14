import Image from 'next/image';
import PersonBookIcon from '@/public/static/images/person_book.svg';
import PersonBookIconWhite from '@/public/static/images/person_book_white.svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

interface MiniBioProps {
  about: string;
}

export default function MiniBio({ about }: MiniBioProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  if (isMobile) {
    return (
      <div
        className={`flex flex-col gap-4 ${
          darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
        }`}
      >
        <div className="flex items-center gap-2">
          <Image
            src={darkMode ? PersonBookIconWhite : PersonBookIcon}
            alt={pageContent['edit-profile-mini-bio']}
            width={20}
            height={20}
          />
          <h2
            className={`text-[14px] font-[Montserrat] font-bold ${
              darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
            }`}
          >
            {pageContent['edit-profile-mini-bio']}
          </h2>
        </div>
        <p
          className={`text-[14px] font-[Montserrat] leading-relaxed ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {about}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-4 ${darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'}`}
    >
      <div className="flex items-center gap-2">
        <Image
          src={darkMode ? PersonBookIconWhite : PersonBookIcon}
          alt={pageContent['edit-profile-mini-bio']}
          width={42}
          height={42}
        />
        <h2
          className={`text-[24px] font-[Montserrat] font-bold ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {pageContent['edit-profile-mini-bio']}
        </h2>
      </div>
      <p
        className={`text-[24px] font-[Montserrat] leading-relaxed ${
          darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
        }`}
      >
        {about}
      </p>
    </div>
  );
}
