import Image from 'next/image';
import WikimediaIcon from '@/public/static/images/wikimedia_logo_black.svg';
import WikimediaIconWhite from '@/public/static/images/wikimedia_logo_white.svg';
import ContactMetaIcon from '@/public/static/images/contact_meta.svg';
import ContactMetaIconWhite from '@/public/static/images/contact_meta_white.svg';
import ContactEmailIcon from '@/public/static/images/contact_alternate_email.svg';
import ContactEmailIconWhite from '@/public/static/images/contact_alternate_email_white.svg';
import ContactPortalIcon from '@/public/static/images/contact_captive_portal.svg';
import ContactPortalIconWhite from '@/public/static/images/contact_captive_portal_white.svg';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ProfileItem } from '@/components/ProfileItem';

interface ContactsSectionProps {
  email: string;
  meta_page: string;
  website: string;
}

export const ContactsSection = ({ email, meta_page, website }: ContactsSectionProps) => {
  const { isMobile, pageContent } = useApp();
  const { darkMode } = useTheme();

  const formatContactInfo = (info: string) => {
    if (!info) return '';

    if (info.includes('@')) {
      return {
        display: info,
        url: `mailto:${info}`,
        isLink: true,
      };
    }

    if (info.startsWith('http://') || info.startsWith('https://')) {
      const url = new URL(info);
      return {
        display: info.length > 30 ? url.hostname : info,
        url: info,
        isLink: true,
      };
    }

    return {
      display: info,
      url: '',
      isLink: false,
    };
  };

  // Verify if there is any contact filled
  const hasAnyContact = email || meta_page || website;

  // Create contacts array for when there are contacts
  const contacts = [
    {
      ...formatContactInfo(meta_page),
      icon: darkMode ? ContactMetaIconWhite : ContactMetaIcon,
      type: 'Meta Page',
    },
    {
      ...formatContactInfo(email),
      icon: darkMode ? ContactEmailIconWhite : ContactEmailIcon,
      type: 'Email',
    },
    {
      ...formatContactInfo(website),
      icon: darkMode ? ContactPortalIconWhite : ContactPortalIcon,
      type: 'Website',
    },
  ].filter(contact => contact.display);

  // If no contacts, use ProfileItem to show "empty-field" message
  if (!hasAnyContact) {
    return (
      <section className={isMobile ? 'w-full mx-auto' : 'w-full max-w-screen-xl py-8'}>
        <ProfileItem
          icon={darkMode ? WikimediaIconWhite : WikimediaIcon}
          title={pageContent['body-profile-section-title-contacts']}
          items={[]}
          getItemName={() => ''}
          customClass={`font-[Montserrat] ${isMobile ? 'text-[13px]' : 'text-[24px]'} not-italic font-extrabold leading-[normal] ${
            darkMode ? 'text-[#F6F6F6]' : 'text-[#003649]'
          }`}
        />
      </section>
    );
  }

  // Original rendering when there are contacts
  if (isMobile) {
    return (
      <section className="w-full mx-auto">
        <div className="flex flex-row pl-0 pr-[13px] py-[6px] items-center gap-[4px] rounded-[8px] mb-[14px]">
          <div className="relative w-[20px] h-[20px]">
            <Image
              src={darkMode ? WikimediaIconWhite : WikimediaIcon}
              alt="Wikimedia"
              className="object-contain"
            />
          </div>
          <h2
            className={`font-[Montserrat] not-italic font-extrabold leading-[normal] ${
              darkMode ? 'text-[#F6F6F6]' : 'text-[#003649]'
            }`}
          >
            {pageContent['body-profile-section-title-contacts']}
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className={`flex w-full px-[6px] py-[10px] items-center gap-[4px] rounded-[4px] ${
                darkMode
                  ? 'bg-transparent border-[1px] border-[solid] border-white'
                  : 'bg-[#EFEFEF]'
              }`}
            >
              <div className="relative min-w-[16px] w-[16px] h-[16px] mr-2">
                <Image src={contact.icon} alt={contact.type} fill className="object-contain" />
              </div>
              {contact.isLink ? (
                <a
                  href={contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-[Montserrat] text-[13px] not-italic font-normal leading-[normal] truncate hover:underline ${
                    darkMode ? 'text-[#829BA4]' : 'text-[#003649]'
                  }`}
                  title={contact.url}
                >
                  {contact.display}
                </a>
              ) : (
                <p
                  className={`font-[Montserrat] text-[13px] not-italic font-normal leading-[normal] truncate ${
                    darkMode ? 'text-[#829BA4]' : 'text-[#003649]'
                  }`}
                  title={contact.display}
                >
                  {contact.display}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-screen-xl py-8">
      <div className="flex flex-row pl-0 pr-[13px] py-[6px] items-center gap-4 rounded-[8px] mb-6">
        <div className="relative w-[48px] h-[48px]">
          <Image
            src={darkMode ? WikimediaIconWhite : WikimediaIcon}
            alt="Wikimedia"
            fill
            className="object-contain"
          />
        </div>
        <h2
          className={`font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
            darkMode ? 'text-[#F6F6F6]' : 'text-[#003649]'
          }`}
        >
          {pageContent['body-profile-section-title-contacts']}
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        {contacts.map((contact, index) => (
          <div
            key={index}
            className={`flex flex-row w-full px-[12px] py-[24px] items-center gap-[12px] rounded-[16px] ${
              darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'
            }`}
          >
            <div className="relative min-w-[48px] w-[48px] h-[48px]">
              <Image src={contact.icon} alt={contact.type} fill className="object-contain" />
            </div>
            {contact.isLink ? (
              <a
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] break-all hover:underline ${
                  darkMode ? 'text-[#F6F6F6]' : 'text-[#003649]'
                }`}
              >
                {contact.display}
              </a>
            ) : (
              <p
                className={`font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] break-all ${
                  darkMode ? 'text-[#F6F6F6]' : 'text-[#003649]'
                }`}
              >
                {contact.display}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
