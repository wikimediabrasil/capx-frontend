"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface SnackbarContextType {
  showSnackbar: (msg: string, type?: "success" | "error") => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<"success" | "error">("success");

  // Implement mobile detection directly
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Detect mobile on client-side
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check on load and add listener
    if (typeof window !== "undefined") {
      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
      setMounted(true);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", checkIsMobile);
      }
    };
  }, []);

  const showSnackbar = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const backgroundColor = type === "success" ? "#02AE8C" : "#D43831";
  const position = isMobile
    ? "bottom-4 left-1/2 transform -translate-x-1/2"
    : "top-4 right-4";

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      {mounted && message && (
        <div
          style={{ backgroundColor }}
          className={`fixed ${position} text-white px-4 py-2 rounded shadow-lg transition-opacity`}
        >
          {message}
        </div>
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
