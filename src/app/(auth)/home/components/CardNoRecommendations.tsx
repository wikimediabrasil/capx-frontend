'use client';

import Image from 'next/image';
import contacts_product from '@/public/static/images/contacts_product.svg';
import { useApp } from '@/contexts/AppContext';
import BaseButton from '@/components/BaseButton';
import { useRouter } from 'next/navigation';

interface CardNoCapacitiesProps {
  alt: string;
}

export default function CardNoCapacities({ alt = '' }: CardNoCapacitiesProps) {
  const { pageContent } = useApp();
  const router = useRouter();
  return (
    <div className="flex flex-col justify-center items-center bg-[#FFFFFF] p-8 mx-auto text-center rounded-md w-full max-w-full">
      <div className="relative w-[270px] md:w-[180px] h-[180px] md:h-[180px] mx-auto">
        <Image src={contacts_product} alt={alt} fill className="object-contain" priority />
      </div>
      <h1 className="text-[14px] font-[Montserrat] font-bold mt-4 text-capx-dark-box-bg md:text-[32px] md:mt-8 text-center mx-auto">
        {pageContent['home-carousel-suggestions-title-no-capacities']}
      </h1>
      <p className="font-[Montserrat] text-[12px] text-[#053749] md:text-[24px] font-normal md:leading-[29px] pt-2 text-center mx-auto max-w-full">
        {pageContent['home-carousel-suggestions-description-no-capacities']}
      </p>
      <BaseButton
        onClick={() => router.push('/profile/edit')}
        customClass="flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] text-white font-extrabold rounded-lg mt-4 bg-[#053749] md:text-[24px] md:px-8 md:py-4 mx-auto"
        label={pageContent['home-carousel-suggestions-description-no-capacities-button']}
      />
    </div>
  );
}
