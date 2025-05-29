"use client";

import Image, { StaticImageData } from "next/image";

interface ResponsiveImageTitle {
  mobile?: StaticImageData;
  desktop?: StaticImageData;
}

type TitleType = string | ResponsiveImageTitle;

interface BannerProps {
  image: string;
  title?: TitleType;
  alt: string;
  customClass?: {
    wrapper?: string;
    background?: string;
    text?: string;
  };
}

export default function Banner({ 
  image, 
  title, 
  alt,
  customClass = {},
}: BannerProps) {
  const isResponsiveImage = (value: any): value is ResponsiveImageTitle =>
    value && typeof value === "object" && "mobile" in value;

  return (
    <div className={`md:max-w-[1200px] w-full max-w-sm mx-auto space-y-6 md:mb-6 ${customClass.wrapper ?? ""}`}>
      <div className={`w-full md:h-[350px] ${customClass.background ?? "bg-[#04222F]"} rounded-lg overflow-hidden`}>
        <div className={`flex items-center justify-center h-full px-4 md:px-16 py-6 text-center ${
          title 
            ? "flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-48" 
            : "flex-col"
        }`}>
          <Image
            src={image}
            alt={alt}
            width={180}
            height={180}
            className="h-auto w-[140px] md:w-auto"
            priority
          />

          {title && (
            typeof title === "string" ? (
              <h1 className={`text-[20px] md:text-[40px] font-[Montserrat] font-bold ${customClass.text ?? "text-white"}`}>
                {title}
              </h1>
            ) : (
              <>
                {title.desktop && (
                  <Image
                    src={title.desktop}
                    alt={alt}
                    width={240}
                    height={80}
                    className="hidden md:block h-auto w-auto"
                    priority
                  />
                )}
                {title.mobile && (
                  <Image
                    src={title.mobile}
                    alt={alt}
                    width={180}
                    height={60}
                    className={title.desktop ? "block md:hidden h-auto w-auto" : "h-auto w-auto"}
                    priority
                  />
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
