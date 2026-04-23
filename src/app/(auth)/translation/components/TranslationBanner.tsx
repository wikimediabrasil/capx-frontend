import Banner from '../../../../components/Banner';
import MessageBannerImage from '@/public/static/images/message_banner.svg';
import { usePageContent } from '@/stores';

export default function TranslationBanner() {
  const pageContent = usePageContent();

  return (
    <Banner
      image={MessageBannerImage}
      alt="Translation Icon"
      title={pageContent['translation-page-title'] || 'Translate Capacities'}
    />
  );
}
