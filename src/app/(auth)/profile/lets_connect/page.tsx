"use client"

import LetsConnectPage from "./components/LetsConnectPage";

// import { useSession } from "next-auth/react";
// import { useProfile } from "@/hooks/useProfile";

export default function LetsConnect() {
//   const { data: session } = useSession();
//   const token = session?.user?.token;

//   const { profile } = useProfile(
//     token,
//     Number(session?.user?.id)
//   );

  return(
    <LetsConnectPage 
      prop1={true}
      prop2={true}
    >
    </LetsConnectPage>
  )
}
