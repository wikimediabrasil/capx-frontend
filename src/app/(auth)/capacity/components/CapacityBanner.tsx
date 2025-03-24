import Image from "next/image";
import CapxPeopleLogo from "@/public/static/images/capx_people_illustration.svg";
import { useApp } from "@/contexts/AppContext";

export function CapacityBanner() {
  const { isMobile, pageContent } = useApp();

  return (
    <section
      className={`w-full rounded-[4px] ${
        isMobile ? "h-fit py-6" : "h-[399px]"
      }`}
    >
      <div
        className={`flex flex-row bg-capx-dark-bg max-w-screen-xl mx-auto items-center ${
          isMobile
            ? "gap-3 flex-col"
            : "w-full h-full justify-between gap-[120px]"
        }`}
      >
        <div
          className={`relative ${
            isMobile
              ? "w-[220px] h-[220px] ml-0 py-3"
              : "w-[500px] h-[500px] ml-[120px]"
          }`}
        >
          <Image src={CapxPeopleLogo} alt="CapX Logo" fill priority />
        </div>

        <div
          className={`w-[324px] ${
            isMobile
              ? "items-center mr-0 w-full pb-6"
              : "items-start mr-[120px] w-[324px]"
          }`}
        >
          <h1
            className={`text-white font-extrabold leading-[59px] ${
              isMobile
                ? "text-center text-[20px] justify-center"
                : "text-start text-[48px]"
            }`}
          >
            {pageContent["capacity-banner-title"]}
          </h1>
        </div>
      </div>
    </section>
  );
}
