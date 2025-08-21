import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DocumentCard } from './DocumentCard';
import WikimediaIcon from '@/public/static/images/wikimedia_logo_black.svg';
import WikimediaIconWhite from '@/public/static/images/wikimedia_logo_white.svg';
import Image from 'next/image';
import { useState } from 'react';

interface DocumentsListProps {
  title: string;
  items?: number[];
  type: 'documents';
  token?: string;
}

export const DocumentsList = ({ title, items = [], token }: DocumentsListProps) => {
  const { darkMode } = useTheme();
  const { isMobile } = useApp();
  const [renderedDocuments, setRenderedDocuments] = useState(items.length);

  const updateRenderedDocumentsCount = () => {
    setRenderedDocuments(renderedDocuments - 1);
  };

  console.log('DocumentsList items', items);
  if (items.length === 0 || renderedDocuments === 0) {
    return null;
  }

  const isSingle = renderedDocuments === 1;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 items-center">
        <div className={`relative ${isMobile ? 'w-[20px] h-[20px]' : 'w-[42px] h-[42px]'}`}>
          <Image
            src={darkMode ? WikimediaIconWhite : WikimediaIcon}
            alt="Wikimedia icon"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
        <h2
          className={`text-center not-italic font-extrabold leading-[29px] font-[Montserrat] ${
            darkMode ? 'text-[#F6F6F6]' : 'text-[#003649]'
          } ${isMobile ? 'text-[14px]' : 'text-[24px]'}`}
        >
          {title}
        </h2>
      </div>
      <div
        className={`flex flex-row gap-8 ${
          isSingle
            ? 'justify-center md:justify-start overflow-x-hidden md:overflow-visible'
            : 'justify-start overflow-x-auto'
        } scrollbar-hide`}
      >
        {items.map(id => (
          <DocumentCard
            key={id}
            documentId={id}
            token={token}
            updateRenderedDocumentsCount={updateRenderedDocumentsCount}
            isSingle={isSingle}
          />
        ))}
      </div>
    </section>
  );
};
