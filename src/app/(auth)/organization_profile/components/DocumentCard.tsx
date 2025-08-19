import BaseButton from '@/components/BaseButton';
import LoadingState from '@/components/LoadingState';
import { useDocument } from '@/hooks/useDocument';
import Image from 'next/image';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';

interface DocumentCardProps {
  documentId: number;
  token?: string;
  updateRenderedDocumentsCount: () => void;
  isSingle?: boolean;
}

export const DocumentCard = ({
  documentId,
  token,
  updateRenderedDocumentsCount,
  isSingle = false,
}: DocumentCardProps) => {
  const { document, loading, error } = useDocument(token, documentId);
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  if (loading) {
    return <LoadingState />;
  }

  if (!loading && (error || !document || (!document.imageUrl && !document.url))) {
    updateRenderedDocumentsCount();
    return null;
  }

  const imageUrl =
    document?.thumburl ||
    document?.imageUrl ||
    (document?.fullUrl ? formatWikiImageUrl(document.fullUrl) : undefined) ||
    (document?.url ? formatWikiImageUrl(document.url) : '') ||
    '';

  return (
    <div
      className={`rounded-[16px] flex-shrink-0 flex flex-col h-fit ${
        darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'
      } ${
        isSingle ? 'w-full max-w-[600px] mx-auto md:mx-0' : 'w-[85vw] max-w-[350px] md:w-[350px]'
      }`}
    >
      <div className="p-6 flex items-center justify-center h-[250px]">
        <div
          className={`relative ${
            isSingle ? 'w-[70vw] max-w-[280px] h-[200px]' : 'w-[200px] h-[200px]'
          } flex items-center justify-center`}
        >
          <Image
            src={imageUrl}
            alt={document?.title || 'Document preview'}
            style={{ objectFit: 'contain' }}
            className="p-4"
            fill
            sizes="200px"
          />
        </div>
      </div>
      <div className="p-6">
        <h3
          className={`mb-4 font-[Montserrat] text-lg font-bold ${
            darkMode ? 'text-white' : 'text-[#003649]'
          }`}
        >
          {document?.title}
        </h3>
        <BaseButton
          customClass="inline-flex h-[32px] px-[18px] py-[8px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] md:text-[24px] h-[64px] not-italic font-extrabold leading-[normal]"
          label={pageContent['organization-profile-view-document']}
          onClick={() => document?.fullUrl && window.open(document.fullUrl, '_blank')}
        />
      </div>
    </div>
  );
};
