import { headers } from 'next/headers';
import CapacityProfileMainWrapper from '../components/CapacityProfileMainWrapper';

export default async function CapacityPage() {
  // Capacity ID
  const pathname = headers().get('x-pathname') || '';
  const selectedCapacityId = pathname.split('/').slice(-1)[0];

  return <CapacityProfileMainWrapper selectedCapacityId={selectedCapacityId} />;
}
