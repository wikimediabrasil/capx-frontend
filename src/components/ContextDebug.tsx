"use client";

import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSession } from "next-auth/react";
import { ErrorBoundary } from "react-error-boundary";

function DebugContent() {
  const app = useApp();
  const theme = useTheme();
  const { data: session } = useSession();

  return (
    <div className="fixed bottom-5 right-5 bg-white border border-gray-200 p-3 rounded shadow-lg z-50 text-xs">
      <h4 className="font-bold">Context Debug:</h4>
      <ul>
        <li>AppContext: {app ? "✅" : "❌"}</li>
        <li>ThemeContext: {theme ? "✅" : "❌"}</li>
        <li>Session: {session ? "✅" : "❌"}</li>
        <li>Language: {app?.language || "Not available"}</li>
        <li>Dark Mode: {theme?.darkMode ? "On" : "Off"}</li>
      </ul>
    </div>
  );
}

export default function ContextDebug() {
  return (
    <ErrorBoundary
      fallback={
        <div className="fixed bottom-5 right-5 bg-white border border-red-200 p-3 rounded shadow-lg z-50 text-xs">
          Context Error
        </div>
      }
    >
      <DebugContent />
    </ErrorBoundary>
  );
}
