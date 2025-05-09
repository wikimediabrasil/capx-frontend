"use client"

import Banner from "@/components/Banner";
import LetsConect from "@/public/static/images/lets_connect.svg";
import BaseButton from "@/components/BaseButton";
import UserCircleIcon from "@/public/static/images/supervised_user_circle.svg";
import UserCircleIconWhite from "@/public/static/images/supervised_user_circle_white.svg";
import Image from "next/image";
import UserCheckIcon from "@/public/static/images/user_check.svg";
import UserCheckIconDark from "@/public/static/images/user_check_dark.svg";
import ArrowDownIcon from "@/public/static/images/arrow_drop_down_circle.svg";
import ArrowDownIconWhite from "@/public/static/images/arrow_drop_down_circle_white.svg";
import ActionButtons from "@/components/ActionButton";
import SendIcon from "@/public/static/images/send.svg";
import Checklist from "./CheckList";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { LetsConnectFormData, useLetsConnect } from "@/hooks/useLetsConnect";
import { useEffect, useState } from "react";
import { useSnackbar } from "@/app/providers/SnackbarProvider";
import LoadingState from "@/components/LoadingState";

export enum LetsConnectRole {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
}

export default function LetsConnectPage() {
  const { pageContent } = useApp();
  const { darkMode } = useTheme();
  const router = useRouter();
  const { submitLetsConnectForm } = useLetsConnect();
  const { showSnackbar } = useSnackbar();
  const[showMainRoleSelector, setShowMainRoleSelector] = useState(false);

  const letsConnectRoleLabels: Record<string, string> = {
    [LetsConnectRole.A]: pageContent["lets-connect-form-role-a"],
    [LetsConnectRole.B]: pageContent["lets-connect-form-role-b"],
    [LetsConnectRole.C]: pageContent["lets-connect-form-role-c"],
    [LetsConnectRole.D]: pageContent["lets-connect-form-role-d"],
    [LetsConnectRole.E]: pageContent["lets-connect-form-role-e"],
    [LetsConnectRole.F]: pageContent["lets-connect-form-role-f"],
  };  

  const [formData, setFormData] = useState<Partial<LetsConnectFormData>>({
    full_name: "",
    email: "",
    role: "",
    area: "",
    gender: "",
    age: ""
  });

  const handleSubmit = async () => {
  try {
    await submitLetsConnectForm(formData);
    router.back();

    } catch (error) {
      console.error("Error submitting let's connect form:", error);
      showSnackbar("Failed to submit let's connect form", "error");
    }
  };

  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    if (pageContent && Object.keys(pageContent).length > 0) {
      setIsLoading(false);
    }
  }, [pageContent]);

  if (isLoading) {
    return <LoadingState />
  }

  const genderOptions = [
    pageContent["lets-connect-form-gender-prefer-not-say"],
    pageContent["lets-connect-form-gender-man"],
    pageContent["lets-connect-form-gender-woman"],
    pageContent["lets-connect-form-gender-agender"],
    pageContent["lets-connect-form-gender-non-binary"]
  ];
  
  const ageOptions = [
    pageContent["lets-connect-form-age-under-25"],
    pageContent["lets-connect-form-age-25-34"],
    pageContent["lets-connect-form-age-35-44"],
    pageContent["lets-connect-form-age-45-54"],
    pageContent["lets-connect-form-age-55-64"],
    pageContent["lets-connect-form-age-65-74"],
    pageContent["lets-connect-form-age-75-84"],
    pageContent["lets-connect-form-age-85-plus"]
  ];

  return (
    <section className="w-full flex flex-col mx-auto min-h-screen gap-4 pt-24 md:pt-8 px-4 md:px-0 md:max-w-[1200px]">
      <div className={`w-full flex flex-col mx-auto rounded-lg ${
        darkMode
            ? "bg-[#04222F]"
            : "bg-[#EFEFEF]"

        }`}>
        <Banner 
          image={LetsConect}
          alt={pageContent["lets-connect-banner-alt"]}
          customClass={{
            background: "bg-[#EFEFEF]",
            text: "text-[#003649]"
          }}
        />
        <div className="flex flex-col px-4 text-center">
            <h1 className="text-[20px] text-[#04222F] font-[Montserrat] font-bold border-b-2 border-[#04222F] inline-block mx-auto mb-12 md:text-[48px]">
              {pageContent["lets-conect-form-user-edit"]}
            </h1>
            <BaseButton
              onClick={() => router.back()}
              label={pageContent["lets-conect-form-user-button-back-to-user-profile"]}
              customClass={`w-full font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[4px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid] md:px-8 md:py-4 md:text-[24px] md:w-1/3 ${
              darkMode
                ? "border-white text-white bg-[#053749]"
                : "border-[#053749] text-[#053749] bg-[#FFFFFF]"
              } rounded-md py-3 font-bold mb-0`}
              imageUrl={darkMode ? UserCircleIconWhite : UserCircleIcon}
              imageAlt="Cancel icon"
              imageWidth={30}
              imageHeight={30}
            />
            <div className="flex items-start gap-2 text-left mt-6">
                <Image
                    src={darkMode ?  UserCheckIcon : UserCheckIconDark}
                    alt={pageContent["lets-conect-form-heading"]}
                    className="w-4 h-5 md:w-[42px] md:h-[42px]"
                />
                <h1 className={`text-[14px] font-[Montserrat] font-bold md:text-[32px] 
                    ${darkMode 
                        ? "text-[#FFFFFF]"
                        : "text-[#053749]"
                    }`}
                    >
                    {pageContent["lets-conect-form-heading"]}
                </h1>
            </div>

            {/* Full Name Input */}
            <div className="mt-6 ">
                <h4 className={`mb-2 text-[12px] font-[Montserrat] font-bold md:text-[24px] text-start
                    ${darkMode 
                    ? "text-[#FFFFFF]"
                    : "text-[#053749]"
                    }`}
                >
                    {pageContent["lets-conect-form-full-name-optional"]}
                </h4>
                <input
                    type="text"
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
                        darkMode
                        ? "bg-transparent border-[#FFFFFF] text-white"
                        : "border-[#053749] text-[#829BA4]"
                        }`}
                    placeholder={pageContent["lets-conect-form-full-name-placeholder"]}
                /> 
            </div>

            {/* Email Input */}
            <div className="mt-6 mb-6">
                <h4 className={`mb-2 text-[12px] font-[Montserrat] font-bold md:text-[24px] text-start
                    ${darkMode 
                    ? "text-[#FFFFFF]"
                    : "text-[#053749]"
                    }`}
                >
                    {pageContent["lets-conect-form-email"]}
                </h4>
                <input
                    type="text"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
                        darkMode
                            ? "bg-transparent border-[#FFFFFF] text-white"
                            : "border-[#053749] text-[#829BA4]"
                        }`}
                    placeholder={pageContent["lets-conect-form-email-placeholder"]}
                /> 
            </div>

            {/* Roles Input */}
            <div className="mt-2">
                <h4 className={`text-[12px] font-[Montserrat] font-bold mb-2 md:text-[24px] text-start ${
                    darkMode 
                        ? "text-[#FFFFFF]"
                        : "text-[#053749]"
                    }`}
                >
                    {pageContent["lets-connect-form-roles"]}
                </h4>
                <p className={`text-[10px] mt-2 mb-2 md:text-[18px] text-start font-[Montserrat] ${
                        darkMode
                            ? "text-[#829BA4]"
                            : "text-[#053749]"
                    }`}>
                        {pageContent["lets-connect-form-roles-info"]}
                    </p>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowMainRoleSelector(!showMainRoleSelector)}
                        className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
                        darkMode
                            ? "bg-[#04222F] border-[#FFFFFF] text-[#FFFFFF]"
                            : "border-[#053749] text-[#829BA4]"
                        } flex justify-between items-center`}
                    >
                        {formData.role
                            ? formData.role
                            : pageContent["message-form-method-placeholder"]}
                            <Image
                            src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
                            alt="Select"
                            width={20}
                            height={20}
                        />
                    </button>

                    {showMainRoleSelector && (
                        <div
                            className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
                                darkMode
                                ? "bg-[#04222F] border-gray-700"
                                : "bg-[#FFFFFF] border-gray-200"
                            } border`}
                            >
                            {Object.values(LetsConnectRole).map((role) => (
                                <button
                                    key={letsConnectRoleLabels[role]}
                                    className={`block w-full text-left px-4 py-2 text-sm ${
                                        darkMode
                                        ? "text-white hover:bg-[#053749]"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                    onClick={() => {
                                      setFormData({ ...formData, role: letsConnectRoleLabels[role] });
                                      setShowMainRoleSelector(false);
                                    }}
                                    >
                                    {letsConnectRoleLabels[role]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Area Input */}
            <Checklist
              title={pageContent["lets-conect-form-topic-check"]}
              other={pageContent["lets-conect-form-topic-check-other"]}
              description={pageContent["lets-conect-form-topic-check-text"]}
              setFormData={(area: string) => setFormData({ ...formData, area })}
              multiple={true}
              itemsList={[
                "Climate change & sustainability",
                "Public policy",
                "Education",
                "Open technology",
                "Diversity",
                "Culture, heritage, GLAM",
                "Governance",
                "Human rights",
                "Advocacy"
              ]}
              showOther={true}
            />

            {/* Gender Input */}
            <Checklist
              title={pageContent["lets-connect-form-gender-identify"]}
              other={pageContent["lets-connect-form-gender-identify-not-listed"]}
              setFormData={(gender: string) => setFormData({ ...formData, gender })}
              itemsList={genderOptions}
              showOther={true}
            />

            {/* Age Input */}
            <Checklist
              title={pageContent["lets-connect-form-age-range"]}
              other={""}
              setFormData={(age: string) => setFormData({ ...formData, age })}
              itemsList={ageOptions}
            />
        </div>
    </div>
    <ActionButtons
      handleAhead={handleSubmit}
      labelButtonAhead={pageContent["lets-connect-register-button"]}
      iconAhead={SendIcon}
      iconAltAhead={pageContent["lets-connect-register-alt-icon"]}
      labelButtonBack={pageContent["lets-connect-back-button"]}
      iconBack={UserCircleIcon}
      iconAltBack={pageContent["lets-connect-back-button-alt"]}
    />
  </section>
  );
};
