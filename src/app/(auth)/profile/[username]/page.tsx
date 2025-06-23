'use client';

import ProfilePage from '../components/ProfilePage';

import { useUserByUsername } from '@/hooks/useUserProfile';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoadingState from '@/components/LoadingState';

export default function ProfileByUserName() {
  const params = useParams();
  const { data: session } = useSession();
  const username = params?.username.toString();

  // Ensure the username is encoded and replace spaces with underscores
  const decodedUsername = decodeURIComponent(username);
  const { userByUsername } = useUserByUsername(decodedUsername);

  const decodedUsernameToLower = decodedUsername?.toLowerCase().trim();
  const loggedUserNameToLower = session?.user?.name?.toLowerCase().trim() || '';
  const isSameUser = decodedUsernameToLower === loggedUserNameToLower;

  if (!userByUsername) {
    return <LoadingState />;
  }

  return <ProfilePage isSameUser={isSameUser} profile={userByUsername}></ProfilePage>;
}
