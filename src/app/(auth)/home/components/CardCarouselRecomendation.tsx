'use client';

import Image, { StaticImageData } from 'next/image';
import lamp_purple from '@/public/static/images/lamp_purple.svg';
import info_blue from '@/public/static/images/info_blue.svg';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import BaseButton from '@/components/BaseButton';

interface CardRecomendationCarouselProps {
  alt?: string;
  title: string;
  description: string;
  imageTitle: StaticImageData;
  imageDescription: StaticImageData;
  mainImage: StaticImageData;
  imageName: StaticImageData;
  name: string;
  labelButtonPrimary: string;
  labelButtonSecondary: string;
}

export default function CardRecomendationCarousel({
  alt = '',
  title,
  description,
  imageTitle,
  imageDescription,
  mainImage,
  imageName,
  name,
  labelButtonPrimary,
  labelButtonSecondary,
}: CardRecomendationCarouselProps) {
  const { pageContent } = useApp();
  const { darkMode } = useTheme();

  return (
    <div>
      <div className="flex items-center justify-start gap-2 pb-8">
        <h1
          className={`text-[14px] font-[Montserrat] font-bold md:text-[32px] ${
            darkMode ? 'text-white' : 'text-capx-dark-box-bg'
          }`}
        >
          {title}
        </h1>
        <div className="relative w-[15px] h-[15px] md:w-[30px] md:h-[30px]">
          <Image src={imageTitle} alt={alt} fill className="object-contain" priority />
        </div>
      </div>
      <div className="flex flex-col justify-start items-start bg-[#FFFFFF] p-4 mx-auto rounded-md w-[270px] md:w-[370px]">
        <div className="flex items-center justify-start gap-2">
          <div className="relative w-[15px] h-[15px] md:w-[30px] md:h-[30px]">
            <Image src={imageDescription} alt={alt} fill className="object-contain" priority />
          </div>
          <p className="text-[10px] md:text-[18px]">{description}</p>
        </div>
        <div className="relative w-[195px] h-[115px] md:w-[280px] md:h-[180px] bg-[#EFEFEF] mt-4 mb-4">
          <Image src={mainImage} alt={alt} fill className="object-contain" priority />
        </div>
        <div className="flex items-center justify-start gap-2 mb-4">
          <div className="relative w-[15px] h-[15px] md:w-[30px] md:h-[30px]">
            <Image src={imageName} alt={alt} fill className="object-contain" priority />
          </div>
          <p className="text-[14px] md:text-[18px]">{name}</p>
        </div>
        <div className="flex items-center justify-start gap-2 bg-red-500 md:h-[65px]">TEST</div>
        <div className="flex items-center justify-start gap-2">
          <BaseButton
            onClick={() => console.log('Botão clicado')}
            customClass="flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] text-white font-extrabold rounded-lg mt-4 bg-[#053749] md:text-[24px] md:px-8 md:py-4"
            label={labelButtonPrimary}
          />
          <BaseButton
            onClick={() => console.log('Botão clicado')}
            customClass="flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] text-white font-extrabold rounded-lg mt-4 bg-[#053749] md:text-[24px] md:px-8 md:py-4"
            label={labelButtonSecondary}
          />
        </div>
      </div>
    </div>
  );
}
