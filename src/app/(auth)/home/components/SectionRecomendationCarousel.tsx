'use client';

import { useApp } from '@/contexts/AppContext';
import CardRecomendationCarousel from '@/app/(auth)/home/components/CardCarouselRecomendation';
import { useTheme } from '@/contexts/ThemeContext'
import info_blue from '@/public/static/images/info_blue.svg';
import lamp_purple from '@/public/static/images/lamp_purple.svg';


export default function SectionRecomendationCarousel() {
    const { isMobile } = useApp();
    const { darkMode } = useTheme();

    const noCapacitesSection = isMobile ? (
        //Mobile
        <section
            className={`flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-8 py-8 lg:px-12 ${
                darkMode ? 'bg-capx-dark-bg' : 'bg-[#F6F6F6]'
            }`}
        >
            <div className="flex flex-col items-center justify-center w-full gap-16">
                <div className="flex items-center w-full">
                    <CardRecomendationCarousel 
                        alt="Imagem de produto de contatos" 
                        title= 'Title Test'
                        description= 'Description Test'
                        imageTitle= {info_blue}
                        imageDescription= {lamp_purple}
                        mainImage= {info_blue}
                        imageName= {info_blue}
                        name= 'NAME TEST'
                        labelButtonPrimary= 'Test'
                        labelButtonSecondary= 'Test'
                    />
                </div>
            </div>
        </section>
        ) : (
        //Desktop
        <section
        className={`flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-8 md:mb-[128px] ${
            darkMode ? 'bg-capx-dark-bg' : 'bg-[#F6F6F6]'
        }`}
        >
        <div className="flex flex-col items-center justify-between w-full py-16 gap-16">
            <div className="flex items-center w-full">
                <CardRecomendationCarousel 
                    alt="Imagem de produto de contatos" 
                    title= 'Title Test'
                    description= 'Description Test'
                    imageTitle= {info_blue}
                    imageDescription= {lamp_purple}
                    mainImage= {info_blue}
                    imageName= {info_blue}
                    name= 'NAME TEST'
                    labelButtonPrimary= 'Test'
                    labelButtonSecondary= 'Test'
                />
            </div>
        </div>
        </section>
    );
    return noCapacitesSection;
}
