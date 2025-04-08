"use client";
import { usePathname, useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { Link } from "react-scroll";
import IconDarkMode from "@/public/static/images/dark_mode.svg";
import IconLightMode from "@/public/static/images/light_mode.svg";
import ArrowDropDownWhite from "@/public/static/images/arrow_drop_down_circle_white.svg";
import ArrowDropDownBlack from "@/public/static/images/arrow_drop_down_circle.svg";
import UserProfileIcon from "@/public/static/images/check_box_outline_blank.svg";
import UserProfileIconWhite from "@/public/static/images/check_box_outline_blank_light.svg";
import OrgProfileIcon from "@/public/static/images/check_box.svg";
import OrgProfileIconWhite from "@/public/static/images/check_box_light.svg";
import { useTheme } from "@/contexts/ThemeContext";
import { useOrganization } from "@/hooks/useOrganizationProfile";

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
  to?: string;
  image: string;
  action?: () => void;
}

interface MobileMenuLinksProps {
  session: any;
  pageContent: {
    [key: string]: string;
  };
  handleMenuStatus: () => void;
}

export default function MobileMenuLinks({
  session,
  pageContent,
  handleMenuStatus,
}: MobileMenuLinksProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const { darkMode, setDarkMode } = useTheme();
  const params = useParams();
  const organizationId = params?.id;
  const { organizations, isOrgManager } = useOrganization(
    session?.user?.token,
    Number(organizationId)
  );

  const currentOrganization = useMemo(() => {
    const organizationId = pathname.match(/\/organization_profile\/(\d+)/)?.[1];
    if (organizationId && organizations) {
      return organizations.find((org) => org.id === Number(organizationId));
    }
    return null;
  }, [pathname, organizations]);

  const [selectedProfile, setSelectedProfile] = useState<
    "user" | "organization"
  >(pathname === "/organization_profile" ? "organization" : "user");

  const handleProfileChange = (path: string) => {
    handleMenuStatus();
    window.location.href = path;
  };

  const subMenuItems: SubMenuItem[] = [
    {
      title: pageContent["navbar-user-profile"],
      to: "/profile",
      image: darkMode ? UserProfileIconWhite : UserProfileIcon,
      action: () => handleProfileChange("/profile"),
    },
    ...(isOrgManager
      ? organizations.map((org) => ({
          title: org.display_name || "Organization",
          to: `/organization_profile/${org.id}`,
          image: darkMode ? OrgProfileIconWhite : OrgProfileIcon,
          action: () => handleProfileChange(`/organization_profile/${org.id}`),
        }))
      : []),
  ];

  useEffect(() => {
    if (pathname === "/organization_profile") {
      setSelectedProfile("organization");
    } else if (pathname === "/profile") {
      setSelectedProfile("user");
    }
  }, [pathname]);

  const getCurrentIcon = () => {
    if (currentOrganization) {
      return darkMode ? OrgProfileIconWhite : OrgProfileIcon;
    }
    return darkMode ? UserProfileIconWhite : UserProfileIcon;
  };

  const menuDataLoggedIn: MenuItem[] = [
    { title: pageContent["navbar-link-home"], to: "/home", active: true },
    {
      title: pageContent["navbar-link-capacities"],
      to: "/capacity",
      active: true,
    },
    {
      title: pageContent["navbar-link-feed"],
      to: "/feed",
      active: true,
    },
    {
      title: pageContent["navbar-link-saved-profiles"],
      to: "/feed/saved",
      active: true,
    },
    {
      title: pageContent["navbar-link-reports"],
      to: "/reports",
      active: false,
    },
    {
      title: pageContent["navbar-link-dark-mode"],
      action: () => {
        setDarkMode(!darkMode);
      },
      active: true,
      image: darkMode ? IconLightMode : IconDarkMode,
    },
    {
      title: pageContent["navbar-link-profiles"],
      to: "/profile",
      active: true,
      image: ArrowDropDownBlack,
      isDarkBg: true,
    },
  ];

  const handleProfileClick = () => {
    setIsExpanded(!isExpanded);
  };

  if (session) {
    return (
      <div className="flex flex-col items-start text-2xl mx-auto mt-8 mb-4">
        {menuDataLoggedIn.map((item, index) => {
          if (item.active) {
            if (item.isDarkBg) {
              return (
                <div
                  key={`mobile-menu-container-${index}`}
                  className="w-full mx-1"
                >
                  <button
                    onClick={handleProfileClick}
                    className={`flex items-center justify-between  rounded-[4px] border transition-all duration-300 px-2 py-1 pr-2 md:pr-3 w-[92%] ml-4 md:w-[90%] md:ml-2 sm:ml-6 ${
                      darkMode
                        ? "bg-capx-dark-bg text-capx-light-text border-capx-light-text"
                        : "bg-capx-light-bg text-capx-dark-text border-capx-dark-bg"
                    }`}
                  >
                    <span
                      className={`font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                        isExpanded
                          ? darkMode
                            ? "text-white"
                            : "text-[#053749]"
                          : darkMode
                          ? "text-white"
                          : "text-[#053749]"
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
                        style={{ width: "auto", height: "auto" }}
                        className={`transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
                    {item.image && !isExpanded && !darkMode && (
                      <Image
                        src={item.image}
                        alt="Profile menu icon"
                        width={24}
                        height={24}
                        style={{ width: "auto", height: "auto" }}
                        className={`transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
                    {item.image && !isExpanded && darkMode && (
                      <Image
                        src={ArrowDropDownWhite}
                        alt="Profile menu icon"
                        width={24}
                        height={24}
                        style={{ width: "auto", height: "auto" }}
                      />
                    )}
                    {item.image && isExpanded && !darkMode && (
                      <Image
                        src={ArrowDropDownBlack}
                        alt="Profile menu icon"
                        width={24}
                        height={24}
                        style={{ width: "auto", height: "auto" }}
                        className={`transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
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
                              ? "text-capx-dark-text bg-capx-dark-bg"
                              : "text-capx-light-text bg-capx-light-bg"
                          }`}
                        >
                          <span className="font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]">
                            {subItem.title}
                          </span>
                          <Image
                            src={subItem.image}
                            alt={`${subItem.title} icon`}
                            width={24}
                            height={24}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            if (item.action) {
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
                      ? "text-capx-light-bg border-capx-light-text"
                      : "text-[#053749] border-capx-dark-text"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    {item.title}
                    {item.image && (
                      <div className="px-8">
                        <Image
                          src={item.image}
                          alt="Menu icon"
                          width={24}
                          height={24}
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            }
            return (
              <NextLink
                key={`mobile-menu-link-${index}`}
                href={item.to || ""}
                className={`w-full cursor-pointer py-3 font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] pl-6 ${
                  darkMode
                    ? "text-capx-light-bg border-capx-light-text"
                    : "text-[#053749] border-capx-dark-text"
                }`}
                onClick={handleMenuStatus}
              >
                <div className="flex justify-between items-center">
                  {item.title}
                  {item.image && (
                    <div className="px-8">
                      <Image
                        src={item.image}
                        alt="Menu icon"
                        width={24}
                        height={24}
                      />
                    </div>
                  )}
                </div>
              </NextLink>
            );
          }
          return null;
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap w-10/12 text-2xl mx-auto mb-8">
      {menuDataLoggedIn.map((item, index) => {
        if (item.active) {
          return (
            <Link
              key={`mobile-menu-link-${index}`}
              activeClass="active"
              to={item.to || ""}
              spy={true}
              smooth={true}
              hashSpy={true}
              duration={500}
              delay={150}
              isDynamic={true}
              ignoreCancelEvents={false}
              spyThrottle={500}
              onClick={handleMenuStatus}
              className={`w-full cursor-pointer border-b py-3 text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                darkMode ? "text-capx-light-bg" : "text-[#053749]"
              }`}
            >
              {item.title}
            </Link>
          );
        }
        return null;
      })}
    </div>
  );
}
