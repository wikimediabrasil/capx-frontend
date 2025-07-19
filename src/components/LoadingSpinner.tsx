import { useApp } from '@/contexts/AppContext';

export default function LoadingSpinner() {
  const { pageContent } = useApp();
  return (
    <div
      className={
        'animate-spin ease-linear h-6 w-6 rounded-full mx-auto border-4 border-l-white border-r-white border-b-white border-t-capx-primary-green'
      }
      role="status"
      aria-label={pageContent['aria-label-loading-spinner'] || 'Loading...'}
    />
  );
}
