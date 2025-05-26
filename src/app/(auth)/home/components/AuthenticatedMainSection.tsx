import Image from "next/image";
import { useRouter } from "next/navigation";
import MainSectionIllustration from "@/public/static/images/capx_loggedin_home_illustration.svg";
import MainSectionIllustrationDark from "@/public/static/images/capx_loggedin_home_illustration_dark.svg";
import SecondarySectionIllustration01 from "@/public/static/images/capx_loggedin_home_illustration02.svg";
import SecondarySectionIllustration02 from "@/public/static/images/capx_loggedin_home_illustration03.svg";
import SecondarySectionIllustration03 from "@/public/static/images/capx_loggedin_home_illustration04.svg";
import BaseButton from "@/components/BaseButton";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSnackbar } from "@/app/providers/SnackbarProvider";
interface AuthenticatedMainSectionProps {
  pageContent: any;
}

export default function AuthenticatedMainSection({
  pageContent,
}: AuthenticatedMainSectionProps) {
  const { isMobile } = useApp();
  const { darkMode } = useTheme();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const secondarySection = isMobile ? (
    <section
      className={`flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 ${
        darkMode ? "bg-capx-dark-bg" : "bg-capx-dark-box-bg"
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between w-full py-16 md:py-32 gap-8">
        <div className="flex flex-col items-center md:items-start w-full md:w-1/2">
          <h1 className="text-capx-light-bg text-center text-[24px] not-italic font-extrabold leading-[29px]">
            {pageContent["body-loggedin-home-secondary-section-title"]}
          </h1>
        </div>
        <button
          className="flex flex-col w-full h-full justify-center items-center"
          onClick={() => router.push("/feed")}
        >
          <Image
            src={SecondarySectionIllustration01}
            alt="Secondary section illustration"
            width={200}
            height={200}
          />
          <p className="text-capx-light-bg text-center text-[24px] not-italic font-normal leading-[29px]">
            {
              pageContent[
                "body-loggedin-home-secondary-section-image01-description"
              ]
            }
          </p>
        </button>
        <button
          className="flex flex-col w-full h-full justify-center items-center"
          onClick={() => router.push("/capacity")}
        >
          <Image
            src={SecondarySectionIllustration02}
            alt="Secondary section illustration"
            width={200}
            height={200}
          />
          <p className="text-capx-light-bg text-center text-[24px] not-italic font-normal leading-[29px]">
            {
              pageContent[
                "body-loggedin-home-secondary-section-image02-description"
              ]
            }
          </p>
        </button>
        <button
          className="flex flex-col w-full h-full justify-center items-center"
          onClick={() => router.push("/feed")}
        >
          <Image
            src={SecondarySectionIllustration03}
            alt="Secondary section illustration"
            width={200}
            height={200}
          />
          <p className="text-capx-light-bg text-center text-[24px] not-italic font-normal leading-[29px]">
            {
              pageContent[
                "body-loggedin-home-secondary-section-image03-description"
              ]
            }
          </p>
        </button>
      </div>
    </section>
  ) : (
    <section
      className={
        (darkMode ? "bg-capx-dark-bg" : "bg-capx-dark-box-bg") +
        "flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto px-8"
      }
    >
      <div className="flex flex-col items-center justify-between w-full py-16 md:py-32 gap-16">
        <div className="flex items-center w-full">
          <h1
            className={
              (darkMode ? "text-[#FFF]" : "text-[#053749]") +
              " font-[Montserrat] text-[72px] not-italic font-extrabold leading-[88px]"
            }
          >
            {pageContent["body-loggedin-home-secondary-section-title"]}
          </h1>
        </div>
        <div className="flex items-center w-full gap-[86px]">
          <div className="flex items-center flex-col gap-[24px]">
            <button
              className="w-full h-full"
              onClick={() => router.push("/feed")}
            >
              <Image
                src={SecondarySectionIllustration01}
                alt="Secondary section illustration"
                width={520}
                height={520}
              />
              <p
                className={
                  (darkMode ? "text-[#FFF]" : "text-[#053749]") +
                  " text-center text-[48px] not-italic font-normal leading-[59px]"
                }
              >
                {
                  pageContent[
                    "body-loggedin-home-secondary-section-image01-description"
                  ]
                }
              </p>
            </button>
          </div>
          <div className="flex items-center flex-col gap-[24px]">
            <button
              className="w-full h-full"
              onClick={() => router.push("/capacity")}
            >
              <Image
                src={SecondarySectionIllustration02}
                alt="Secondary section illustration"
                width={520}
                height={520}
              />
              <p
                className={
                  (darkMode ? "text-[#FFF]" : "text-[#053749]") +
                  " text-center text-[48px] not-italic font-normal leading-[59px]"
                }
              >
                {
                  pageContent[
                    "body-loggedin-home-secondary-section-image02-description"
                  ]
                }
              </p>
            </button>
          </div>
          <div className="flex items-center flex-col gap-[24px]">
            <button
              className="w-full h-full"
              onClick={() => router.push("/feed")}
            >
              <Image
                src={SecondarySectionIllustration03}
                alt="Secondary section illustration"
                width={520}
                height={520}
              />
              <p
                className={
                  (darkMode ? "text-[#FFF]" : "text-[#053749]") +
                  " text-center text-[48px] not-italic font-normal leading-[59px]"
                }
              >
                {
                  pageContent[
                    "body-loggedin-home-secondary-section-image03-description"
                  ]
                }
              </p>
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  if (isMobile) {
    return (
      <>
        <section
          className={
            (darkMode ? "bg-capx-dark-box-bg" : "bg-capx-light-bg") +
            " flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 mt-8"
          }
        >
          <div className="flex flex-col md:flex-row items-center justify-between w-full py-16 md:py-32 gap-8">
            <div className="flex flex-col items-center md:items-start w-full md:w-1/2">
              <h1
                className={
                  (darkMode ? "text-capx-dark-text" : "text-capx-light-text") +
                  " text-center text-[24px] not-italic font-extrabold leading-[29px]"
                }
              >
                {pageContent["body-loggedin-home-main-section-title"]}
              </h1>
              <p
                className={
                  (darkMode ? "text-capx-dark-text" : "text-capx-light-text") +
                  " text-[16px] not-italic font-normal leading-[20px]"
                }
              >
                {pageContent["body-loggedin-home-main-section-description"]}
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <Image
                priority={true}
                src={
                  darkMode
                    ? MainSectionIllustrationDark
                    : MainSectionIllustration
                }
                alt="Main illustration"
                className="w-full h-auto"
              />
            </div>
            <div className="flex flex-row gap-4 w-full justify-center items-center">
              <div className="flex items-center h-full">
                <BaseButton
                  onClick={() => router.push("/capacity")}
                  label={
                    pageContent["body-loggedin-home-main-section-button01"]
                  }
                  customClass="rounded-[6px] bg-[#851970] inline-flex px-[19px] py-[8px] justify-center items-center gap-[10px] text-[#F6F6F6] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
                ></BaseButton>
              </div>
              <BaseButton
                label={pageContent["body-loggedin-home-main-section-button02"]}
                onClick={() => router.push("/profile")}
                customClass="w-fit sm:w-fit rounded-[6px] border-[1px] border-[solid] border-[var(--Backgrounds-dark-box-bg,#053749)] bg-[#FFF] inline-flex px-[16px] py-[8px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
              ></BaseButton>
            </div>
          </div>
        </section>
        {secondarySection}

        <section
          className={
            (darkMode ? "bg-capx-dark-box-bg" : "bg-capx-light-bg") +
            " flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12"
          }
        >
          <div className="flex flex-col md:flex-row items-center justify-between w-full pt-8 md:py-32 gap-8">
            <div className="mx-auto flex flex-col items-center md:items-start w-full md:w-1/2">
            <h1
              className={
                (darkMode ? "text-[#FFF]" : "text-[#053749]") +
                " text-center font-[Montserrat] text-[24px] not-italic font-extrabold "
              }
              >
                {pageContent["body-loggedin-home-third-section-title"]}
              </h1>
              <p
                className={
                  (darkMode ? "text-[#FFF]" : "text-[#053749]") +
                  " text-center font-[Montserrat] text-[16px] not-italic font-normal leading-[normal] my-[24px]"
                }
              >
                {pageContent["body-loggedin-home-third-section-description"]}
              </p>
              <BaseButton
                onClick={() => {
                  navigator.clipboard.writeText("capx@wmnobrasil.org");
                  showSnackbar(pageContent["body-loggedin-home-third-section-button-success"], "success");
                }}
                label={pageContent["body-loggedin-home-third-section-button"]}
                customClass="w-fit sm:w-fit rounded-[6px] bg-[#851970] inline-flex px-[16px] text-white font-bold py-[8px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal]"
              />
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="flex flex-col items-center justify-start w-full mx-auto ">
        <div className="flex flex-row items-center justify-between w-full py-[128px] gap-8 max-w-screen-xl mx-auto px-8">
          <div className="flex flex-col items-center md:items-start w-full md:w-1/2 lg:w-2/3">
            <h1
              className={
                (darkMode ? "text-[#FFF]" : "text-[#053749]") +
                " font-[Montserrat] text-[72px] not-italic font-extrabold leading-[88px]"
              }
            >
              {pageContent["body-loggedin-home-main-section-title"]}
            </h1>
            <p
              className={
                (darkMode ? "text-[#FFF]" : "text-[#053749]") +
                " font-[Montserrat] text-[48px] not-italic font-extrabold leading-[59px]"
              }
            >
              {pageContent["body-loggedin-home-main-section-description"]}
            </p>
            <p
              className={
                (darkMode ? "text-[#FFF]" : "text-[#053749]") +
                " font-[Montserrat] text-[30px] not-italic font-normal leading-[normal] my-[24px]"
              }
            >
              {pageContent["body-home-section01-description"]}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full items-start mt-[24px]">
              <div className="flex items-center h-full">
                <BaseButton
                  onClick={() => router.push("/capacity")}
                  label={
                    pageContent["body-loggedin-home-main-section-button01"]
                  }
                ></BaseButton>
              </div>
              <BaseButton
                label={pageContent["body-loggedin-home-main-section-button02"]}
                customClass="rounded-[6px] border-[1px] border-[solid] border-[var(--Backgrounds-dark-box-bg,#053749)] bg-[#FFF] inline-flex px-[32px] py-[16px] h-[64px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]"
                onClick={() => router.push("/profile")}
              ></BaseButton>
            </div>
          </div>
          <div className="w-1/2 lg:w-1/3">
            <Image
              priority={true}
              src={
                darkMode ? MainSectionIllustrationDark : MainSectionIllustration
              }
              alt="Main illustration"
              height={520}
              width={520}
              className="w-full h-auto"
            />
          </div>
        </div>
        {secondarySection}

        <div className="flex flex-col items-center md:items-start w-full md:w-1/2 lg:w-2/3">
          <h1
            className={
              (darkMode ? "text-[#FFF]" : "text-[#053749]") +
              " font-[Montserrat] text-[48px] not-italic font-extrabold leading-[59px]"
            }
          >
            {pageContent["body-loggedin-home-third-section-title"]}
          </h1>
          <p
            className={
              (darkMode ? "text-[#FFF]" : "text-[#053749]") +
              " font-[Montserrat] text-[30px] not-italic font-normal leading-[normal] my-[24px]"
            }
          >
            {pageContent["body-loggedin-home-third-section-description"]}
          </p>
          <BaseButton
            onClick={() => {
              navigator.clipboard.writeText("capx@wmnobrasil.org");
              showSnackbar(pageContent["body-loggedin-home-third-section-button-success"], "success");
            }}
            label={pageContent["body-loggedin-home-third-section-button"]}
            customClass="rounded-[6px] bg-[#851970] inline-flex px-[32px] py-[16px] text-white font-bold h-[64px] justify-center items-center gap-[8px] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]"
          />
        </div>
      </section>
    </>
  );
}
