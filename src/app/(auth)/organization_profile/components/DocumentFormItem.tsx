import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { validateCapXDocumentUrl } from '@/lib/utils/validateDocumentUrl';
import CancelIcon from '@/public/static/images/cancel.svg';
import CancelIconWhite from '@/public/static/images/cancel_white.svg';
import { OrganizationDocument } from '@/types/document';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface DocumentFormItemProps {
  document: OrganizationDocument;
  index: number;
  onDelete: (index: number) => void;
  onChange: (index: number, field: string, value: string) => void;
}

const DocumentFormItem = ({ document, index, onDelete, onChange }: DocumentFormItemProps) => {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const { showSnackbar } = useSnackbar();
  const [hasValidationError, setHasValidationError] = useState(false);

  // Validate URL when it changes
  useEffect(() => {
    if (document.url && document.url.trim() !== '') {
      const validation = validateCapXDocumentUrl(document.url);
      setHasValidationError(!validation.isValid);
    } else {
      setHasValidationError(false);
    }
  }, [document.url]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    onChange(index, 'url', newUrl);

    // Validate URL and show snackbar if invalid
    if (newUrl.trim() !== '') {
      const validation = validateCapXDocumentUrl(newUrl);
      if (!validation.isValid && validation.error) {
        // Show error after a short delay to avoid showing on every keystroke
        setTimeout(() => {
          if (!validateCapXDocumentUrl(newUrl).isValid) {
            showSnackbar(pageContent[validation.error!] || validation.error!, 'error');
          }
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-row gap-2">
      <div className="flex flex-col gap-2 w-full">
        <div className="relative">
          <input
            type="text"
            placeholder={pageContent['edit-profile-insert-link']}
            className={`w-full p-2 text-[12px] md:text-[24px] font-Montserrat border rounded-md bg-transparent ${
              hasValidationError
                ? 'border-red-500 border-2'
                : darkMode
                  ? 'text-white border-gray-600'
                  : 'text-[#829BA4] border-gray-300'
            } ${
              darkMode && !hasValidationError
                ? 'text-white'
                : !hasValidationError
                  ? 'text-[#829BA4]'
                  : 'text-red-500'
            }`}
            value={document.url || ''}
            onChange={handleUrlChange}
          />
          {document.url && document.url.trim() !== '' && (
            <div
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-sm ${
                hasValidationError ? 'text-red-500' : 'text-green-500'
              }`}
            >
              {hasValidationError ? '❌' : '✅'}
            </div>
          )}
        </div>
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
