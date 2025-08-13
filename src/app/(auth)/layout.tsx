import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import BaseWrapper from '@/components/BaseWrapper';
import { authOptions } from '@/lib/auth';
import { Providers } from '@/app/(auth)/providers';
import { SafeBadgesProvider } from '@/contexts/SafeBadgesProvider';
import { ProfileEditProvider } from '@/contexts/ProfileEditContext';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <Providers>
      <ProfileEditProvider>
        <SafeBadgesProvider>
          <BaseWrapper>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">{children}</main>
            </div>
          </BaseWrapper>
        </SafeBadgesProvider>
      </ProfileEditProvider>
    </Providers>
  );
}
