"use client"
import Image from "next/image";
import IconEncrypted from "@/public/static/images/icon_encrypted.svg";
import IconEncryptedWhite from "@/public/static/images/icon_encrypted_white.svg";
import Link from "next/link";
import PrivacyPolicy from "@/public/static/images/privacy_policy.svg";
import Banner from "@/components/Banner";

import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";

export default function PrivacyPolicyPage(){
    const { darkMode } = useTheme();
    const { pageContent } = useApp();
    const capacityExchangeText = pageContent["privacy-policy-capacity-exchange-text"]?.split(/\$\d/);
    const privateInformationTopic = pageContent["privacy-policy-private-information-topic02"]?.split(/\$\d/);
    const privateInformationText = pageContent["privacy-policy-private-information-text03"]?.split(/\$\d/);

    return (
        <section className="w-full flex flex-col min-h-screen gap-4 pt-24 md:pt-8 mx-auto md:max-w-[1200px]">
            <Banner
                image={PrivacyPolicy}
                title={pageContent["privacy-policy-banner"]}
                alt={pageContent["privacy-policy-alt-banner"]}
            />
            <div className="flex items-start gap-2 text-left pt-6 ">
                <Image
                    src={darkMode ?  IconEncryptedWhite : IconEncrypted}
                    alt={pageContent["privacy-policy-icon"]}
                    className="w-4 h-5 md:w-[42px] md:h-[42px]"
                />
                <h2
                    className={`text-[14px] font-[Montserrat] font-bold md:text-[30px] ${
                    darkMode ? "text-capx-light-bg" : "text-capx-dark-box-bg"
                    }`}
                >
                    {
                        pageContent["privacy-policy-title"]
                    }
                </h2>
            </div>
            <div className="flex items-start text-left">
                <p className={`font-[Montserrat] text-[12px] not-italic font-normal leading-[2] mb-4 md:text-[20px] md:leading-[29px] ${
                    darkMode ? "text-white" : "text-capx-dark-box-bg"
                }`}>
                    {capacityExchangeText ? capacityExchangeText[0] : ""}
                    <Link
                        href={"https://meta.wikimedia.org/wiki/Capacity_Exchange/Network"}
                        className="underline"
                        target="_blank"
                        >
                        {pageContent["privacy-policy-link-wiki-moviment-brazil"]}
                    </Link>
                    {capacityExchangeText ? capacityExchangeText[1] : ""}
                    <Link
                        href={"https://wikitech.wikimedia.org/wiki/Help:Toolforge/Rules"}
                        className="underline"
                        target="_blank"
                        >
                        {pageContent["privacy-policy-link-toolforge"]}
                    </Link>
                    {capacityExchangeText ? capacityExchangeText[2] : ""}
                    <Link 
                        href={"https://wikitech.wikimedia.org/wiki/Wikitech:Cloud_Services_Terms_of_use"}
                        className="underline"
                        target="_blank"
                        >
                        {pageContent["privacy-policy-link-cloud-service-terms-of-use"]}
                    </Link>
                    {capacityExchangeText ? capacityExchangeText[3] : ""}
                </p>
            </div>
            <div className="flex flex-col items-start gap-2 text-left pt-6">
                <h2
                    className={`text-[14px] font-[Montserrat] font-bold md:text-[30px] ${
                    darkMode ? "text-capx-light-bg" : "text-capx-dark-box-bg"
                    }`}
                >
                    {
                        pageContent["privacy-policy-private-information-title"]
                    }
                </h2>
                <div className="flex items-start text-left">
                    <p className={`font-[Montserrat] text-[12px] not-italic font-normal leading-[2] mb-4 md:text-[20px] md:leading-[29px] ${
                    darkMode ? "text-white" : "text-capx-dark-box-bg"
                    }`}>
                    {
                        pageContent["privacy-policy-private-information-intro-topics"]
                    }
                    </p>
                </div>
                <div className="flex flex-col items-start text-left pl-5">
                    <p className={`relative font-[Montserrat] text-[12px] not-italic font-normal leading-[2] mb-4 pl-2 md:text-[20px] md:leading-[29px]  ${
                    darkMode ? "text-white" : "text-capx-dark-box-bg"
                    }`}>
                        <span className="absolute left-0 top-[12px] w-1 h-1 bg-current rounded-full"></span>
                        {pageContent["privacy-policy-private-information-topic01"]}
                        
                    </p>
                    <p className={`relative font-[Montserrat] text-[12px] not-italic font-normal leading-[2] mb-4 pl-2 md:text-[20px] md:leading-[29px] ${
                    darkMode ? "text-white" : "text-capx-dark-box-bg"
                    }`}>
                        <span className="absolute left-0 top-[12px] w-1 h-1 bg-current rounded-full"></span>
                        {privateInformationTopic ? privateInformationTopic[0] : ""}
                        <Link
                            href={"https://www.mediawiki.org/wiki/Help:OAuth"}
                            className="underline"
                            target="_blank"
                            >
                            {pageContent["privacy-policy-private-information-topic02-link"]}
                        </Link>
                        {privateInformationTopic ? privateInformationTopic[1] : ""}
                    </p>
                    <p className={`relative font-[Montserrat] text-[12px] not-italic font-normal leading-[2] mb-4 pl-2 md:text-[20px] md:leading-[29px] ${
                    darkMode ? "text-white" : "text-capx-dark-box-bg"
                    }`}>
                        <span className="absolute left-0 top-[12px] w-1 h-1 bg-current rounded-full"></span>
                        {pageContent["privacy-policy-private-information-topic03"]}
                        
                    </p>
                </div>  
                <div className="flex items-start text-left">
                    <p className={`font-[Montserrat] text-[12px] not-italic font-normal leading-[2] mb-4 md:leading-[29px] md:text-[20px] ${
                    darkMode ? "text-white" : "text-capx-dark-box-bg"
                    }`}>
                    {
                        pageContent["privacy-policy-private-information-text01"]
                    }
                    </p>
                </div>
                <div className="flex items-start text-left">
                    <p className={`font-[Montserrat] text-[12px] not-italic font-normal leading-[2] mb-4 md:leading-[29px] md:text-[20px] ${
                    darkMode ? "text-white" : "text-capx-dark-box-bg"
                    }`}>
                    {
                        pageContent["privacy-policy-private-information-text02"]
                    }
                    </p>
                </div>
                <div className="flex items-start text-left">
                    <p className={`font-[Montserrat] text-[12px] not-italic font-normal leading-[2] mb-4 md:leading-[29px] md:text-[20px] ${
                    darkMode ? "text-white" : "text-capx-dark-box-bg"
                    }`}>
                        {privateInformationText ? privateInformationText[0] : ""}
                        <Link
                            href={"https://wikitech.wikimedia.org/wiki/Wikitech:Cloud_Services_Terms_of_use"}
                            className="underline"
                            target="_blank"
                            >
                            {pageContent["privacy-policy-private-information-text03-link"]}
                        </Link>
                        {privateInformationText ? privateInformationText[1] : ""}
                    </p>
                </div>
            </div>                
        </section>
    )}
