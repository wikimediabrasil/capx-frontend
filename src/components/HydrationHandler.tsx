"use client";

import { useEffect } from "react";

/**
 * Component to handle hydration issues related to attributes added by extensions
 */
export default function HydrationHandler() {
  useEffect(() => {
    // Remove attributes added by extensions that cause hydration errors
    // This is only executed in the browser after the first render
    if (typeof document !== "undefined") {
      const body = document.querySelector("body");
      if (body && body.hasAttribute("cz-shortcut-listen")) {
        // Remove the attribute that causes the hydration error
        body.removeAttribute("cz-shortcut-listen");
      }
    }
  }, []);

  return null; // This component does not render anything visually
}
