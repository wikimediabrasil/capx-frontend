import { Providers } from '@/app/(auth)/providers';
import BadgesFetcher from '@/components/BadgesFetcher';
import BaseWrapper from '@/components/BaseWrapper';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-in-required');
  }

  return (
    <Providers>
      <BadgesFetcher />
      <BaseWrapper>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{children}</main>
        </div>
      </BaseWrapper>
    </Providers>
  );
}
