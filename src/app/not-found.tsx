"use client";

import Image from "next/image";
import BaseWrapper from "@/components/BaseWrapper";
import logo_404_custom from "@/public/static/images/logo_404_custom.svg";
import not_found_404_search from "@/public/static/images/not_found_404_search.svg";
import BaseButton from "@/components/BaseButton";

import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function NotFoundCustomPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [pageContent, setPageContent] = useState({
    "not-found-page": "Page not found",
    "not-found-page-back-home": "Back to Home",
  });

  // Safely get theme and app context after mounting
  useEffect(() => {
    setMounted(true);

    try {
      const theme = useTheme();
      setDarkMode(theme?.darkMode || false);
    } catch (error) {
      // Use default theme if context not available
      setDarkMode(false);
    }

    try {
      const app = useApp();
      setPageContent(app?.pageContent || pageContent);
    } catch (error) {
      // Use default content if context not available
      console.warn("AppContext not available in not-found page");
    }
  }, []);

  const handleRedirect = () => {
    router.push("/");
  };

  // Don't render with context-dependent styles until mounted
  if (!mounted) {
    return (
      <BaseWrapper>
        <section className="w-full flex flex-col gap-4 px-4 py-8 mx-auto md:max-w-[1200px]">
          <div className="w-full mx-auto pt-16 md:max-w-[400px] md:pt-[0px]">
            <Image
              src={logo_404_custom}
              alt="Logo404"
              className="mx-auto md:w-[100%] w-[50%] h-[auto]"
            />
          </div>
          <div className="flex flex-col items-center text-center pt-16">
            <p className="font-[Montserrat] text-[12px] not-italic font-normal leading-[2] mb-4 md:text-[20px] md:leading-[29px] text-capx-dark-box-bg">
              Page not found
            </p>
          </div>
          <div className="flex items-center justify-center pt-10 relative">
            <BaseButton
              label="Back to Home"
              onClick={handleRedirect}
              customClass="h-8 w-full max-w-[200px] text-sm inline-flex px-[19px] py-[8px] justify-center items-center gap-[10px] rounded-[6px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] not-italic font-extrabold leading-[normal]"
            />
            <div className="absolute right-0">
              <Image
                src={not_found_404_search}
                alt="Logo404"
                className="md:w-[90%] w-[70%] h-auto"
              />
            </div>
          </div>
        </section>
      </BaseWrapper>
    );
  }

  return (
    <BaseWrapper>
      <section className="w-full flex flex-col gap-4 px-4 py-8 mx-auto md:max-w-[1200px]">
        <div className=" w-full mx-auto pt-16 md:max-w-[400px] md:pt-[0px]">
          <Image
            src={logo_404_custom}
            alt="Logo404"
            className="mx-auto md:w-[100%] w-[50%] h-[auto]"
          />
        </div>
        <div className="flex flex-col items-center text-center pt-16">
          <p
            className={`font-[Montserrat] text-[12px] not-italic font-normal leading-[2] mb-4 md:text-[20px] md:leading-[29px] ${
              darkMode ? "text-white" : "text-capx-dark-box-bg"
            }`}
          >
            {pageContent["not-found-page"]}
          </p>
        </div>
        <div className="flex items-center justify-center pt-10 relative">
          <BaseButton
            label={pageContent["not-found-page-back-home"]}
            onClick={handleRedirect}
            customClass="h-8 w-full max-w-[200px] text-sm inline-flex px-[19px] py-[8px] justify-center items-center gap-[10px] rounded-[6px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] not-italic font-extrabold leading-[normal]"
          />
          <div className="absolute right-0">
            <Image
              src={not_found_404_search}
              alt="Logo404"
              className="md:w-[90%] w-[70%] h-auto"
            />
          </div>
        </div>
      </section>
    </BaseWrapper>
  );
}
