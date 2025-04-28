"use client";

import Image from "next/image";

interface BannerProps {
  image: string;
  title: string;
  alt: string;
}

export default function Banner({ image, title, alt }: BannerProps) {
  return (
    <div className="md:max-w-[1200px] w-full max-w-sm mx-auto space-y-6 md:mb-6 px-4">
      {/* Banner */}
      <div className="w-full md:h-[350px] bg-[#04222F] rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-center h-full px-4 md:px-16 py-6 space-y-4 md:space-y-0 md:space-x-48 text-center">
          {/* Image */}
          <Image
            src={image}
            alt={alt}
            width={180}
            height={180}
            className="h-auto w-[140px] md:w-auto"
            priority
          />

          {/* Title */}
          <h1 className="text-[20px] md:text-[40px] font-[Montserrat] font-bold text-white">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}
