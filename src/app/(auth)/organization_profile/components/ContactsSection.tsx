import Image from "next/image";
import WikimediaIcon from "@/public/static/images/wikimedia_logo_black.svg";
import WikimediaIconWhite from "@/public/static/images/wikimedia_logo_white.svg";
import ContactMetaIcon from "@/public/static/images/contact_meta.svg";
import ContactMetaIconWhite from "@/public/static/images/contact_meta_white.svg";
import ContactEmailIcon from "@/public/static/images/contact_alternate_email.svg";
import ContactEmailIconWhite from "@/public/static/images/contact_alternate_email_white.svg";
import ContactPortalIcon from "@/public/static/images/contact_captive_portal.svg";
import ContactPortalIconWhite from "@/public/static/images/contact_captive_portal_white.svg";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ProfileItem } from "@/components/ProfileItem";

interface ContactsSectionProps {
  email: string;
  meta_page: string;
  website: string;
}

export const ContactsSection = ({
  email,
  meta_page,
  website,
}: ContactsSectionProps) => {
  const { isMobile, pageContent } = useApp();
  const { darkMode } = useTheme();

  const formatContactInfo = (info: string) => {
    if (!info) return "";

    if (info.includes("@")) {
      return {
        display: info,
        url: `mailto:${info}`,
        isLink: true,
      };
    }

    if (info.startsWith("http://") || info.startsWith("https://")) {
      const url = new URL(info);
      return {
        display: info.length > 30 ? url.hostname : info,
        url: info,
        isLink: true,
      };
    }

    return {
      display: info,
      url: "",
      isLink: false,
    };
  };

  // Verify if there is any contact filled
  const hasAnyContact = email || meta_page || website;
  
  // If there is no contacts, return empty array to show the "empty-field" message
  const contactsArray = hasAnyContact ? [
    meta_page ? formatContactInfo(meta_page).display : "",
    email ? formatContactInfo(email).display : "",
    website ? formatContactInfo(website).display : ""
  ].filter(contact => contact.trim() !== "") : [];

  // Function to get the contact name based on the index
  const getContactName = (index: number | string) => {
    const idx = typeof index === 'string' ? parseInt(index) : index;
    const allContacts = [
      meta_page ? formatContactInfo(meta_page) : null,
      email ? formatContactInfo(email) : null,
      website ? formatContactInfo(website) : null
    ].filter(contact => contact && contact.display);

    if (idx >= 0 && idx < allContacts.length && allContacts[idx]) {
      return allContacts[idx].display;
    }
    return "";
  };

  if (isMobile) {
    return (
      <section className="w-full mx-auto">
        <ProfileItem
          icon={darkMode ? WikimediaIconWhite : WikimediaIcon}
          title={pageContent["body-profile-section-title-contacts"]}
          items={contactsArray.map((_, index) => index)}
          getItemName={getContactName}
          customClass={`font-[Montserrat] text-[13px] not-italic font-normal leading-[normal] ${
            darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
          }`}
        />
      </section>
    );
  }

  return (
    <section className="w-full max-w-screen-xl py-8">
      <ProfileItem
        icon={darkMode ? WikimediaIconWhite : WikimediaIcon}
        title={pageContent["body-profile-section-title-contacts"]}
        items={contactsArray.map((_, index) => index)}
        getItemName={getContactName}
        customClass={`font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] ${
          darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
        }`}
      />
    </section>
  );
};
