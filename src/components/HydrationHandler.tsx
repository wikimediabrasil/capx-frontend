'use client';

import { useEffect, useState } from 'react';

/**
 * Component to handle hydration issues and provide better error detection
 */
export default function HydrationHandler() {
  const [hydrationComplete, setHydrationComplete] = useState(false);

  useEffect(() => {
    // Check and remove problematic attributes that cause hydration errors
    if (typeof document !== 'undefined') {
      // Common attribute added by Chrome extensions
      const body = document.querySelector('body');
      if (body) {
        const problematicAttributes = [
          'cz-shortcut-listen',
          'data-new-gr-c-s-check-loaded',
          'data-gr-ext-installed',
        ];

        problematicAttributes.forEach(attr => {
          if (body.hasAttribute(attr)) {
            body.removeAttribute(attr);
          }
        });
      }

      // Fix problem with Next.js that sometimes adds an inline style that causes problems
      const styleTag = document.getElementById('__NEXT_DATA__');
      if (styleTag && styleTag.hasAttribute('style')) {
        styleTag.removeAttribute('style');
      }

      // Mark as hydrated
      setHydrationComplete(true);

      // Check if there are elements with hydration problems
      setTimeout(() => {
        const hydrationErrors = document.querySelectorAll('[data-hydration-error="true"]');
        if (hydrationErrors.length > 0) {
          console.warn(`Detected ${hydrationErrors.length} elements with hydration errors`);
        }
      }, 1000);

      // Configure an error listener for uncaught errors
      const originalOnError = window.onerror;
      window.onerror = function (message, source, lineno, colno, error) {
        // Check if it's a hydration error
        if (
          message &&
          (message.toString().includes('Hydration') ||
            message.toString().includes('hydrate') ||
            message.toString().includes('hydrating'))
        ) {
          console.error('Hydration error detected:', {
            message,
            source,
            lineno,
            colno,
          });
        }

        // Call the original handler, if it exists
        if (typeof originalOnError === 'function') {
          return originalOnError(message, source, lineno, colno, error);
        }
        return false;
      };
    }
  }, []);

  // Inject style to facilitate viewing hydration errors in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = `
        [data-hydration-error="true"] {
          outline: 2px solid red !important;
          position: relative;
        }
        [data-hydration-error="true"]::before {
          content: "Hydration Error";
          position: absolute;
          top: -20px;
          left: 0;
          background: red;
          color: white;
          padding: 2px 5px;
          font-size: 10px;
          z-index: 9999;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div
      style={{ display: 'none' }}
      data-hydration-status={hydrationComplete ? 'complete' : 'pending'}
    >
      {/* This component does not render anything visible */}
    </div>
  );
}
