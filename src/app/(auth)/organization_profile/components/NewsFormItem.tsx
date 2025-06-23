import { useTheme } from '@/contexts/ThemeContext';
import CancelIcon from '@/public/static/images/cancel.svg';
import CancelIconWhite from '@/public/static/images/cancel_white.svg';
import Image from 'next/image';
import { tagDiff } from '@/types/tagDiff';
import { useApp } from '@/contexts/AppContext';

interface NewsFormItemProps {
  news: tagDiff;
  index: number;
  onDelete: (index: number) => void;
  onChange: (index: number, field: string, value: string) => void;
}

const NewsFormItem = ({ news, index, onDelete, onChange }: NewsFormItemProps) => {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  if (isMobile) {
    return (
      <div className="flex flex-row gap-2">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-row gap-2 w-full items-center text-[12px] p-2 border rounded-md bg-transparent">
            <input
              type="text"
              placeholder={pageContent['organization-profile-add-a-diff-tag']}
              value={news.tag || ''}
              onChange={e => onChange(index, 'tag', e.target.value)}
              className={`w-full bg-transparent border-none outline-none text-[12px] ${
                darkMode
                  ? 'text-white placeholder-gray-400'
                  : 'text-[#829BA4] placeholder-[#829BA4]'
              }`}
            />
          </div>
        </div>
        <button onClick={() => onDelete(index)}>
          <div className="relative md:w-[32px] md:h-[32px] w-[24px] h-[24px]">
            <Image
              src={darkMode ? CancelIconWhite : CancelIcon}
              alt="Delete icon"
              className="object-contain"
              width={24}
              height={24}
            />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-row gap-2 w-full items-center text-[24px] md:text-[24px] text-[16px] p-2 border rounded-md bg-transparent">
          <input
            type="text"
            placeholder={pageContent['organization-profile-add-a-diff-tag']}
            value={news.tag || ''}
            onChange={e => onChange(index, 'tag', e.target.value)}
            className={`w-full bg-transparent border-none outline-none text-[16px] md:text-[24px] ${
              darkMode ? 'text-white placeholder-gray-400' : 'text-[#829BA4] placeholder-[#829BA4]'
            }`}
          />
        </div>
      </div>
      <button onClick={() => onDelete(index)}>
        <div className="relative md:w-[32px] md:h-[32px] w-[24px] h-[24px]">
          <Image
            src={darkMode ? CancelIconWhite : CancelIcon}
            alt="Delete icon"
            className="object-contain"
            width={24}
            height={24}
          />
        </div>
      </button>
    </div>
  );
};

export default NewsFormItem;
