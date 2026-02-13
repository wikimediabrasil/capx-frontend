import { usePageContent } from '@/stores';

export default function LoadingImage() {
  const pageContent = usePageContent();

  return (
    <div
      className="w-full h-full animate-pulse bg-gray-200 rounded-full"
      role="img"
      aria-label={pageContent['aria-label-image-loading'] || 'Image is loading'}
    />
  );
}
