import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import PersonIcon from '@/public/static/images/person_book.svg';
import PersonIconWhite from '@/public/static/images/person_book_white.svg';
import { Profile } from '@/types/profile';

interface MiniBioSectionProps {
  readonly formData: Partial<Profile>;
  readonly setFormData: (data: Partial<Profile>) => void;
}

export function MiniBioSection({ formData, setFormData }: MiniBioSectionProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2 items-center">
        <Image
          src={darkMode ? PersonIconWhite : PersonIcon}
          alt="Person icon"
          width={isMobile ? 16 : 48}
          height={isMobile ? 16 : 48}
          style={{ objectFit: 'cover' }}
        />
        <h2
          className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
            darkMode ? 'text-white' : 'text-[#053749]'
          }`}
        >
          {pageContent['edit-profile-mini-bio']}
        </h2>
      </div>
      <div className="flex w-full px-[4px] py-[6px] md:px-3 md:py-4 flex-col items-start gap-[14px] rounded-[4px] md:rounded-[16px] border-[1px] border-[solid] border-capx-light-bg">
        <textarea
          value={formData.about || ''}
          onChange={e => setFormData({ ...formData, about: e.target.value })}
          placeholder={pageContent['edit-profile-mini-bio-placeholder']}
          className={`w-full font-[Montserrat] text-[13px] md:text-[24px] not-italic font-normal leading-[normal] bg-transparent resize-none min-h-[100px] rounded-[4px] md:rounded-[16px] border-[1px] border-[solid] border-[#053749] py-2 px-2 md:px-8 md:py-4 scrollbar-hide ${
            darkMode ? 'text-white placeholder-gray-400' : 'text-[#053749] placeholder-[#829BA4]'
          }`}
        />
      </div>
      <span
        className={`font-[Montserrat] text-[12px] md:text-[20px] not-italic font-normal leading-[15px] md:leading-normal ${
          darkMode ? 'text-white' : 'text-[#053749]'
        }`}
      >
        {pageContent['edit-profile-mini-bio-tooltip']}
      </span>
    </div>
  );
}
