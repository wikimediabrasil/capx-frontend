import '@testing-library/jest-dom';
import React from 'react';

// Mock react-error-boundary
jest.mock("react-error-boundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { fetchPriority, priority, fill, ...rest } = props;
    return React.createElement("img", {
      ...rest,
      priority: priority ? "true" : undefined,
      fill: fill ? "true" : undefined,
    });
  },
}));

// Mock window.location to avoid navigation error
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
});
