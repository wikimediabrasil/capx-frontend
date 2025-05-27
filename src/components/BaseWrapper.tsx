"use client";
import Navbar from "./Navbar";
import { useApp } from "@/contexts/AppContext";
import { useSession } from "next-auth/react";
import Footer from "./Footer";
import { useTheme } from "@/contexts/ThemeContext";

interface BaseWrapperProps {
  children: React.ReactNode;
}

export default function BaseWrapper({ children }: BaseWrapperProps) {
  const { language, setLanguage } = useApp();
  const { data: session } = useSession();
  const { darkMode } = useTheme();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        session={session}
        language={language}
        setLanguage={setLanguage}
      />
      <main
        className={`flex-grow ${
          darkMode ? "bg-capx-dark-box-bg" : "bg-capx-light-bg"
        }`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
