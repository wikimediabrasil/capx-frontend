import { Metadata } from 'next';
import EditProfilePage from './components/ProfileEditMainWrapper';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Edit Profile - CapX',
  description: 'Edit your profile on CapX',
};

export default async function EditProfile() {
  const session = await getServerSession();
  if (!session) {
    redirect('/');
  }

  return <EditProfilePage />;
}
