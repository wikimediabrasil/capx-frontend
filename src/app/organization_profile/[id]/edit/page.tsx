import BadgesFetcher from '@/components/BadgesFetcher';
import BaseWrapper from '@/components/BaseWrapper';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import OrganizationProfileEditMainWrapper from '../../components/OrganizationProfileEditMainWrapper';

// Editing an organization still requires authentication, unlike the public
// profile view at /organization_profile/[id]. Since this route now lives
// outside the (auth) route group, it enforces its own redirect here.
export default async function EditOrganizationProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-in-required');
  }

  return (
    <BaseWrapper>
      <BadgesFetcher />
      <OrganizationProfileEditMainWrapper />
    </BaseWrapper>
  );
}
