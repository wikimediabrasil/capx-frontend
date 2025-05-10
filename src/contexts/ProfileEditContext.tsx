"use client";

import { createContext, useContext, useState } from "react";
import { Profile } from "@/types/profile";

interface ProfileEditContextType {
  unsavedData: Partial<Profile> | null;
  setUnsavedData: (data: Partial<Profile> | null) => void;
  clearUnsavedData: () => void;
}

const ProfileEditContext = createContext<ProfileEditContextType | undefined>(undefined);

export function ProfileEditProvider({ children }: { children: React.ReactNode }) {
  const [unsavedData, setUnsavedData] = useState<Partial<Profile> | null>(null);

  const clearUnsavedData = () => {
    setUnsavedData(null);
  };

  return (
    <ProfileEditContext.Provider value={{ unsavedData, setUnsavedData, clearUnsavedData }}>
      {children}
    </ProfileEditContext.Provider>
  );
}

export function useProfileEdit() {
  const context = useContext(ProfileEditContext);
  if (context === undefined) {
    throw new Error("useProfileEdit must be used within a ProfileEditProvider");
  }
  return context;
} 