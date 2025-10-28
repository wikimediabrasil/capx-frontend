'use client';

import Image from 'next/image';
import contacts_product from '@/public/static/images/contacts_product.svg';
import { useApp } from '@/contexts/AppContext';

interface CardNoCapacitiesProps {
  alt: string;
}

export default function CardNoCapacities({ alt = '' }: CardNoCapacitiesProps) {
    const { pageContent } = useApp();
  return (
    <div className="flex justify-center items-center">
      <div className="relative w-[90px] sm:w-[140px] md:w-[180px] h-[90px] sm:h-[140px] md:h-[180px]">
        <Image
          src={contacts_product}
          alt={alt}
          fill
          className="object-contain"
          priority
        />
      </div>
      <h1>
        {pageContent['body-loggedin-home-secondary-section-title']}
      </h1>
    </div>
  );
}
