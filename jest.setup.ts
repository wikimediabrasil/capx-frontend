import '@testing-library/jest-dom';
import React from 'react';

// Mock react-error-boundary
jest.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
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
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fetchPriority, priority, fill, ...rest } = props;
    return React.createElement('img', {
      ...rest,
      priority: priority ? 'true' : undefined,
      fill: fill ? 'true' : undefined,
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

// Mock Web APIs for Next.js API routes
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Request and Response for Next.js API routes
global.Request = jest.fn().mockImplementation((url, options) => ({
  url,
  method: options?.method || 'GET',
  headers: new Map(Object.entries(options?.headers || {})),
  json: jest.fn().mockResolvedValue({}),
}));

global.Response = Object.assign(
  jest.fn().mockImplementation((body, options) => ({
    ok: options?.status ? options.status >= 200 && options.status < 300 : true,
    status: options?.status || 200,
    headers: new Map(Object.entries(options?.headers || {})),
    json: jest.fn().mockResolvedValue(JSON.parse(body || '{}')),
  })),
  {
    error: jest.fn(),
    json: jest.fn(),
    redirect: jest.fn(),
    prototype: {},
  }
);

// Mock NextResponse specifically
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    method: 'GET',
    headers: new Map(),
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      status: options?.status || 200,
      headers: new Map(Object.entries(options?.headers || {})),
      json: jest.fn().mockResolvedValue(data),
    })),
  },
}));
