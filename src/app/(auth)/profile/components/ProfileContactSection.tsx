'use client';

import BaseButton from '@/components/BaseButton';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ContactImage from '@/public/static/images/capx_contact_person.svg';
import ContactImageDesktop from '@/public/static/images/capx_contact_person_desktop.svg';

interface ProfileContactSectionProps {
  username: string;
}

export default function ProfileContactSection({ username }: ProfileContactSectionProps) {
  const { isMobile, pageContent } = useApp();
  const router = useRouter();

  if (isMobile) {
    return (
      <div className="flex w-[273px] m-auto px-[34px] py-[24px] flex-col items-center gap-[31px] rounded-[4px] bg-[#0070B9]">
        <div className="relative h-[200px] w-[200px]">
          <Image src={ContactImage} alt="Contact Image" fill className="object-cover" />
        </div>
        <BaseButton
          label={pageContent['body-profile-contact-button']}
          customClass="inline-flex h-[32px] px-[19px] py-[8px] justify-center items-center gap-[10px] flex-shrink-0 rounded-[4px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
          onClick={() => router.push(`/message?username=${username}`)}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-full justify-center m-auto px-4 md:px-[34px] flex-row items-center gap-4 md:gap-[31px] rounded-[4px] bg-[#0070B9] overflow-hidden">
      <div className="relative h-[200px] w-[200px] md:h-[248px] md:w-[248px] flex-shrink-0">
        <Image src={ContactImageDesktop} alt="Contact Image" fill className="object-cover" />
      </div>
      <BaseButton
        label={pageContent['body-profile-contact-button']}
        customClass="inline-flex h-[32px] px-[19px] py-[8px] justify-center items-center gap-[10px] flex-shrink-0 rounded-[4px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
        onClick={() => router.push(`/message?username=${username}`)}
      />
    </div>
  );
}
