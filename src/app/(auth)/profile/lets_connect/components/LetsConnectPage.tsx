'use client';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import ActionButtons from '@/components/ActionButton';
import Banner from '@/components/Banner';
import BaseButton from '@/components/BaseButton';
import LoadingState from '@/components/LoadingState';
import Popup from '@/components/Popup';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLetsConnect } from '@/hooks/useLetsConnect';
import { useProfile } from '@/hooks/useProfile';
import ArrowDownIcon from '@/public/static/images/arrow_drop_down_circle.svg';
import ArrowDownIconWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';
import EditIcon from '@/public/static/images/edit.svg';
import EditIconWhite from '@/public/static/images/edit_white.svg';
import LetsConectBanner from '@/public/static/images/lets_connect_desktop.svg';
import LetsConnectPopup from '@/public/static/images/lets_connect_popup.svg';
import LetsConectTextDesktop from '@/public/static/images/lets_connect_text_desktop.svg';
import LetsConectText from '@/public/static/images/lets_connect_text_img.svg';
import SendIcon from '@/public/static/images/send.svg';
import UserCircleIcon from '@/public/static/images/supervised_user_circle.svg';
import UserCircleIconWhite from '@/public/static/images/supervised_user_circle_white.svg';
import UserCheckIcon from '@/public/static/images/user_check.svg';
import UserCheckIconDark from '@/public/static/images/user_check_dark.svg';
import { LetsConnect } from '@/types/lets_connect';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Checklist from './CheckList';
import en from 'locales/en.json';
import { useLetsConnectExists } from '@/hooks/useLetsConnectExists';

export enum LetsConnectRole {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
}

