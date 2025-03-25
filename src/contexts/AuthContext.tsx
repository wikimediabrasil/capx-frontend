"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import SessionExpiredPopup from "@/components/SessionExpiredPoup";

interface AuthContextType {
  showSessionExpiredPopup: boolean;
  setShowSessionExpiredPopup: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [showSessionExpiredPopup, setShowSessionExpiredPopup] = useState(false);

  useEffect(() => {
    const handleShowPopup = () => {
      setShowSessionExpiredPopup(true);
    };

    // Add listener for the custom event
    window.addEventListener("showSessionExpiredPopup", handleShowPopup);

    // Cleanup
    return () => {
      window.removeEventListener("showSessionExpiredPopup", handleShowPopup);
    };
  }, []);
  return (
    <AuthContext.Provider
      value={{ showSessionExpiredPopup, setShowSessionExpiredPopup }}
    >
      {children}
      {showSessionExpiredPopup && <SessionExpiredPopup />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
