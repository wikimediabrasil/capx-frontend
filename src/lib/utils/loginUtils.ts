"use client";

import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";

export const handleLogin = async () => {
  try {
    // Clear old tokens before starting new flow
    localStorage.removeItem("oauth_token");
    localStorage.removeItem("oauth_token_secret");

    const response = await axios.post("/api/login", null, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.data?.redirect_url) {
      // Store new tokens
      localStorage.setItem("oauth_token", response.data.oauth_token);
      localStorage.setItem(
        "oauth_token_secret",
        response.data.oauth_token_secret
      );
      window.location.href = response.data.redirect_url;
    } else {
      throw new Error("Redirect URL not received");
    }
  } catch (error: any) {
    console.error("Full error:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    alert(`Error in login: ${error.response?.data?.error || error.message}`);
  }
};

export const handleLogout = async () => {
  try {
    // Force local data cleanup
    localStorage.clear();
    sessionStorage.clear();

    // Force logout and redirect to landing page
    await signOut({ redirect: true, callbackUrl: "/" });

    console.log("Redirecting to landing page");
    window.location.href = "/";
  } catch (error) {
    console.error("Error during session cleanup:", error);
    window.location.href = "/";
  }
};
