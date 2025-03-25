"use client";

import ProfilePage from "./components/ProfilePage";
import { clientApi } from "@/lib/utils/api";
import { useSession } from "next-auth/react";
import { useProfile } from "@/hooks/useProfile";
import { useEffect } from "react";

export default function ProfileByUserName() {
  const { data: session } = useSession();
  const token = session?.user?.token;

  // Check if the user is authenticated
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

  const { profile } = useProfile(token, Number(session?.user?.id));

  return <ProfilePage isSameUser={true} profile={profile}></ProfilePage>;
}
