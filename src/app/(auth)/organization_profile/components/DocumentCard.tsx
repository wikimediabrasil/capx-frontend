import BaseButton from '@/components/BaseButton';
import LoadingState from '@/components/LoadingState';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useDocument } from '@/hooks/useDocument';
import Image from 'next/image';

interface DocumentCardProps {
  documentId: number;
  token?: string;
}

export const DocumentCard = ({ documentId, token }: DocumentCardProps) => {
  const { document, loading, error } = useDocument(token, documentId);
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  if (loading) {
    return <LoadingState />;
  }

  if (error || !document) {
    return null;
  }

  if (!document || (!document.imageUrl && !document.url)) {
    return null;
  }

  const imageUrl = document.imageUrl || document.url || '';

  return (
    <div
      className={`rounded-[16px] w-[350px] flex-shrink-0 flex flex-col h-fit ${
        darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'
      }`}
    >
      <div className="p-6 flex items-center justify-center h-[250px]">
        <div className="relative w-[200px] h-[200px] flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={document.title || 'Document preview'}
            style={{ objectFit: 'contain' }}
            className="p-4"
            fill
            sizes="200px"
            onError={e => {
              e.currentTarget.src = '/static/images/document_placeholder.png';
            }}
          />
        </div>
      </div>
      <div className="p-6">
        <h3
          className={`mb-4 font-[Montserrat] text-lg font-bold ${
            darkMode ? 'text-white' : 'text-[#003649]'
          }`}
        >
          {document.title}
        </h3>
        <BaseButton
          customClass="inline-flex h-[32px] px-[18px] py-[8px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] md:text-[24px] h-[64px] not-italic font-extrabold leading-[normal]"
          label={pageContent['organization-profile-view-document']}
          onClick={() => document.fullUrl && window.open(document.fullUrl, '_blank')}
        />
      </div>
    </div>
  );
};
