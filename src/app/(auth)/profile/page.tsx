"use client";

import ProfilePage from "./components/ProfilePage";
import LoadingState from "@/components/LoadingState";

import { useSession } from "next-auth/react";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";

export default function ProfileByUserName() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const token = session?.user?.token;
  const userId = session?.user?.id ? Number(session.user.id) : undefined;

  const { profile, isLoading, error } = useProfile(token, userId as number);

  // Redirect if not authenticated
  if (sessionStatus === "unauthenticated") {
    router.push("/");
    return null;
  }

  // Mostrar loading enquanto carrega o perfil ou a sessão
  if (isLoading || sessionStatus === "loading" || !profile) {
    return <LoadingState />;
  }

  // Handle error state
  if (error) {
    console.error("Error loading profile:", error);
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-red-500">
          Error loading profile. Please try again.
        </p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push("/")}
        >
          Go back
        </button>
      </div>
    );
  }

  return <ProfilePage isSameUser={true} profile={profile} />;
}
