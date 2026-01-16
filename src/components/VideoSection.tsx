import Image from 'next/image';
import { useApp } from '@/contexts/AppContext';
import TabletIllustration from '@/public/static/images/tablet_illustration.svg';
import TabletIllustrationWhite from '@/public/static/images/tablet_illustration_white.svg';
import CapxPencilIllustration from '@/public/static/images/capx_pencil_illustration.svg';
import VideoThumbnail from '@/public/static/images/thumbnail.svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';
import Popup from './Popup';
import BaseButton from './BaseButton';

export default function VideoSection() {
  const { isMobile, pageContent } = useApp();
  const { darkMode } = useTheme();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const videoUrl =
    'https://upload.wikimedia.org/wikipedia/commons/5/59/Meet_the_Capacity_Exchange.webm';

  const captionsUrl = '/static/captions/capacity-exchange.vtt';
  const _transcriptUrl = '/static/captions/capacity-exchange.txt';

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);
  const handleToggleTranscript = () => setShowTranscript(!showTranscript);

  const tabletIllusttration = darkMode ? TabletIllustrationWhite : TabletIllustration;

  // Transcript content (fallback if the file doesn't load)
  const defaultTranscriptContent =
    'This video introduces the Capacity Exchange platform, explaining how it connects Wikimedia volunteers and organizations to share skills and knowledge. The platform facilitates learning, collaboration, and capacity building within the Wikimedia movement. The video demonstrates the key features and benefits of the platform for the Wikimedia community.';

  // Conditional rendering based on isMobile
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

        <div
          className="flex justify-center items-center mx-4 relative"
          onClick={handleOpenPopup}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenPopup();
            }
          }}
          aria-label={pageContent['aria-label-open-video'] || 'Click to open video player'}
        >
          <div className="relative w-full max-w-[600px] mb-8 ">
            <Image
              src={tabletIllusttration}
              alt={pageContent['alt-tablet-illustration'] || 'Tablet showing video content'}
              width={600}
              height={400}
              className="w-full h-auto"
              style={{ width: '100%', height: 'auto' }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[84%] h-[100%]">
                {darkMode ? (
                  <></>
                ) : (
                  <Image
                    src={VideoThumbnail}
                    alt={
                      pageContent['alt-video-thumbnail'] ||
                      'Video thumbnail showing CapX introduction'
                    }
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
              <video
                controls
                className="w-full h-full object-fill"
                playsInline
                preload="metadata"
                aria-label={
                  pageContent['aria-label-video-player'] || 'Capacity Exchange introduction video'
                }
                muted={false}
                controlsList="nodownload"
              >
                <source src={videoUrl} type="video/webm" />
                <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />
                <track
                  kind="descriptions"
                  src={captionsUrl}
                  srcLang="en"
                  label="English Audio Description"
                />
                <p className="text-sm text-gray-600 mt-2">
                  {pageContent['video-fallback-message'] ||
                    'Your browser does not support the video tag. Please use a modern browser to view this video.'}
                </p>
              </video>

              {/* Botão para mostrar transcrição */}
              <div className="mt-4 flex justify-center">
                <BaseButton
                  onClick={handleToggleTranscript}
                  label={
                    showTranscript
                      ? pageContent['video-hide-transcript'] || 'Hide Transcript'
                      : pageContent['video-show-transcript'] || 'Show Transcript'
                  }
                  customClass="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  aria-label={
                    pageContent['aria-label-toggle-transcript'] || 'Toggle video transcript'
                  }
                />
              </div>

              {/* Transcrição do vídeo */}
              {showTranscript && (
                <div
                  className="mt-4 p-4 bg-gray-100 rounded max-h-60 overflow-y-auto"
                  role="region"
                  aria-label={pageContent['aria-label-video-transcript'] || 'Video transcript'}
                >
                  <h3 className="font-bold mb-2">
                    {pageContent['video-transcript-title'] || 'Video Transcript'}
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {defaultTranscriptContent}
                  </p>
                  <p className="text-sm mt-2 text-gray-600">
                    {pageContent['video-transcript-duration'] ||
                      'Video duration: 2 minutes 30 seconds'}
                  </p>
                </div>
              )}
            </div>
          </Popup>
        )}
      </section>
    );
  }

  // Desktop rendering
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
          <div className="relative w-[335px] sm:w-[251px]">
            <Image
              src={CapxPencilIllustration}
              alt="Capx pencil illustration"
              width={335}
              height={450}
              className="w-full"
              style={{ height: 'auto' }}
            />
          </div>
        </div>
        <div className="w-[65%] flex justify-center items-center relative">
          <div className="relative w-[1000px] h-[500px]">
            <Image
              src={tabletIllusttration}
              alt="Tablet illustration"
              fill
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
                  aria-label={
                    pageContent['aria-label-video-player'] || 'Capacity Exchange introduction video'
                  }
                  muted={false}
                  controlsList="nodownload"
                >
                  <source src={videoUrl} type="video/webm" />
                  <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />
                  <track
                    kind="descriptions"
                    src={captionsUrl}
                    srcLang="en"
                    label="English Audio Description"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {pageContent['video-fallback-message'] ||
                      'Your browser does not support the video tag. Please use a modern browser to view this video.'}
                  </p>
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript always visible in desktop version */}
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div
          className="p-6 bg-gray-50 rounded-lg border"
          role="region"
          aria-label={pageContent['aria-label-video-transcript'] || 'Video transcript'}
        >
          <h3 className="font-bold text-lg mb-4">
            {pageContent['video-transcript-title'] || 'Video Transcript'}
          </h3>
          <p className="text-sm leading-relaxed whitespace-pre-line">{defaultTranscriptContent}</p>
          <p className="text-sm mt-4 text-gray-600">
            {pageContent['video-transcript-duration'] || 'Video duration: 2 minutes 30 seconds'}
          </p>
        </div>
      </div>
    </section>
  );
}
