"use client";

import BaseWrapper from "./BaseWrapper";
import MainSection from "@/components/MainSection";
import FeaturesSection from "@/components/FeaturesSection";
import CallToActionSection from "@/components/CallToActionSection";
import VideoSection from "@/components/VideoSection";

export default function ApplicationWrapper() {
  return (
    <BaseWrapper>
      <MainSection />
      <FeaturesSection />
      <VideoSection />
      <CallToActionSection />
    </BaseWrapper>
  );
}
