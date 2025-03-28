"use client"
import Image from "next/image";
import IconBug from "@/public/static/images/bug_icon.svg";
import IconBugWhite from "@/public/static/images/bug_icon_white.svg";
import BaseButton from "@/components/BaseButton";
import CancelIcon from "@/public/static/images/cancel.svg";
import Uploadicon from "@/public/static/images/upload.svg";
import ArrowDownIcon from "@/public/static/images/arrow_drop_down_circle.svg";
import ArrowDownIconWhite from "@/public/static/images/arrow_drop_down_circle_white.svg";

import { useBugReport, ReportType } from "@/hooks/useBugReport";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useSnackbar } from "@/app/providers/SnackbarProvider";
import { useRouter } from "next/navigation";
import ButtonDesktopReportBugPage from "./ButtonDesktop";

export default function FormSubmitReportBugPage(){
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const reportTypeLabels: Record<string, string> = {
    [ReportType.BUG]: pageContent["bug-report-type-bug"] || "Problema (Erro)",
    [ReportType.FEATURE]: pageContent["bug-report-type-feature"] || "Novo Recurso",
    [ReportType.IMPROVEMENT]: pageContent["bug-report-type-improvement"] || "Melhoria",
  };  

  const {
    formData,
    isSubmitting,
    showTypeSelector,
    setShowTypeSelector,
    handleTitleChange,
    handleDescriptionChange,
    handleTypeChange,
    handleSubmit,
    handleCancel,
  } = useBugReport();
    
  // const handleSubmit = async () => {
  //   if (!token) {
  //     console.error("No token available");
  //     return;
  //   }

  //   try {
  //     await updateProfile(formData);//
  //     showSnackbar(pageContent["snackbar-edit-profile-success"],"success")
  //     router.push("/profile");
  //   } catch (error) {
  //     if (error.response.status == 409){
  //       showSnackbar(pageContent["snackbar-edit-profile-failed-capacities"],"error")
  //     }else{
  //       showSnackbar(pageContent["snackbar-edit-profile-failed-generic"],"error")
  //     }
  //     console.error("Error updating profile:", error);
  //   }
  // };


  return (
    <section className="w-full h-full flex flex-col gap-4 px-4 py-4 md:min-h-41 mx-auto md:max-w-full">
      <div className="flex items-start gap-2 text-left">
        <Image
            src={darkMode ?  IconBugWhite : IconBug}
            alt={pageContent["report-bug-icon"]}
            className="w-4 h-5 md:w-[42px] md:h-[42px]"
        />
        <h1 className={`text-[14px] font-[Montserrat] font-bold md:text-[32px] 
            ${darkMode ? "text-capx-light-bg" : "text-capx-dark-box-bg"}`}
        >
            {pageContent["report-bug-heading"]}
        </h1>
      </div>
      <div className="mt-4 md:mb-14 ">
        <h4 className={`mb-2 text-[12px] font-[Montserrat] font-bold md:text-[24px]
            ${darkMode ? "text-capx-light-bg" : "text-[#507380]"}`}
        >
            {pageContent["report-bug-tittle"]}
        </h4>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={handleTitleChange}
          className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
            darkMode
              ? "bg-transparent border-[#FFFFFF] text-white"
              : "border-[#053749] text-[#829BA4]"
          }`}
          placeholder={pageContent["report-bug-title-placeholder"]}
        />                
      </div>
      <div className="mt-4 md:mb-14">
        <h4 className={`text-[12px] font-[Montserrat] font-bold mb-2 md:text-[24px] 
          ${darkMode ? "text-capx-light-bg" : "text-[#507380]"}`}
        >
          {pageContent["report-bug-description"]}
        </h4>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleDescriptionChange}
          rows={4}
          className={`w-full px-3 py-2 m-0 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
            darkMode
              ? "bg-transparent border-[#FFFFFF] text-white"
              : "border-[#053749] text-[#829BA4]"
          }`}
          placeholder={pageContent["report-bug-description-placeholder"]}
        >
        </textarea>
        <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Please describe the bug or problem you have encountered. Try to be as much descriptive as possible.
        </p>          
      </div>








      <div className="mt-4">
        <h4 className={`text-[12px] font-[Montserrat] font-bold mb-2 md:text-[24px]
            ${darkMode ? "text-capx-light-bg" : "text-[#507380]"}`}
        >
            {pageContent["report-bug-types-of-reports"]}
        </h4>
        <div className="relative">
          <button
            onClick={() => setShowTypeSelector(!showTypeSelector)}
            className={`w-full px-3 py-2 border rounded-md text-[12px] md:text-[24px] md:py-4 ${
              darkMode
                ? "bg-transparent border-[#FFFFFF] text-white"
                : "border-[#053749] text-[#829BA4]"
            } flex justify-between items-center`}
          >
            {formData.type
              ? reportTypeLabels[formData.type]
              : pageContent["report-bug-types-of-reports-placeholder"]}
            <Image
              src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
              alt="Select"
              width={20}
              height={20}
            />
          </button>

          {showTypeSelector && (
            <div
              className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
                darkMode ? "bg-[#04222F] border-gray-700" : "bg-white border-gray-200"
              } border`}
            >
              {Object.values(ReportType).map((type) => (
                <button
                  key={type}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    darkMode
                      ? "text-white hover:bg-[#053749]"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handleTypeChange(type)}
                >
                  {reportTypeLabels[type]}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Select the type of report you are creating. You can report a problem (error), propose the creation of new features, or suggest specific tool improvements.
        </p>
      </div>














      <div className="mt-4 flex flex-col gap-2 md:hidden">
        <BaseButton
          onClick={handleSubmit}
          label={pageContent["report-bug-submit-button"]}
          customClass="flex border w-full rounded-md border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#851970]  items-center justify-between text-white !px-[13px] !py-[6px] rounded-md font-[Montserrat] text-[14px] font-bold pb-[6px]"
          imageUrl={Uploadicon}
          imageAlt="Upload icon"
          imageWidth={20}
          imageHeight={20}
        />
        <BaseButton
          onClick={() => router.back()}
          label={pageContent["report-bug-submit-cancel-button"]}
          customClass="flex border w-full rounded-md border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#FFF] items-center justify-between text-capx-dark-box-bg !px-[13px] !py-[6px] rounded-md font-[Montserrat] text-[14px] font-bold pb-[6px]"
          imageUrl={CancelIcon}
          imageAlt="Cancel icon"
          imageWidth={20}
          imageHeight={20}
        />
      </div>      
      <div className="hidden md:block">
        <ButtonDesktopReportBugPage />
      </div>
    </section>
  )}

// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { useApp } from "@/contexts/AppContext";
// import { useTheme } from "@/contexts/ThemeContext";
// import { useBugReport, ReportType } from "@/hooks/useBugReport";

// // Imagens
// import SaveIcon from "@/public/static/images/save_as.svg";
// import CancelIcon from "@/public/static/images/cancel.svg";
// import CancelIconWhite from "@/public/static/images/cancel_white.svg";
// import ArrowDownIcon from "@/public/static/images/arrow_drop_down_circle.svg";
// import ArrowDownIconWhite from "@/public/static/images/arrow_drop_down_circle_white.svg";

// // Componentes
// import BaseButton from "@/components/BaseButton";
// import router from "next/router";

// export default function SubmitForm() {
//   const { pageContent } = useApp();
//   const { darkMode } = useTheme();
  
//   const {
//     formData,
//     isSubmitting,
//     showTypeSelector,
//     setShowTypeSelector,
//     handleTitleChange,
//     handleDescriptionChange,
//     handleTypeChange,
//     handleSubmit,
//     handleCancel,
//   } = useBugReport();

//   // Mapeamento de tipos para exibição
  // const reportTypeLabels: Record<string, string> = {
  //   [ReportType.BUG]: pageContent["bug-report-type-bug"] || "Problema (Erro)",
  //   [ReportType.FEATURE]: pageContent["bug-report-type-feature"] || "Novo Recurso",
  //   [ReportType.IMPROVEMENT]: pageContent["bug-report-type-improvement"] || "Melhoria",
  // };

//   return (
//     <div className="max-w-2xl mx-auto">
//       <div className="flex items-center mb-6">
//         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//         </svg>
//         <h2 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
//           {pageContent["bug-report-submit-title"] || "Submit Bug Reports"}
//         </h2>
//       </div>

//       <div className="space-y-6">
//         {/* Título */}
//         <div>
//           <label
//             htmlFor="title"
//             className={`block mb-2 text-sm font-medium ${
//               darkMode ? "text-white" : "text-gray-700"
//             }`}
//           >
//             {pageContent["bug-report-title-label"] || "Title"}
//           </label>
//           <input
//             type="text"
//             id="title"
//             value={formData.title}
//             onChange={handleTitleChange}
//             className={`w-full px-3 py-2 border rounded-md ${
//               darkMode
//                 ? "bg-transparent border-gray-600 text-white"
//                 : "border-gray-300 text-gray-900"
//             }`}
//             placeholder={pageContent["bug-report-title-placeholder"] || "Enter a title for your report"}
//           />
//         </div>

