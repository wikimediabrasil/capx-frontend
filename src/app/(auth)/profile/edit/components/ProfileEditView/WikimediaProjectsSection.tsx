import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import WikiIcon from '@/public/static/images/wikimedia_logo_black.svg';
import WikiIconWhite from '@/public/static/images/wikimedia_logo_white.svg';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import AddIcon from '@/public/static/images/add.svg';
import AddIconDark from '@/public/static/images/add_dark.svg';
import BaseButton from '@/components/BaseButton';
import { Profile } from '@/types/profile';
import { ResponsiveIcon } from './ResponsiveIcon';
import { RESPONSIVE_TEXT_SIZES, RESPONSIVE_BORDER_RADIUS, RESPONSIVE_PADDING } from './utils';

interface WikimediaProjectsSectionProps {
  readonly formData: Partial<Profile>;
  readonly setFormData: (data: Partial<Profile>) => void;
  readonly wikimediaProjects: Record<string, string>;
  readonly addProjectToFormData: (
    formData: Partial<Profile>,
    projectId: string
  ) => Partial<Profile>;
}

// Helper: Filter projects by search term
const filterProjects = (
  projects: Record<string, string>,
  searchTerm: string
): [string, string][] => {
  const lowerSearch = searchTerm.toLowerCase();
  return Object.entries(projects).filter(([_id, name]) => name.toLowerCase().includes(lowerSearch));
};

