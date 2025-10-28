'use client';

import Image from 'next/image';
import contacts_product from '@/public/static/images/contacts_product.svg';
import { useApp } from '@/contexts/AppContext';
import BaseButton from '@/components/BaseButton';

interface CardNoCapacitiesProps {
  alt: string;
}

export default function CardNoCapacities({ alt = '' }: CardNoCapacitiesProps) {
    const { pageContent } = useApp();
  return (
    <div className="flex flex-col justify-center items-center bg-[#FFFFFF] p-8 mx-auto text-center rounded-md">
      <div className="relative w-[270px] md:w-[180px] h-[180px] md:h-[180px]">
        <Image
          src={contacts_product}
          alt={alt}
          fill
          className="object-contain"
          priority
        />
      </div>
      <h1 className="text-[14px] font-[Montserrat] font-bold mt-4 text-capx-dark-box-bg md:text-[32px] md:mt-8">
        {pageContent['home-carrosel-suggestions-title-no-capacities']}
      </h1>
      <p className="font-[Montserrat] text-[12px] text-[#053749] md:text-[24px] font-normal md:leading-[29px] pt-2">
        {pageContent['home-carrosel-suggestions-description-no-capacities']}
      </p>
      <BaseButton
        onClick={() => console.log('Botão clicado')}
        customClass="flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] text-white font-extrabold rounded-lg mt-4 bg-[#053749] md:text-[24px] md:px-8 md:py-4"
        label={pageContent['home-carrosel-suggestions-description-no-capacities-button']}
      />      
    </div>
  );
}
