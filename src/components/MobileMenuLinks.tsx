'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import IconDarkMode from '@/public/static/images/dark_mode.svg';
import IconLightMode from '@/public/static/images/light_mode.svg';
import ArrowDropDownWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';
import ArrowDropDownBlack from '@/public/static/images/arrow_drop_down_circle.svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useOrganization } from '@/hooks/useOrganizationProfile';
import { Session } from 'next-auth';
import { useApp } from '@/contexts/AppContext';
import { useOrganizationDisplayName } from '@/hooks/useOrganizationDisplayName';
import { useSession } from 'next-auth/react';

interface MenuItem {
  title: string;
  to?: string;
  active: boolean;
  image?: string;
  isDarkBg?: boolean;
  action?: () => void;
}

interface SubMenuItem {
  title: string;
  to: string;
  action: () => void;
}

interface MobileMenuLinksProps {
  session: Session | null;
  handleMenuStatus: () => void;
}

// Component to render organization submenu item with translated name
function OrganizationSubMenuItem({
  org,
  handleProfileChange,
  darkMode,
}: {
  org: any;
  handleProfileChange: (path: string) => void;
  darkMode: boolean;
}) {
  const { data: session } = useSession();
  const { displayName } = useOrganizationDisplayName({
    organizationId: org.id,
    defaultName: org.display_name,
    token: session?.user?.token,
  });

  return (
    <div
      onClick={() => handleProfileChange(`/organization_profile/${org.id}`)}
      className={`flex items-center justify-between px-2 py-3 border-t border-[#053749] pt-2 cursor-pointer ${
        darkMode
          ? 'text-capx-dark-text bg-capx-dark-bg'
          : 'text-capx-light-text bg-capx-light-bg'
      }`}
    >
      <span className="font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]">
        {displayName || 'Organization'}
      </span>
    </div>
  );
}

