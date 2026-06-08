'use client';

import ProfilePage from '../components/ProfilePage';

import { ProfilePageSkeleton } from '@/components/skeletons';
import { useUserByUsername } from '@/hooks/useUserProfile';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { fromProfileSlug } from '@/lib/utils/profilePublicUrl';

export default function ProfileByUserName() {
  const params = useParams();
  const { data: session } = useSession();
  const usernameParam = params?.username;
  const username = Array.isArray(usernameParam) ? usernameParam[0] : usernameParam;

  const decodedUsername = fromProfileSlug(username || '');
  const { userByUsername } = useUserByUsername(decodedUsername);

  const decodedUsernameToLower = decodedUsername?.toLowerCase().trim();
  const loggedUserNameToLower = session?.user?.name?.toLowerCase().trim() || '';
  const isSameUser = decodedUsernameToLower === loggedUserNameToLower;

  if (!username || !userByUsername) {
    return <ProfilePageSkeleton />;
  }

  return <ProfilePage isSameUser={isSameUser} profile={userByUsername}></ProfilePage>;
}