//         {/* Descrição */}
//         <div>
//           <label
//             htmlFor="description"
//             className={`block mb-2 text-sm font-medium ${
//               darkMode ? "text-white" : "text-gray-700"
//             }`}
//           >
//             {pageContent["bug-report-description-label"] || "Description"}
//           </label>
          // <textarea
          //   id="description"
          //   value={formData.description}
          //   onChange={handleDescriptionChange}
          //   rows={4}
          //   className={`w-full px-3 py-2 border rounded-md ${
          //     darkMode
          //       ? "bg-transparent border-gray-600 text-white"
          //       : "border-gray-300 text-gray-900"
          //   }`}
          //   placeholder={pageContent["bug-report-description-placeholder"] || "Describe the bug or problem you've encountered"}
          // ></textarea>
          // <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          //   Please describe the bug or problem you have encountered. Try to be as much descriptive as possible.
          // </p>
//         </div>

//         {/* Tipo de relatório */}
//         <div>
//           <label
//             htmlFor="type"
//             className={`block mb-2 text-sm font-medium ${
//               darkMode ? "text-white" : "text-gray-700"
//             }`}
//           >
//             {pageContent["bug-report-type-label"] || "Types of reports"}
//           </label>
          
        //   <div className="relative">
        //     <button
        //       onClick={() => setShowTypeSelector(!showTypeSelector)}
        //       className={`w-full flex justify-between items-center px-3 py-2 border rounded-md ${
        //         darkMode
        //           ? "bg-transparent border-gray-600 text-white"
        //           : "border-gray-300 text-gray-900"
        //       }`}
        //     >
        //       {formData.type ? reportTypeLabels[formData.type] : (pageContent["bug-report-select-type"] || "Insert item")}
        //       <Image
        //         src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
        //         alt="Select"
        //         width={20}
        //         height={20}
        //       />
        //     </button>
            
        //     {showTypeSelector && (
        //       <div className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
        //         darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        //       } border`}>
        //         {Object.values(ReportType).map((type) => (
        //           <button
        //             key={type}
        //             className={`block w-full text-left px-4 py-2 text-sm ${
        //               darkMode 
        //                 ? "text-white hover:bg-gray-700" 
        //                 : "text-gray-700 hover:bg-gray-100"
        //             }`}
        //             onClick={() => handleTypeChange(type)}
        //           >
        //             {reportTypeLabels[type]}
        //           </button>
        //         ))}
        //       </div>
        //     )}
        //   </div>
        //   <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        //     Select the type of report you are creating. You can report a problem (error), propose the creation of new features, or suggest specific tool improvements.
        //   </p>
        // </div>

//         {/* Botões de ação */}
//         <div className="flex flex-col sm:flex-row gap-3 mt-6">
//           {/* <button
//             onClick={handleSubmit}
//             disabled={isSubmitting}
//             className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#851970] text-white rounded-md font-medium"
//           >
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L12 18L5 21Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//             </svg>
//             {pageContent["bug-report-submit-button"] || "Submit bug report"}
//           </button> */}
//           <BaseButton
//             onClick={handleSubmit}
//             label={pageContent["edit-profile-save-organization"]}
//             customClass="w-full flex items-center px-[13px] py-[6px] pb-[6px] bg-[#851970] text-white rounded-md py-3 font-bold !mb-0"
//             imageUrl={SaveIcon}
//             imageAlt="Upload icon"
//             imageWidth={20}
//             imageHeight={20}
//             />
//           <BaseButton
//             onClick={() => {}}
//             label={pageContent["edit-profile-cancel"]}
//             customClass="flex border rounded-[4px] !mb-0 border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#FFF] items-center justify-between text-capx-dark-box-bg px-4 py-2 rounded-md font-[Montserrat] text-[14px] font-bold pb-[6px]"
//             imageUrl={darkMode ? CancelIconWhite : CancelIcon}
//             imageAlt="Cancel icon"
//             imageWidth={20}
//             imageHeight={20}
//           />
//           {/* <button
//             onClick={handleCancel}
//             className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-md font-medium ${
//               darkMode
//                 ? "border-gray-600 text-white"
//                 : "border-gray-300 text-gray-700"
//             }`}
//           >
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M6 18L18 6M6 6L18 18" stroke={darkMode ? "white" : "#374151"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//             </svg>
//             {pageContent["bug-report-cancel"] || "Cancel edit"}
//           </button> */}
//         </div>
//       </div>
//     </div>
//   );
// }
