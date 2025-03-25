"use client";
import { useRouter } from "next/navigation";
import AuthenticatedMainSection from "./AuthenticatedMainSection";
import Popup from "@/components/Popup";
import FirstLoginImage from "@/public/static/images/capx_complete_profile.svg";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { clientApi } from "@/lib/utils/api";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

interface AuthenticatedHomeWrapperProps {
  isFirstLogin: boolean;
}

export default function AuthenticatedHomeWrapper({
  isFirstLogin,
}: AuthenticatedHomeWrapperProps) {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { data: session } = useSession();
  const token = session?.user?.token;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await clientApi.get("/api/profile", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleContinue = () => {
    router.push("/profile/edit");
  };
  const { pageContent } = useApp();

  return (
    <>
      <AuthenticatedMainSection pageContent={pageContent} />
      {isFirstLogin && (
        <Popup
          onContinue={handleContinue}
          onClose={() => {}}
          image={FirstLoginImage}
          title={pageContent["complete-your-profile"]}
          closeButtonLabel={pageContent["auth-dialog-button-close"]}
          continueButtonLabel={pageContent["auth-dialog-button-continue"]}
          customClass={`${
            darkMode ? "bg-[#005B3F] text-white" : "bg-white text-[#053749]"
          }`}
        />
      )}
    </>
  );
}