// Helper component: Project search input
function ProjectSearchInput({
  darkMode,
  isMobile: _isMobile,
  pageContent,
  onSearch,
  onKeyDown,
}: {
  darkMode: boolean;
  isMobile: boolean;
  pageContent: Record<string, string>;
  onSearch: (term: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <input
      type="text"
      placeholder={pageContent['edit-profile-insert-project']}
      onChange={e => onSearch(e.target.value)}
      onKeyDown={onKeyDown}
      className={`w-full px-4 py-2 ${RESPONSIVE_BORDER_RADIUS.small} font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.medium} ${
        darkMode
          ? 'bg-transparent border-white text-white placeholder-gray-400'
          : 'border-[#053749] text-[#053749]'
      } border`}
      style={{
        backgroundColor: darkMode ? '#053749' : 'white',
      }}
      autoFocus
    />
  );
}

// Helper component: Project dropdown list
function ProjectDropdown({
  darkMode,
  filteredProjects,
  pageContent,
  onSelectProject,
}: {
  darkMode: boolean;
  filteredProjects: [string, string][];
  pageContent: Record<string, string>;
  onSelectProject: (id: string) => void;
}) {
  return (
    <div
      className={`absolute top-full left-0 right-0 mt-1 max-h-40 md:max-h-60 overflow-y-auto ${RESPONSIVE_BORDER_RADIUS.small} border ${
        darkMode ? 'bg-[#053749] border-white' : 'bg-white border-[#053749]'
      } z-50 shadow-lg`}
    >
      {filteredProjects.length > 0 ? (
        filteredProjects.map(([id, name]) => (
          <button
            key={id}
            onClick={() => onSelectProject(id)}
            className={`w-full px-4 py-2 md:py-3 text-left font-[Montserrat] text-[12px] md:text-[20px] hover:bg-opacity-80 transition-colors ${
              darkMode
                ? 'text-white hover:bg-white hover:bg-opacity-10 hover:text-[#053749]'
                : 'text-[#053749] hover:bg-gray-100'
            }`}
          >
            {name}
          </button>
        ))
      ) : (
        <div
          className={`px-4 py-2 md:py-3 font-[Montserrat] text-[12px] md:text-[18px] ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {pageContent['edit-profile-no-projects-found'] || 'Nenhum projeto encontrado'}
        </div>
      )}
    </div>
  );
}

export function WikimediaProjectsSection({
  formData,
  setFormData,
  wikimediaProjects,
  addProjectToFormData,
}: WikimediaProjectsSectionProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<[string, string][]>([]);

  // Pre-computed variables
  const bgColor = darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]';
  const buttonColorClass = darkMode
    ? 'bg-capx-light-box-bg text-[#04222F]'
    : 'bg-[#053749] text-white';
  const closeIconSize = isMobile ? 16 : 24;
  const addIconSize = isMobile ? 20 : 30;

  // Handlers
  const handleSearch = (searchTerm: string) => {
    const filtered = filterProjects(wikimediaProjects, searchTerm);
    setFilteredProjects(filtered);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowProjectSelector(false);
      setFilteredProjects([]);
    }
  };

  const handleSelectProject = (id: string) => {
    setFormData(addProjectToFormData(formData, id));
    setShowProjectSelector(false);
    setFilteredProjects([]);
  };

  const handleCloseSelector = () => {
    setShowProjectSelector(false);
    setFilteredProjects([]);
  };

  const handleOpenSelector = () => {
    setShowProjectSelector(true);
    setFilteredProjects(Object.entries(wikimediaProjects));
  };

  const handleRemoveProject = (index: number) => {
    const newProjects = [...(formData.wikimedia_project || [])];
    newProjects.splice(index, 1);
    setFormData({
      ...formData,
      wikimedia_project: newProjects,
    });
  };

  // Close project selector when clicking outside
  useEffect(() => {
    if (!showProjectSelector) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.project-selector')) {
        handleCloseSelector();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectSelector]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ResponsiveIcon
          lightIcon={WikiIcon}
          darkIcon={WikiIconWhite}
          alt="Wikimedia projects icon"
          mobileSize={20}
          desktopSize={48}
        />
        <h2
          className={`font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.large} font-bold ${
            darkMode ? 'text-white' : 'text-[#053749]'
          }`}
        >
          {pageContent['body-profile-wikimedia-projects-title']}
        </h2>
      </div>

      {/* Display selected projects as tags with delete button */}
      <div
        className={`flex flex-wrap gap-2 ${RESPONSIVE_BORDER_RADIUS.small} ${bgColor} w-full ${RESPONSIVE_PADDING.small} items-start gap-[12px]`}
      >
        {formData?.wikimedia_project?.map((projectId, index) => (
          <div
            key={`wikimedia-project-${projectId}-${index}`}
            className="flex items-center gap-1 rounded-md"
          >
            <BaseButton
              onClick={() => handleRemoveProject(index)}
              label={wikimediaProjects[projectId] || projectId}
              customClass="rounded-[4px] md:rounded-[16px] border-[1px] border-[solid] border-[var(--Links-light-link,#0070B9)] flex p-[4px] pb-[4px] md:py-4 md:px-4 justify-center items-center gap-[4px] font-[Montserrat] text-[12px] md:text-[24px] not-italic font-normal leading-[normal]"
              imageUrl={darkMode ? CloseIconWhite : CloseIcon}
              imageAlt="Remove project"
              imageWidth={closeIconSize}
              imageHeight={closeIconSize}
            />
          </div>
        ))}
      </div>

      {/* Selector for adding new projects - only shown when button is clicked */}
      {showProjectSelector && (
        <div className="relative project-selector">
          <ProjectSearchInput
            darkMode={darkMode}
            isMobile={isMobile}
            pageContent={pageContent}
            onSearch={handleSearch}
            onKeyDown={handleKeyDown}
          />

          <ProjectDropdown
            darkMode={darkMode}
            filteredProjects={filteredProjects}
            pageContent={pageContent}
            onSelectProject={handleSelectProject}
          />

          {/* Close button */}
          <button
            onClick={handleCloseSelector}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
              darkMode ? 'hover:bg-white hover:bg-opacity-10' : 'hover:bg-gray-100'
            }`}
          >
            <Image
              src={darkMode ? CloseIconWhite : CloseIcon}
              alt="Close"
              width={isMobile ? 16 : 20}
              height={isMobile ? 16 : 20}
            />
          </button>
        </div>
      )}

      <BaseButton
        onClick={handleOpenSelector}
        label={pageContent['edit-profile-add-projects']}
        customClass={`w-full md:w-1/4 flex ${buttonColorClass} rounded-md py-2 font-[Montserrat] text-[14px] md:text-[24px] not-italic font-extrabold leading-[normal] mb-0 px-[13px] py-[6px] md:px-8 md:py-4 items-center gap-[4px]`}
        imageUrl={darkMode ? AddIconDark : AddIcon}
        imageAlt="Add project"
        imageWidth={addIconSize}
        imageHeight={addIconSize}
      />
      <span
        className={`${RESPONSIVE_TEXT_SIZES.small} md:text-[24px] font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
          darkMode ? 'text-white' : 'text-[#053749]'
        }`}
      >
        {pageContent['edit-profile-wikimedia-projects']}
      </span>
    </div>
  );
}
