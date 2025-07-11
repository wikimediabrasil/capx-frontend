import { Metadata } from 'next';
import AuthenticatedHomeWrapper from './components/AuthenticatedHomeWrapper';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Home - CapX',
  description: 'Capacity Exchange Platform',
};

export default async function AuthenticatedHomePage() {
  const session = await getServerSession();
  if (!session) {
    redirect('/');
  }

  // @ts-ignore - Adicionando first_login do session
  const isFirstLogin = session?.user?.first_login || false;

  return <AuthenticatedHomeWrapper isFirstLogin={isFirstLogin} />;
}
