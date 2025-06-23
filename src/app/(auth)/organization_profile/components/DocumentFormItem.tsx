import { useTheme } from '@/contexts/ThemeContext';
import CancelIcon from '@/public/static/images/cancel.svg';
import CancelIconWhite from '@/public/static/images/cancel_white.svg';
import Image from 'next/image';
import { OrganizationDocument } from '@/types/document';
import { useApp } from '@/contexts/AppContext';

interface DocumentFormItemProps {
  document: OrganizationDocument;
  index: number;
  onDelete: (index: number) => void;
  onChange: (index: number, field: string, value: string) => void;
}

const DocumentFormItem = ({ document, index, onDelete, onChange }: DocumentFormItemProps) => {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  return (
    <div className="flex flex-row gap-2">
      <div className="flex flex-col gap-2 w-full">
        <input
          type="text"
          placeholder={pageContent['edit-profile-insert-link']}
          className={`w-full p-2 text-[24px] font-Montserrat border rounded-md bg-transparent ${
            darkMode ? 'text-white border-gray-600' : 'text-[#829BA4] border-gray-300'
          }`}
          value={document.url || ''}
          onChange={e => {
            onChange(index, 'url', e.target.value);
          }}
        />
      </div>
      <button onClick={() => onDelete(index)}>
        <div className="relative w-[24px] h-[24px]">
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

export default DocumentFormItem;
