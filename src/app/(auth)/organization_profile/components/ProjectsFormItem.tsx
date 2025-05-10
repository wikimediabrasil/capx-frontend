import { useTheme } from "@/contexts/ThemeContext";
import ImagesModeIcon from "@/public/static/images/images_mode.svg";
import AddLinkIcon from "@/public/static/images/add_link.svg";
import CancelIcon from "@/public/static/images/cancel.svg";
import CancelIconWhite from "@/public/static/images/cancel_white.svg";
import Image from "next/image";
import { Project } from "@/types/project";
import { useApp } from "@/contexts/AppContext";

interface ProjectFormItemProps {
  project: Project;
  index: number;
  onDelete: (id: number) => void;
  onChange: (index: number, field: keyof Project, value: string) => void;
}

const ProjectFormItem = ({
  project,
  index,
  onDelete,
  onChange,
}: ProjectFormItemProps) => {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  if (isMobile) {
    return (
      <div className="flex flex-row gap-2">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-row gap-2 w-full items-center text-[12px] md:text-[24px] text-[16px] p-2 border rounded-md bg-transparent">
            <input
              type="text"
              placeholder={pageContent["organization-profile-project-name"]}
              value={project.display_name || ""}
              onChange={(e) => onChange(index, "display_name", e.target.value)}
              className={`w-full bg-transparent border-none outline-none text-[12px] md:text-[24px] ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-[#829BA4] placeholder-[#829BA4]"
              }`}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex items-center gap-2 p-2 text-[12px] md:text-[24px] border rounded-md w-full md:w-1/2 bg-transparent">
              <div className="relative w-[24px] h-[24px]">
                <Image
                  src={ImagesModeIcon}
                  alt="Project image icon"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <input
                type="text"
                placeholder={pageContent["organization-profile-project-image"]}
                className={`w-full bg-transparent border-none outline-none text-[12px] md:text-[24px] ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-[#829BA4] placeholder-[#829BA4]"
                }`}
                value={project.profile_image}
                onChange={(e) =>
                  onChange(index, "profile_image", e.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-2 p-2 text-[12px] md:text-[24px] border rounded-md w-full md:w-1/2 bg-transparent">
              <div className="relative w-[24px] h-[24px]">
                <Image
                  src={AddLinkIcon}
                  alt="Add link icon"
                  className="object-contain"
                  width={24}
                  height={24}
                />
              </div>
              <input
                type="text"
                placeholder={pageContent["organization-profile-project-link"]}
                className={`w-full bg-transparent border-none outline-none text-[12px] md:text-[24px] ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-[#829BA4] placeholder-[#829BA4]"
                }`}
                value={project.url}
                onChange={(e) => onChange(index, "url", e.target.value)}
              />
            </div>
          </div>
        </div>
        <button onClick={() => onDelete(project.id)}>
          <div className="relative w-[24px] h-[24px]">
            <Image
              src={darkMode ? CancelIconWhite : CancelIcon}
              alt="Delete icon"
              className="object-contain"
              width={24}
              height={24}
            />
          </div>
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-row gap-2">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-row gap-2 w-full items-center text-[24px] p-2 border rounded-md bg-transparent">
          <input
            type="text"
            placeholder={pageContent["organization-profile-project-name"]}
            value={project.display_name || ""}
            onChange={(e) => onChange(index, "display_name", e.target.value)}
            className={`w-full bg-transparent border-none outline-none ${
              darkMode
                ? "text-white placeholder-gray-400"
                : "text-[#829BA4] placeholder-[#829BA4]"
            }`}
          />
        </div>
        <div className="flex flex-row gap-2">
          <div className="flex items-center gap-2 p-2 text-[24px] border rounded-md w-1/2 bg-transparent">
            <Image
              src={ImagesModeIcon}
              alt="Project image icon"
              width={32}
              height={32}
              className="opacity-50 object-contain"
            />
            <input
              type="text"
              placeholder={pageContent["organization-profile-project-image"]}
              className={`w-full text-[24px] bg-transparent border-none outline-none ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-[#829BA4] placeholder-[#829BA4]"
              }`}
              value={project.profile_image}
              onChange={(e) => onChange(index, "profile_image", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 p-2 text-[24px] border rounded-md w-1/2 bg-transparent">
            <div className="relative w-[32px] h-[32px]">
              <Image
                src={AddLinkIcon}
                alt="Add link icon"
                className="object-contain"
                width={32}
                height={32}
              />
            </div>
            <input
              type="text"
              placeholder={pageContent["organization-profile-project-link"]}
              className={`w-full bg-transparent border-none outline-none ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-[#829BA4] placeholder-[#829BA4]"
              }`}
              value={project.url}
              onChange={(e) => onChange(index, "url", e.target.value)}
            />
          </div>
        </div>
      </div>
      <button onClick={() => onDelete(project.id)}>
        <div className="relative w-[32px] h-[32px]">
          <Image
            src={darkMode ? CancelIconWhite : CancelIcon}
            alt="Delete icon"
            className="object-contain"
            width={32}
            height={32}
          />
        </div>
      </button>
    </div>
  );
};

export default ProjectFormItem;
