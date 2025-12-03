import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BaseSelect from './BaseSelect';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useOrganization } from '@/hooks/useOrganizationProfile';
import { useSession } from 'next-auth/react';
import OrganizationOptionsLoader from './OrganizationOptionsLoader';

interface ProfileOption {
  value: string;
  label: string;
  path: string;
}

export default function ProfileSelect() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const { data: session } = useSession();

  const { organizations } = useOrganization(session?.user?.token);
  const [translatedNames, setTranslatedNames] = useState<Record<number, string>>({});

  const handleNamesLoaded = useCallback((names: Record<number, string>) => {
    setTranslatedNames(names);
  }, []);

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

  const handleProfileChange = (selectedOption: { value: string; label: string }) => {
    const selectedPath = profileOptions.find(option => option.value === selectedOption.value)?.path;
    if (selectedPath) {
      router.push(selectedPath);
    }
  };

  return (
    <>
      <OrganizationOptionsLoader
        organizations={organizations}
        token={session?.user?.token}
        onNamesLoaded={handleNamesLoaded}
      />
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