export default function LetsConnectPage() {
  const { pageContent, isMobile } = useApp();
  const { hasLetsConnectAccount } = useLetsConnectExists();

  const { darkMode } = useTheme();
  const router = useRouter();
  const { submitLetsConnectForm } = useLetsConnect();
  const { showSnackbar } = useSnackbar();
  const [showMainRoleSelector, setShowMainRoleSelector] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showFullNameInput, setShowFullNameInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showAreaInput, setAreaInput] = useState(false);
  const [showGenderInput, setGenderInput] = useState(false);
  const [showAgeInput, setAgeInput] = useState(false);
  const [showRoleInput, setShowRoleInput] = useState(false);

  const letsConnectRoleLabels: Record<string, string> = {
    [LetsConnectRole.A]: pageContent['lets-connect-form-role-a'],
    [LetsConnectRole.B]: pageContent['lets-connect-form-role-b'],
    [LetsConnectRole.C]: pageContent['lets-connect-form-role-c'],
    [LetsConnectRole.D]: pageContent['lets-connect-form-role-d'],
    [LetsConnectRole.E]: pageContent['lets-connect-form-role-e'],
    [LetsConnectRole.F]: pageContent['lets-connect-form-role-f'],
  };

  const [formData, setFormData] = useState<Partial<LetsConnect>>({});

  const infoPopupText = pageContent['lets-connect-info-popup-message']?.split(/\$\d/);

  // Function to translate values to english using the en.json file
  const translateToEnglish = (value: string, type: 'role' | 'gender' | 'area'): string => {
    // Map the keys of pageContent to the keys of en.json
    const keyMapping: Record<string, string> = {
      // Role mappings
      [pageContent['lets-connect-form-role-a']]: 'lets-connect-form-role-a',
      [pageContent['lets-connect-form-role-b']]: 'lets-connect-form-role-b',
      [pageContent['lets-connect-form-role-c']]: 'lets-connect-form-role-c',
      [pageContent['lets-connect-form-role-d']]: 'lets-connect-form-role-d',
      [pageContent['lets-connect-form-role-e']]: 'lets-connect-form-role-e',
      [pageContent['lets-connect-form-role-f']]: 'lets-connect-form-role-f',

      // Gender mappings
      [pageContent['lets-connect-form-gender-prefer-not-say']]:
        'lets-connect-form-gender-prefer-not-say',
      [pageContent['lets-connect-form-gender-man']]: 'lets-connect-form-gender-man',
      [pageContent['lets-connect-form-gender-woman']]: 'lets-connect-form-gender-woman',
      [pageContent['lets-connect-form-gender-agender']]: 'lets-connect-form-gender-agender',
      [pageContent['lets-connect-form-gender-non-binary']]: 'lets-connect-form-gender-non-binary',

      // Area mappings
      [pageContent['lets-connect-form-area-climate-change']]:
        'lets-connect-form-area-climate-change',
      [pageContent['lets-connect-form-area-public-policy']]: 'lets-connect-form-area-public-policy',
      [pageContent['lets-connect-form-area-education']]: 'lets-connect-form-area-education',
      [pageContent['lets-connect-form-area-open-technology']]:
        'lets-connect-form-area-open-technology',
      [pageContent['lets-connect-form-area-diversity']]: 'lets-connect-form-area-diversity',
      [pageContent['lets-connect-form-area-culture-heritage-glam']]:
        'lets-connect-form-area-culture-heritage-glam',
      [pageContent['lets-connect-form-area-governance']]: 'lets-connect-form-area-governance',
      [pageContent['lets-connect-form-area-human-rights']]: 'lets-connect-form-area-human-rights',
      [pageContent['lets-connect-form-area-advocacy']]: 'lets-connect-form-area-advocacy',
    };

    const englishKey = keyMapping[value];
    if (englishKey && en[englishKey]) {
      return en[englishKey];
    }

    // Fallback: return the original value if no translation is found
    return value;
  };

  const handleContinueInfoPopup = () => {
    setShowInfoPopup(true);
  };

  const handleCloseInfoPopup = () => {
    setShowInfoPopup(false);
  };

  const handleSubmit = async () => {
    try {
      // Translate the form data to english before submitting
      const translatedFormData = {
        ...formData,
        role: formData.role ? translateToEnglish(formData.role, 'role') : undefined,
        gender: formData.gender ? translateToEnglish(formData.gender, 'gender') : undefined,
        area: formData.area ? translateToEnglish(formData.area, 'area') : undefined,
      };

      await submitLetsConnectForm(translatedFormData);
      setShowInfoPopup(false);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Error submitting let's connect form:", error);
      showSnackbar("Failed to submit let's connect form", 'error');
    }
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pageContent && Object.keys(pageContent).length > 0) {
      setIsLoading(false);
    }
  }, [pageContent]);

  if (isLoading) {
    return <LoadingState fullScreen={true} />;
  }

  const genderOptions = [
    pageContent['lets-connect-form-gender-prefer-not-say'],
    pageContent['lets-connect-form-gender-man'],
    pageContent['lets-connect-form-gender-woman'],
    pageContent['lets-connect-form-gender-agender'],
    pageContent['lets-connect-form-gender-non-binary'],
  ];

  const ageOptions = [
    pageContent['lets-connect-form-age-under-25'],
    pageContent['lets-connect-form-age-25-34'],
    pageContent['lets-connect-form-age-35-44'],
    pageContent['lets-connect-form-age-45-54'],
    pageContent['lets-connect-form-age-55-64'],
    pageContent['lets-connect-form-age-65-74'],
    pageContent['lets-connect-form-age-75-84'],
    pageContent['lets-connect-form-age-85-plus'],
  ];

  const areaOptions = [
    pageContent['lets-connect-form-area-climate-change'],
    pageContent['lets-connect-form-area-public-policy'],
    pageContent['lets-connect-form-area-education'],
    pageContent['lets-connect-form-area-open-technology'],
    pageContent['lets-connect-form-area-diversity'],
    pageContent['lets-connect-form-area-culture-heritage-glam'],
    pageContent['lets-connect-form-area-governance'],
    pageContent['lets-connect-form-area-human-rights'],
    pageContent['lets-connect-form-area-advocacy'],
  ];

  return (
    <section className="w-full flex flex-col mx-auto min-h-screen gap-4 pt-24 md:pt-8 px-4 md:px-0 md:max-w-[1200px]">
      <div
        className={`w-full p-4 flex flex-col mx-auto rounded-lg ${
          darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'
        }`}
      >
        <Banner
          image={LetsConectBanner}
          alt={pageContent['lets-connect-alt-banner']}
          title={{
            desktop: LetsConectTextDesktop,
            mobile: LetsConectText,
          }}
          customClass={{
            background: 'bg-[#EFEFEF]',
            text: 'text-[#122D4C]',
          }}
        />
        <div className="flex flex-col text-center mt-4">
          <BaseButton
            onClick={() => router.back()}
            label={pageContent['lets-connect-form-user-button-back-to-user-profile']}
            customClass={`w-full font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[4px] pb-[4px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid] md:px-8 md:py-4 md:text-[24px] md:w-1/3 ${
              darkMode
                ? 'border-white text-white bg-[#053749]'
                : 'border-[#053749] text-[#053749] bg-[#FFFFFF]'
            } rounded-md py-3 font-bold mb-0`}
            imageUrl={darkMode ? UserCircleIconWhite : UserCircleIcon}
            imageAlt="Cancel icon"
            imageWidth={isMobile ? 20 : 30}
            imageHeight={isMobile ? 20 : 30}
          />

          {/*Informative text*/}
          {hasLetsConnectAccount && (
            <div className="mt-6 mb-2">
              <p
                className={`mt-1 text-[10px] md:text-[20px] text-left ${
                  darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'
                }`}
              >
                {pageContent['lets-connect-form-informative-text']}
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 text-left mt-6">
            <Image
              src={darkMode ? UserCheckIcon : UserCheckIconDark}
              alt={pageContent['lets-connect-form-heading']}
              className="w-4 h-5 md:w-[42px] md:h-[42px]"
            />
            <h1
              className={`text-[14px] font-[Montserrat] font-bold md:text-[32px]
                  ${darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'}`}
            >
              {pageContent['lets-connect-form-heading']}
            </h1>
          </div>

          {/* Full Name Input */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4
                className={`text-[12px] font-[Montserrat] font-bold md:text-[24px] text-start
                  ${darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'}`}
              >
                {pageContent['lets-connect-form-full-name-optional']}
              </h4>
              {hasLetsConnectAccount && !showFullNameInput && (
                <BaseButton
                  onClick={() => setShowFullNameInput(true)}
                  label={pageContent['lets-connect-form-edit-inputs']}
                  customClass={`w-fit flex ${
                    darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
                  } rounded-md font-[Montserrat] text-[10px] font-extrabold leading-normal px-[13px] py-[4px] pb-[4px] items-center gap-[4px] md:text-[24px] md:px-4 md:py-2`}
                  imageUrl={darkMode ? EditIcon : EditIconWhite}
                  imageAlt="Edit icon"
                  imageWidth={isMobile ? 15 : 30}
                  imageHeight={isMobile ? 15 : 30}
                />
              )}
            </div>
          </div>

          {(showFullNameInput || !hasLetsConnectAccount) && (
            <input
              type="text"
              id="full_name"
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
                darkMode
                  ? 'bg-transparent border-[#FFFFFF] text-white'
                  : 'border-[#053749] text-[#829BA4]'
              }`}
              placeholder={pageContent['lets-connect-form-full-name-placeholder']}
            />
          )}

          {/* Email Input */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4
                className={`text-[12px] font-[Montserrat] font-bold md:text-[24px] text-start
                  ${darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'}`}
              >
                {pageContent['lets-connect-form-email']}
              </h4>
              {hasLetsConnectAccount && !showEmailInput && (
                <BaseButton
                  onClick={() => setShowEmailInput(true)}
                  label={pageContent['lets-connect-form-edit-inputs']}
                  customClass={`w-fit flex ${
                    darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
                  } rounded-md font-[Montserrat] text-[10px] font-extrabold leading-normal px-[13px] py-[4px] pb-[4px] items-center gap-[4px] md:text-[24px] md:px-4 md:py-2`}
                  imageUrl={darkMode ? EditIcon : EditIconWhite}
                  imageAlt="Edit icon"
                  imageWidth={isMobile ? 15 : 30}
                  imageHeight={isMobile ? 15 : 30}
                />
              )}
            </div>
          </div>

          {(showEmailInput || !hasLetsConnectAccount) && (
            <input
              type="text"
              id="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
                darkMode
                  ? 'bg-transparent border-[#FFFFFF] text-white'
                  : 'border-[#053749] text-[#829BA4]'
              }`}
              placeholder={pageContent['lets-connect-form-email-placeholder']}
            />
          )}

          {/* Roles Input */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div
                className={`${showRoleInput || !hasLetsConnectAccount ? 'w-full' : 'w-[75%]'} md:w-[75%]`}
              >
                <h4
                  className={`text-[12px] font-[Montserrat] font-bold md:text-[24px] text-start
                    ${darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'}`}
                >
                  {pageContent['lets-connect-form-roles']}
                </h4>
              </div>

              {hasLetsConnectAccount && !showRoleInput && (
                <BaseButton
                  onClick={() => setShowRoleInput(true)}
                  label={pageContent['lets-connect-form-edit-inputs']}
                  customClass={`w-[66px] h-[23px] md:w-fit md:h-auto flex ${
                    darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
                  } rounded-md font-[Montserrat] text-[10px] font-extrabold leading-normal px-[13px] py-[4px] pb-[4px] items-center gap-[4px] md:text-[24px] md:px-4 md:py-2`}
                  imageUrl={darkMode ? EditIcon : EditIconWhite}
                  imageAlt="Edit icon"
                  imageWidth={isMobile ? 15 : 30}
                  imageHeight={isMobile ? 15 : 30}
                />
              )}
            </div>

            {(showRoleInput || !hasLetsConnectAccount) && (
              <>
                <p
                  className={`text-[10px] mt-2 mb-2 md:text-[18px] text-start font-[Montserrat] ${
                    darkMode ? 'text-[#829BA4]' : 'text-[#053749]'
                  }`}
                >
                  {pageContent['lets-connect-form-roles-info']}
                </p>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMainRoleSelector(!showMainRoleSelector)}
                    className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
                      darkMode
                        ? 'bg-[#04222F] border-[#FFFFFF] text-[#FFFFFF]'
                        : `border-[#053749] ${formData.role ? 'text-[#053749]' : 'text-[#829BA4]'}`
                    } flex justify-between items-center`}
                  >
                    {formData.role ? formData.role : pageContent['message-form-method-placeholder']}
                    <Image
                      src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
                      alt="Select"
                      width={20}
                      height={20}
                    />
                  </button>

                  {showMainRoleSelector && (
                    <div
                      className={`absolute z-10 w-full mt-1 rounded-md shadow-lg border ${
                        darkMode ? 'bg-[#04222F] border-gray-700' : 'bg-[#FFFFFF] border-gray-200'
                      }`}
                    >
                      {Object.values(LetsConnectRole).map(role => (
                        <button
                          key={letsConnectRoleLabels[role]}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            darkMode
                              ? 'text-white hover:bg-[#053749]'
                              : 'text-gray-700 hover:bg-gray-100'
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
              </>
            )}
          </div>

          {/* Area Input */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="w-[75%] md:w-[75%]">
                <h4
                  className={`text-[12px] font-[Montserrat] font-bold md:text-[24px] text-start break-words
                    ${darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'}`}
                >
                  {pageContent['lets-connect-form-topic-check']}
                </h4>
              </div>
              {hasLetsConnectAccount && !showAreaInput && (
                <div className="flex-shrink-0">
                  <BaseButton
                    onClick={() => setAreaInput(true)}
                    label={pageContent['lets-connect-form-edit-inputs']}
                    customClass={`w-[66px] h-[23px] md:w-fit md:h-auto flex ${
                      darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
                    } rounded-md font-[Montserrat] text-[10px] font-extrabold leading-normal px-[13px] py-[4px] pb-[4px] items-center gap-[4px] md:text-[24px] md:px-4 md:py-2`}
                    imageUrl={darkMode ? EditIcon : EditIconWhite}
                    imageAlt="Edit icon"
                    imageWidth={isMobile ? 15 : 30}
                    imageHeight={isMobile ? 15 : 30}
                  />
                </div>
              )}
            </div>
          </div>

          {(showAreaInput || !hasLetsConnectAccount) && (
            <Checklist
              value={formData.area}
              description={pageContent['lets-connect-form-topic-check-text']}
              onChange={(area: string) => setFormData({ ...formData, area })}
              itemsList={areaOptions}
              other={pageContent['lets-connect-form-topic-check-other']}
              showOther={true}
              multiple={true}
            />
          )}

          {/* Gender Input */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="w-[65%] md:w-[75%]">
                <h4
                  className={`text-[12px] font-[Montserrat] font-bold md:text-[24px] text-start
                    ${darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'}`}
                >
                  {pageContent['lets-connect-form-gender-identify']}
                </h4>
              </div>
              {hasLetsConnectAccount && !showGenderInput && (
                <BaseButton
                  onClick={() => setGenderInput(true)}
                  label={pageContent['lets-connect-form-edit-inputs']}
                  customClass={`w-[66px] h-[23px] md:w-fit md:h-auto flex ${
                    darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
                  } rounded-md font-[Montserrat] text-[10px] font-extrabold leading-normal px-[13px] py-[4px] pb-[4px] items-center gap-[4px] md:text-[24px] md:px-4 md:py-2`}
                  imageUrl={darkMode ? EditIcon : EditIconWhite}
                  imageAlt="Edit icon"
                  imageWidth={isMobile ? 15 : 30}
                  imageHeight={isMobile ? 15 : 30}
                />
              )}
            </div>
          </div>

          {(showGenderInput || !hasLetsConnectAccount) && (
            <Checklist
              value={formData.gender}
              onChange={(gender: string) => setFormData({ ...formData, gender })}
              itemsList={genderOptions}
              other={pageContent['lets-connect-form-gender-identify-not-listed']}
              showOther={true}
            />
          )}

          {/* Age Input */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="w-[65%] md:w-[75%]">
                <h4
                  className={`text-[12px] font-[Montserrat] font-bold md:text-[24px] text-start
                    ${darkMode ? 'text-[#FFFFFF]' : 'text-[#053749]'}`}
                >
                  {pageContent['lets-connect-form-age-range']}
                </h4>
              </div>
              {hasLetsConnectAccount && !showAgeInput && (
                <BaseButton
                  onClick={() => setAgeInput(true)}
                  label={pageContent['lets-connect-form-edit-inputs']}
                  customClass={`w-[66px] h-[23px] md:w-fit md:h-auto flex ${
                    darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white'
                  } rounded-md font-[Montserrat] text-[10px] font-extrabold leading-normal px-[13px] py-[4px] pb-[4px] items-center gap-[4px] md:text-[24px] md:px-4 md:py-2`}
                  imageUrl={darkMode ? EditIcon : EditIconWhite}
                  imageAlt="Edit icon"
                  imageWidth={isMobile ? 15 : 30}
                  imageHeight={isMobile ? 15 : 30}
                />
              )}
            </div>
          </div>

          {(showAgeInput || !hasLetsConnectAccount) && (
            <Checklist
              value={formData.age}
              onChange={(age: string) => setFormData({ ...formData, age })}
              itemsList={ageOptions}
            />
          )}
        </div>
      </div>

      <ActionButtons
        handleAhead={handleContinueInfoPopup}
        labelButtonAhead={
          hasLetsConnectAccount
            ? pageContent['edit-profile-update']
            : pageContent['lets-connect-sign-in']
        }
        iconAhead={SendIcon}
        iconAltAhead={pageContent['lets-connect-register-alt-icon']}
        labelButtonBack={pageContent['lets-connect-back-button']}
        iconBack={UserCircleIcon}
        iconAltBack={pageContent['lets-connect-back-button-alt']}
      />
      {showInfoPopup && (
        <Popup
          title={pageContent['lets-connect-info-popup-title']}
          image={LetsConnectPopup}
          imageSize="md:w-[250px]"
          continueButtonLabel={pageContent['lets-connect-info-popup-continue']}
          onContinue={handleSubmit}
          closeButtonLabel={pageContent['lets-connect-info-popup-cancel']}
          onClose={handleCloseInfoPopup}
        >
          <div className="text-left overflow-y-auto max-h-[100px] mb-6 md:overflow-visible md:max-h-none">
            {infoPopupText ? infoPopupText[0] : ''}
            <Link
              href={
                'https://foundation.wikimedia.org/wiki/Legal:Registration_for_Let%27s_Connect_Peer_Learning_Program_Privacy_Statement.'
              }
              className="underline"
              target="_blank"
            >
              {pageContent['lets-connect-info-popup-link']}
            </Link>
            {infoPopupText ? infoPopupText[1] : ''}
          </div>
        </Popup>
      )}
      {showSuccessPopup && (
        <Popup
          title={pageContent['lets-connect-success-popup-title']}
          image={LetsConnectPopup}
          imageSize="md:w-[250px]"
          closeButtonLabel={pageContent['lets-connect-success-popup-close-tab']}
          onClose={() => router.push('/profile/edit')}
        >
          {pageContent['lets-connect-success-popup-info']}
        </Popup>
      )}
    </section>
  );
}
