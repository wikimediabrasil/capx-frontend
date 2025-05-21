"use client";
import { useApp } from "@/contexts/AppContext";
import BaseWrapper from "./BaseWrapper";
import MainSection from "@/components/MainSection";
import FeaturesSection from "@/components/FeaturesSection";
import CallToActionSection from "@/components/CallToActionSection";
import VideoSection from "@/components/VideoSection";
import StatisticsSection from "@/components/StatisticsSection";

export default function ApplicationWrapper() {
  return (
    <BaseWrapper>
      <MainSection />
      <FeaturesSection />
      <VideoSection />
      <StatisticsSection />
      <CallToActionSection />
    </BaseWrapper>
  );
}
