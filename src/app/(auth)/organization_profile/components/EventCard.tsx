import { useEvent } from "@/hooks/useEvents";
import Image from "next/image";
import BaseButton from "@/components/BaseButton";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";

interface EventCardProps {
  eventId: number;
  token?: string;
}

export const EventCard = ({ eventId, token }: EventCardProps) => {
  const { event, isLoading, error } = useEvent(eventId, token);
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  if (isLoading) {
    return <div className="loading-skeleton">{pageContent["loading"]}</div>;
  }

  if (error || !event) {
    return null;
  }

  const getImageUrl = (url: string) => {
    try {
      if (url.includes("commons.wikimedia.org/wiki/File:")) {
        // Extrai o nome do arquivo da URL
        const fileName = url.split("File:")[1];
        if (fileName) {
          // Usa a API de thumbnails do Wikimedia Commons
          return `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(
            fileName
          )}&width=800`;
        }
      } else if (url.includes("upload.wikimedia.org")) {
        // Se já for uma URL direta do upload.wikimedia.org, retorna ela mesma
        return url;
      }
      return url;
    } catch (error) {
      console.error("Error processing image URL:", error);
      return url;
    }
  };

  const imageUrl = event.image_url ? getImageUrl(event.image_url) : null;

  return (
    <div
      className={`rounded-[16px] w-[350px] flex-shrink-0 flex flex-col h-[400px] ${
        darkMode ? "bg-[#04222F]" : "bg-[#EFEFEF]"
      }`}
    >
      <div className="p-6 flex items-center justify-center h-[250px]">
        <div className="relative w-full h-[200px] flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={event.name}
              fill
              style={{ objectFit: "contain" }}
              className="p-4"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              {pageContent["organization-profile-no-image-available"]}
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        <BaseButton
          customClass="inline-flex h-[64px] px-[32px] py-[16px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] bg-[#851970] text-[#F6F6F6] text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal]"
          label={pageContent["organization-profile-view-event"]}
          onClick={() => event.url && window.open(event.url, "_blank")}
        />
      </div>
    </div>
  );
};
