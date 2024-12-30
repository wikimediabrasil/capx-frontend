"use client";
import Navbar from "./Navbar";
import { useApp } from "@/contexts/AppContext";
import { useSession } from "next-auth/react";
interface BaseWrapperProps {
  children: React.ReactNode;
}

export default function BaseWrapper({ children }: BaseWrapperProps) {
  const { language, setLanguage, pageContent, setPageContent } = useApp();
  const { data: session } = useSession();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        session={session}
        pageContent={pageContent}
        language={language}
        setLanguage={setLanguage}
        setPageContent={setPageContent}
      />
      <main className="flex-grow mt-16">{children}</main>
    </div>
  );
}
