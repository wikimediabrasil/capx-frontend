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

import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useSession } from "next-auth/react";

import { useMessage } from "@/hooks/useMessage";
import Checklist from "./CheckList";

interface LetsConnectPageProps {
  prop1: boolean;
  prop2: boolean;
}

export default function LetsConnectPage({ prop1, prop2 }: LetsConnectPageProps) {
    const { pageContent } = useApp();
    const { darkMode } = useTheme();
    const router = useRouter();
    const { data: session } = useSession();
    // const [formData, setFormData] = useState<Partial<Message>>({
    //     receiver: "",
    //     subject: "",
    //     message: "",
    //     method: "",
    // });

    // const {
    //     showMethodSelector,
    //     setShowMethodSelector,
    //   } = useMessage();

    // const handleSubmit = async () => {
    // setShowInfoMessagePopup(false);
    // try {
    //     await sendMessage(formData);
    //     setShowSuccessPopup(true);
    //     setFormData({
    //     receiver: "",
    //     subject: "",
    //     message: "",
    //     method: "",
    //     });

    // } catch (error) {
    //     console.error("Error sending message:", error);
    //     showSnackbar("Failed to send message", "error");
    // }
    // };      

    return (
        <section className="w-full flex flex-col mx-auto min-h-screen gap-4 pt-24 md:pt-8 px-4 md:px-0">
            <div className={`w-full flex flex-col mx-auto rounded-lg md:max-w-[1200px] ${
                darkMode
                    ? "bg-[#04222F]"
                    : "bg-[#EFEFEF]"

                }`}>
                <Banner 
                    image={LetsConect}
                    alt={pageContent["message-alt-banner"]}
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
                            id="to"
                            // value={formData.receiver}
                            // onChange={(e) =>
                            //     setFormData({ ...formData, receiver: e.target.value })
                            // }
                            className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
                                darkMode
                                ? "bg-transparent border-[#FFFFFF] text-white"
                                : "border-[#053749] text-[#829BA4]"
                                }`}
                            placeholder={pageContent["lets-conect-form-full-name-placeholder"]}
                        /> 
                    </div>
                    <div className="mt-6 mb-6">
                        <h4 className={`mb-2 text-[12px] font-[Montserrat] font-bold md:text-[24px] text-start
                            ${darkMode 
                            ? "text-[#FFFFFF]"
                            : "text-[#053749]"
                            }`}
                        >
                            {pageContent["lets-conect-form-full-name-email"]}
                        </h4>
                        <input
                            type="text"
                            id="to"
                            // value={formData.receiver}
                            // onChange={(e) =>
                            //     setFormData({ ...formData, receiver: e.target.value })
                            // }
                            className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
                                darkMode
                                    ? "bg-transparent border-[#FFFFFF] text-white"
                                    : "border-[#053749] text-[#829BA4]"
                                }`}
                            placeholder={pageContent["lets-conect-form-full-name-email-placeholder"]}
                        /> 
                    </div>
                    {/* <div className="mt-2">
                        <h4 className={`text-[12px] font-[Montserrat] font-bold mb-2 md:text-[24px] text-start ${
                            darkMode 
                                ? "text-capx-light-bg" 
                                : "text-[#507380]"
                            }`}
                        >
                            {pageContent["message-form-method"]}
                        </h4>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowMethodSelector(!showMethodSelector)}
                                className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
                                darkMode
                                    ? "bg-[#04222F] border-[#FFFFFF] text-[#FFFFFF]"
                                    : "border-[#053749] text-[#829BA4]"
                                } flex justify-between items-center`}
                            >
                                {formData.method
                                    ? formData.method
                                    : pageContent["message-form-method-placeholder"]}
                                    <Image
                                    src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
                                    alt="Select"
                                    width={20}
                                    height={20}
                                />
                            </button>

                            {showMethodSelector && (
                                <div
                                    className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
                                        darkMode
                                        ? "bg-[#04222F] border-gray-700"
                                        : "bg-[#FFFFFF] border-gray-200"
                                    } border`}
                                    >
                                    {Object.values(MessageMethod).map((method) => (
                                        <button
                                            key={method}
                                            className={`block w-full text-left px-4 py-2 text-sm ${
                                                darkMode
                                                ? "text-white hover:bg-[#053749]"
                                                : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                            onClick={() => {
                                                setFormData({ ...formData, method });
                                                setShowMethodSelector(false);
                                            }}
                                            >
                                            {messageMethodLabels[method]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div> */}
                    <Checklist
                        title={pageContent["lets-conect-form-full-name-topic-check"]}
                        other={pageContent["lets-conect-form-full-name-topic-check-other"]}
                        description={pageContent["lets-conect-form-full-name-topic-check-text"]}
                        initialItems={["Skate", "Surf", "Motocross"]}
                        showOther={true}
                    />
                    <div className="mt-6 mb-6">
                        <h4 className={`mb-2 text-[12px] font-[Montserrat] font-bold md:text-[24px] text-start
                            ${darkMode 
                            ? "text-[#FFFFFF]"
                            : "text-[#053749]"
                            }`}
                        >
                            {pageContent["lets-conect-form-full-name-email"]}
                        </h4>
                        <input
                            type="text"
                            id="to"
                            // value={formData.receiver}
                            // onChange={(e) =>
                            //     setFormData({ ...formData, receiver: e.target.value })
                            // }
                            className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
                                darkMode
                                    ? "bg-transparent border-[#FFFFFF] text-white"
                                    : "border-[#053749] text-[#829BA4]"
                                }`}
                            placeholder={pageContent["lets-conect-form-full-name-email-placeholder"]}
                        /> 
                    </div>                    
                </div>
            </div>
        </section>
    );
};
