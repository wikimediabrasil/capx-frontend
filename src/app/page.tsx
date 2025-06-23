import { Metadata } from 'next';
import ApplicationWrapper from '@/components/ApplicationWrapper';
import BaseWrapper from '@/components/BaseWrapper';

export const metadata: Metadata = {
  title: 'CapX - Capacity Exchange',
  description: 'Exchange your capacities with other users',
};

export default function Home() {
  return (
    <BaseWrapper>
      <ApplicationWrapper />
    </BaseWrapper>
  );
}
