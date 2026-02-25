'use client';

import ProfilePage from '../components/ProfilePage';

import LoadingState from '@/components/LoadingState';
import { useUserByUsername } from '@/hooks/useUserProfile';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

export default function ProfileByUserName() {
  const params = useParams();
  const { data: session } = useSession();
  const usernameParam = params?.username;
  const username = Array.isArray(usernameParam) ? usernameParam[0] : usernameParam;

  // Ensure the username is encoded and replace spaces with underscores
  const decodedUsername = decodeURIComponent(username || '');
  const { userByUsername } = useUserByUsername(decodedUsername);

  const decodedUsernameToLower = decodedUsername?.toLowerCase().trim();
  const loggedUserNameToLower = session?.user?.name?.toLowerCase().trim() || '';
  const isSameUser = decodedUsernameToLower === loggedUserNameToLower;

  if (!username || !userByUsername) {
    return <LoadingState fullScreen={true} />;
  }

  return <ProfilePage isSameUser={isSameUser} profile={userByUsername}></ProfilePage>;
}