export default function MobileMenuLinks({ session, handleMenuStatus }: MobileMenuLinksProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { darkMode, setDarkMode } = useTheme();
  const params = useParams();
  const { pageContent } = useApp();
  const organizationId = params?.id;
  const { organizations, isOrgManager } = useOrganization(
    session?.user?.token,
    Number(organizationId)
  );

  const handleProfileChange = (path: string) => {
    handleMenuStatus();
    window.location.href = path;
  };

  const subMenuItems: SubMenuItem[] = [
    {
      title: pageContent['navbar-user-profile'],
      to: '/profile',
      action: () => handleProfileChange('/profile'),
    },
  ];

  const menuDataLoggedIn: MenuItem[] = [
    { title: pageContent['navbar-link-home'], to: '/home', active: true },
    {
      title: pageContent['navbar-link-capacities'],
      to: '/capacity',
      active: true,
    },
    {
      title: pageContent['navbar-link-feed'],
      to: '/feed',
      active: true,
    },
    {
      title: pageContent['navbar-link-saved-profiles'],
      to: '/feed/saved',
      active: true,
    },
    {
      title: pageContent['navbar-link-reports'],
      to: '/report_bug',
      active: true,
    },
    {
      title: pageContent['navbar-link-messages'],
      to: '/message',
      active: true,
    },
    {
      title: pageContent['navbar-link-events'],
      to: '/events',
      active: true,
    },
    {
      title: pageContent['navbar-link-organizations'],
      to: '/organization_list',
      active: true,
    },
    {
      title: pageContent['analytics-dashboard'],
      to: '/data_analytics_dashboard',
      active: true,
    },

    {
      title: pageContent['navbar-link-dark-mode'],
      action: () => {
        setDarkMode(!darkMode);
      },
      active: true,
      image: darkMode ? IconLightMode : IconDarkMode,
    },
    {
      title: pageContent['navbar-link-profiles'],
      to: '/profile',
      active: true,
      image: ArrowDropDownBlack,
      isDarkBg: true,
    },
  ];

  const unauthenticatedMenuItems = [
    {
      title: pageContent['navbar-link-organizations'],
      to: '/organization_list',
      active: true,
    },
    {
      title: pageContent['navbar-link-events'],
      to: '/events',
      active: true,
    },
    {
      title: pageContent['navbar-link-dark-mode'],
      action: () => {
        setDarkMode(!darkMode);
      },
      active: true,
      image: darkMode ? IconLightMode : IconDarkMode,
    },
  ];

  const menuItems = session ? menuDataLoggedIn : unauthenticatedMenuItems;

  const handleProfileClick = () => {
    setIsExpanded(!isExpanded);
  };

  // Renders a menu item
  const renderMenuItem = (item: MenuItem, index: number) => {
    if (!item.active) return null;

    if (item.isDarkBg) {
      return renderProfileMenu(item, index);
    }

    if (item.action) {
      return renderActionButton(item, index);
    }

    return renderLink(item, index);
  };

  // Renders the profile menu
  const renderProfileMenu = (item: MenuItem, index: number) => {
    return (
      <div key={`mobile-menu-container-${index}`} className="w-full mx-1">
        <button
          onClick={handleProfileClick}
          className={`flex items-center justify-between  rounded-[4px] border transition-all duration-300 px-2 py-1 pr-2 md:pr-3 w-[92%] ml-4 md:w-[90%] md:ml-2 sm:ml-6 ${
            darkMode
              ? 'bg-capx-dark-bg text-capx-light-text border-capx-light-text'
              : 'bg-capx-light-bg text-capx-dark-text border-capx-dark-bg'
          }`}
        >
          <span
            className={`font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
              isExpanded
                ? darkMode
                  ? 'text-white'
                  : 'text-[#053749]'
                : darkMode
                  ? 'text-white'
                  : 'text-[#053749]'
            }`}
          >
            {item.title}
          </span>
          {item.image && isExpanded && darkMode && (
            <Image
              src={ArrowDropDownWhite}
              alt="Profile menu icon"
              width={24}
              height={24}
              style={{ width: 'auto', height: 'auto' }}
              className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
          {item.image && !isExpanded && !darkMode && (
            <Image
              src={item.image}
              alt="Profile menu icon"
              width={24}
              height={24}
              style={{ width: 'auto', height: 'auto' }}
              className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
          {item.image && !isExpanded && darkMode && (
            <Image
              src={ArrowDropDownWhite}
              alt="Profile menu icon"
              width={24}
              height={24}
              style={{ width: 'auto', height: 'auto' }}
            />
          )}
          {item.image && isExpanded && !darkMode && (
            <Image
              src={ArrowDropDownBlack}
              alt="Profile menu icon"
              width={24}
              height={24}
              style={{ width: 'auto', height: 'auto' }}
              className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        {isExpanded && (
          <div className="flex flex-col rounded-b-[4px] w-[92%] mx-[16px] border border-[#053749] border-t-0 ml-[16px] mr-[16px] border-t border-[#053749]">
            {subMenuItems.map((subItem, subIndex) => (
              <div
                key={`submenu-item-${subIndex}`}
                onClick={subItem.action}
                className={`flex items-center justify-between px-2 py-3 border-t border-[#053749] pt-2 cursor-pointer ${
                  darkMode
                    ? 'text-capx-dark-text bg-capx-dark-bg'
                    : 'text-capx-light-text bg-capx-light-bg'
                }`}
              >
                <span className="font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]">
                  {subItem.title}
                </span>
              </div>
            ))}
            {isOrgManager &&
              organizations.map((org) => (
                <OrganizationSubMenuItem
                  key={`org-submenu-${org.id}`}
                  org={org}
                  handleProfileChange={handleProfileChange}
                  darkMode={darkMode}
                />
              ))}
          </div>
        )}
      </div>
    );
  };

  // Renders an action button
  const renderActionButton = (item: MenuItem, index: number) => {
    return (
      <button
        key={`mobile-menu-link-${index}`}
        onClick={() => {
          item.action?.();
          if (!item.image || item.image !== IconDarkMode) {
            handleMenuStatus();
          }
        }}
        className={`w-full cursor-pointer py-3 font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] pl-6 ${
          darkMode
            ? 'text-capx-light-bg border-capx-light-text'
            : 'text-[#053749] border-capx-dark-text'
        }`}
      >
        <div className="flex justify-between items-center">
          {item.title}
          {item.image && (
            <div className="px-8">
              <Image
                src={item.image}
                alt={pageContent['alt-icon-generic'] || 'Menu icon'}
                width={24}
                height={24}
              />
            </div>
          )}
        </div>
      </button>
    );
  };

  // Renders a link
  const renderLink = (item: MenuItem, index: number) => {
    return (
      <NextLink
        key={`mobile-menu-link-${index}`}
        href={item.to || ''}
        className={`w-full cursor-pointer py-3 font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] pl-6 ${
          darkMode
            ? 'text-capx-light-bg border-capx-light-text'
            : 'text-[#053749] border-capx-dark-text'
        }`}
        onClick={handleMenuStatus}
      >
        <div className="flex justify-between items-center">
          {item.title}
          {item.image && (
            <div className="px-8">
              <Image
                src={item.image}
                alt={pageContent['alt-icon-generic'] || 'Menu icon'}
                width={24}
                height={24}
              />
            </div>
          )}
        </div>
      </NextLink>
    );
  };

  if (session) {
    return (
      <div className="flex flex-col items-start text-2xl mx-auto mt-8 mb-4">
        {menuDataLoggedIn.map((item, index) => renderMenuItem(item, index))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start text-2xl mx-auto mt-8 mb-4">
      {menuItems.map((item, index) => renderMenuItem(item, index))}
    </div>
  );
}
