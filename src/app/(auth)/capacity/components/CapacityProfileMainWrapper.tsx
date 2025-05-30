"use client";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import LoadingSection from "@/components/LoadingSection";
import { useCapacityProfile } from "@/hooks/useCapacityProfile";
import { useSession } from "next-auth/react";
import CapacityProfileView from "./CapacityProfileView";
interface CapacityProfileMainWrapperProps {
  selectedCapacityId: string;
  language?: string;
}

export default function CapacityProfileMainWrapper(
  props: CapacityProfileMainWrapperProps
) {
  const { pageContent, language } = useApp();
  const { darkMode } = useTheme();
  const { data: session } = useSession();

  const { selectedCapacityData, isLoading } = useCapacityProfile(
    props.selectedCapacityId,
    props.language || language
  );

  if (isLoading) {
    return <LoadingSection darkMode={darkMode} message="CAPACITY DATA" />;
  }

  return (
    <section className="grid grid-cols-1 place-content-start w-10/12 sm:w-8/12 min-h-screen py-32 mx-auto space-y-8">
      <CapacityProfileView
        darkMode={darkMode}
        selectedCapacityData={selectedCapacityData}
        pageContent={pageContent}
        userId={session?.user?.id || ""}
      />
    </section>
  );
}
