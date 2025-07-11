import Image from 'next/image';
import TabletIllustration from '@/public/static/images/tablet_illustration.svg';
import TabletIllustrationWhite from '@/public/static/images/tablet_illustration_white.svg';
import CapxPencilIllustration from '@/public/static/images/capx_pencil_illustration.svg';
import VideoThumbnail from '@/public/static/images/thumbnail.svg';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';
import Popup from './Popup';

export default function VideoSection() {
  const { isMobile, pageContent } = useApp();
  const { darkMode } = useTheme();
  const videoUrl =
    'https://upload.wikimedia.org/wikipedia/commons/5/59/Meet_the_Capacity_Exchange.webm';

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

  const tabletIllusttration = darkMode ? TabletIllustrationWhite : TabletIllustration;

  if (isMobile) {
    return (
      <section
        className={`w-full pt-12 border-b ${
          darkMode
            ? 'border-capx-light-bg bg-capx-dark-box-bg'
            : 'border-capx-secondary-purple bg-capx-light-bg'
        }`}
        id="video-section"
      >
        <div className="flex flex-col justify-center items-center">
          <h1
            className={`font-[Montserrat] text-[20px] not-italic font-extrabold leading-[normal] ${
              darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
            } mb-8`}
          >
            {pageContent['body-home-video-section-title']}
          </h1>
        </div>

        <div className="flex justify-center items-center mx-4 relative" onClick={handleOpenPopup}>
          <div className="relative w-full max-w-[600px] mb-8 ">
            <Image
              src={tabletIllusttration}
              alt={pageContent["alt-illustration"] || "Tablet showing video content"}
              layout="responsive"
              className="w-full h-auto"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[84%] h-[100%]">
                {darkMode ? (
                  <></>
                ) : (
                  <Image
                    src={VideoThumbnail}
                    alt={pageContent["alt-illustration"] || "Video thumbnail showing CapX introduction"}
                    className="object-contain w-full h-full"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {isPopupOpen && (
          <Popup onClose={handleClosePopup} title={pageContent['body-home-video-section-title']}>
            <div className="w-full h-full relative">
              <video controls className="w-full h-full object-fill" playsInline preload="metadata">
                <source src={videoUrl} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          </Popup>
        )}
      </section>
    );
  }

  return (
    <section
      className={`w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-16 ${
        darkMode
          ? 'border-capx-light-bg bg-capx-dark-box-bg'
          : 'border-capx-secondary-purple bg-capx-light-bg'
      }`}
      id="video-section"
    >
      <div className="flex flex-col justify-center items-center sm:items-start !ml-0 sm:ml-20 h-[230px]">
        <h1
          className={`font-[Montserrat] text-[36px] not-italic font-extrabold leading-[normal] ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {pageContent['body-home-video-section-title']}
        </h1>
      </div>

      <div className="w-full mb-8 flex justify-center items-center mt-6">
        <div className="w-[35%] flex justify-around items-center mr-6">
          <div className="relative w-[335px] h-[450px] sm:w-w-[251px] sm:h-[338px]">
            <Image src={CapxPencilIllustration} alt="Capx pencil illustration" />
          </div>
        </div>
        <div className="w-[65%] flex justify-center items-center relative">
          <div className="relative w-[1000px] h-[500px]">
            <Image
              src={tabletIllusttration}
              alt="Tablet illustration"
              layout="fill"
              style={{ objectFit: 'contain' }}
              className="absolute inset-0"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[100%] h-[55%] mx-[10%] lg:h-[60%] lg:w-[100%] lg:mx-[20%] relative">
                <video
                  controls
                  className="w-full h-full object-cover"
                  playsInline
                  preload="metadata"
                >
                  <source src={videoUrl} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
