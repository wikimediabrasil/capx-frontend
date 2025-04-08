"use client";

import Image from "next/image";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useSavedItems } from "@/hooks/useSavedItems";
import LoadingState from "@/components/LoadingState";
import { NoResults } from "../components/NoResults";
import SavedItemsIllustration from "@/public/static/images/capx_person_4.svg";
import SavedItemCard from "./components/SavedItemCard";
import { PaginationButtons } from "@/components/PaginationButtons";

export default function SavedProfilesPage() {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const { 
    paginatedProfiles,
    isLoading, 
    error, 
    count, 
    deleteSavedItem,
  } = useSavedItems();

  const currentProfiles = paginatedProfiles(currentPage, itemsPerPage);
  const totalPages = Math.ceil(count / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRemoveSavedItem = async (savedItemId: number) => {
    await deleteSavedItem(savedItemId);
  };

  return (
    <div className="w-full flex flex-col items-center mx-auto pt-24 md:pt-8">
      <div className="container mx-auto px-4">
        <div className="md:max-w-[1200px] w-full max-w-sm mx-auto space-y-6">
          {/* Banner */}
          <div className="w-full bg-[#04222F] rounded-lg overflow-hidden">
            <div className="relative flex flex-col md:flex-row md:items-center px-4 md:px-16 py-6">
              {/* Image */}
              <div className="flex justify-center md:ml-auto md:mr-auto md:justify-start">
                <Image
                  src={SavedItemsIllustration}
                  alt="SavedItemsIllustration"
                  width={180}
                  height={180}
                  className="h-auto w-[140px] md:w-[160px]"
                  priority
                />
              </div>
              
              {/* Title */}
              <div className="mt-4 md:mt-0 md:ml-auto md:mr-auto flex justify-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {pageContent["saved-profiles-title"]}
                </h1>
              </div>
            </div>
          </div>
          
          {/* Loading state */}
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <div className={`p-4 rounded-md ${darkMode ? 'bg-red-900 text-white' : 'bg-red-100 text-red-800'}`}>
              {error}
            </div>
          ) : count > 0 ? (
            <div className="w-full mx-auto space-y-6">
              {currentProfiles.map((profile, index) => (
                <SavedItemCard 
                  id={String(profile.id)}
                  key={index}
                  profile_image={profile.profile_image}
                  username={profile.username}
                  avatar={profile.avatar}
                  isOrganization={profile.isOrganization}
                  onDelete={() => handleRemoveSavedItem(profile.savedItemId)}
                />
              ))}
            </div>
          ) : (
            <NoResults
              title={pageContent["feed-no-data-message"]}
              description={pageContent["feed-no-data-description"]}
            />
          )}
        </div>
      </div>
      
      {/* Pagination buttons */}
      {count > 0 && (
        <PaginationButtons
          currentPage={currentPage}
          totalPages={totalPages || 1}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
