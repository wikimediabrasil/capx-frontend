"use client"

import Banner from "@/components/Banner";
import NavBarContactPage from "./NavBar";
import ContactBanner from "@/public/static/images/contact.svg";
import { useApp } from "@/contexts/AppContext";

export default function MessagePage() {
    const { pageContent } = useApp();

    return (
        <section className="w-full flex flex-col min-h-screen gap-4 pt-24 md:pt-8 mx-auto md:max-w-[1200px]">
            <Banner 
                image={ContactBanner}
                title={pageContent["contact-banner-page"]}
                alt={pageContent["contact-alt-banner"]}
            />
            <NavBarContactPage />
        </section>
    )
}
