import Image from "next/image";
import { useRouter } from "next/navigation";
import BaseButton from "@/components/BaseButton";
import EditIcon from "@/public/static/images/edit.svg";
import EditIconWhite from "@/public/static/images/edit_white.svg";
import UserCircleIcon from "@/public/static/images/supervised_user_circle.svg";
import UserCircleIconWhite from "@/public/static/images/supervised_user_circle_white.svg";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import NoAvatarIcon from "@/public/static/images/no_avatar.svg";
import { useState, useEffect, useCallback } from "react";
import { useAvatars } from "@/hooks/useAvatars";

interface ProfileHeaderProps {
  username: string;
  profileImage?: string;
  avatar?: number;
  isSameUser: boolean;
}

export default function ProfileHeader({
  username,
  profileImage,
  avatar,
  isSameUser,
}: ProfileHeaderProps & { isSameUser: boolean }) {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const { getAvatarById } = useAvatars();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadAvatar = useCallback(async () => {
    if (typeof avatar === "number" && avatar > 0) {
      try {
        const avatarData = await getAvatarById(avatar);
        if (avatarData?.avatar_url) {
          setAvatarUrl(avatarData.avatar_url);
          return;
        }
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    }
    setAvatarUrl(profileImage || NoAvatarIcon);
  }, [avatar, profileImage, getAvatarById]);

  useEffect(() => {
    loadAvatar();
  }, [loadAvatar]);

  if (!avatarUrl) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        <div className="relative w-[100px] h-[100px]">
          <Image
            priority
            src={avatarUrl}
            alt={pageContent["navbar-user-profile"]}
            fill
            className="object-cover border rounded-[4px]"
            unoptimized
          />
        </div>
        <h1
          className={` text-[24px] font-[Montserrat] font-normal ${
            darkMode ? "text-capx-light-bg" : "text-capx-dark-box-bg"
          }`}
        >
          {pageContent["edit-profile-welcome"]}
        </h1>
        <div className="flex items-center gap-2">
          <Image
            src={darkMode ? UserCircleIconWhite : UserCircleIcon}
            alt={pageContent["navbar-user-profile"]}
            width={20}
            height={20}
          />
          <span
            className={`text-[20px] font-[Montserrat] font-bold ${
              darkMode ? "text-capx-light-bg" : "text-capx-dark-box-bg"
            }`}
          >
            {username || pageContent["loading"]}
          </span>
        </div>
        {isSameUser && (
          <BaseButton
            onClick={() => router.push("/profile/edit")}
            label={pageContent["body-profile-edit-user-button"]}
            customClass={`w-full font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ${
              darkMode
                ? "text-capx-light-bg border-capx-light-bg"
                : "text-capx-dark-box-bg border-capx-dark-box-bg"
            }`}
            imageUrl={darkMode ? EditIconWhite : EditIcon}
            imageAlt="Edit icon"
            imageWidth={20}
            imageHeight={20}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-[96px] mb-[96px]">
      <div className="relative w-[250px] h-[250px]">
        <Image
          priority
          src={avatarUrl}
          alt={pageContent["navbar-user-profile"]}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex flex-col gap-6">
        <h1
          className={` text-[48px] font-[Montserrat] font-normal ${
            darkMode ? "text-capx-light-bg" : "text-capx-dark-box-bg"
          }`}
        >
          {pageContent["edit-profile-welcome"]}
        </h1>
        <div className="flex items-center gap-2">
          <Image
            src={darkMode ? UserCircleIconWhite : UserCircleIcon}
            alt={pageContent["navbar-user-profile"]}
            width={42}
            height={42}
          />
          <span
            className={`text-[24px] font-[Montserrat] font-bold ${
              darkMode ? "text-capx-light-bg" : "text-capx-dark-box-bg"
            }`}
          >
            {username || pageContent["loading"]}
          </span>
        </div>
        {isSameUser && (
          <BaseButton
            onClick={() => router.push("/profile/edit")}
            label={pageContent["body-profile-edit-user-button"]}
            customClass={`w-full font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ${
              darkMode
                ? "text-capx-light-bg border-capx-light-bg"
                : "text-capx-dark-box-bg border-capx-dark-box-bg"
            }`}
            imageUrl={darkMode ? EditIconWhite : EditIcon}
            imageAlt="Edit icon"
            imageWidth={42}
            imageHeight={42}
          />
        )}
      </div>
    </div>
  );
}
