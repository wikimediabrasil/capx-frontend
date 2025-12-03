import { useMemo, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BaseSelect from './BaseSelect';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useOrganization } from '@/hooks/useOrganizationProfile';
import { useSession } from 'next-auth/react';
import { useOrganizationDisplayName } from '@/hooks/useOrganizationDisplayName';

interface ProfileOption {
  value: string;
  label: string;
  path: string;
}

// Component to load translated name for an organization
function OrganizationNameLoader({ 
  orgId, 
  defaultName, 
  token, 
  onNameLoaded 
}: { 
  orgId: number; 
  defaultName: string; 
  token?: string;
  onNameLoaded: (id: number, name: string) => void;
}) {
  const { displayName } = useOrganizationDisplayName({
    organizationId: orgId,
    defaultName,
    token,
  });

  useEffect(() => {
    onNameLoaded(orgId, displayName || defaultName);
  }, [orgId, displayName, defaultName, onNameLoaded]);

  return null;
}

export default function ProfileSelect() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const { data: session } = useSession();

  const { organizations } = useOrganization(session?.user?.token);
  const [translatedNames, setTranslatedNames] = useState<Record<number, string>>({});

  const handleNameLoaded = useCallback((id: number, name: string) => {
    setTranslatedNames(prev => ({ ...prev, [id]: name }));
  }, []);

  // Create options with translated names
  const profileOptions: ProfileOption[] = useMemo(
    () => [
      {
        value: 'user',
        label: pageContent['navbar-user-profile'] || 'User Profile',
        path: '/profile',
      },
      ...(organizations.length > 0
        ? organizations.map(org => ({
            value: `org-${org.id}`,
            label: translatedNames[org.id] || org.display_name || 'Organization',
            path: `/organization_profile/${org.id}`,
          }))
        : []),
    ],
    [organizations, pageContent, translatedNames]
  );

  const handleProfileChange = useCallback((selectedOption: { value: string; label: string }) => {
    const selectedPath = profileOptions.find(option => option.value === selectedOption.value)?.path;
    if (selectedPath) {
      router.push(selectedPath);
    }
  }, [profileOptions, router]);

  return (
    <>
      {/* Load translated names for organizations */}
      {organizations.map(org => (
        <OrganizationNameLoader
          key={org.id}
          orgId={org.id}
          defaultName={org.display_name}
          token={session?.user?.token}
          onNameLoaded={handleNameLoaded}
        />
      ))}
      <BaseSelect
        value={{ value: '', label: pageContent['navbar-link-profiles'] }}
        onChange={handleProfileChange}
        options={profileOptions}
        name={pageContent['navbar-link-profiles']}
        ariaLabel={pageContent['aria-label-profile-selector'] || 'Select profile to view'}
        className="w-[200px] text-[20px] w-max"
        darkMode={darkMode}
        isMobile={isMobile}
        placeholder={pageContent['navbar-link-profiles']}
      />
    </>
  );
}
