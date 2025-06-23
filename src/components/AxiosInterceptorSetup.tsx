"use client";

import { useEffect } from "react";
import setupAxiosInterceptor from "@/lib/axios-interceptor";

export default function AxiosInterceptorSetup() {
  useEffect(() => {
    // Set the global axios interceptor only on the client side
    setupAxiosInterceptor();
  }, []);

  // This component doesn't render anything, it only sets up the interceptor
  return null;
} 