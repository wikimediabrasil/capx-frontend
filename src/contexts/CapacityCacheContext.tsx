"use client";
import { createContext, useContext, ReactNode, useState, useRef } from "react";

interface CapacityCache {
  name: string;
  timestamp: number;
}

interface CapacityCacheContextType {
  getCapacity: (id: string) => CapacityCache | undefined;
  setCapacity: (id: string, name: string) => void;
  clearCache: () => void;
}

const CapacityCacheContext = createContext<
  CapacityCacheContextType | undefined
>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Create a global cache outside of the component to persist between renders
const globalCache = new Map<string, CapacityCache>();

export function CapacityCacheProvider({ children }: { children: ReactNode }) {
  // Using useRef instead of useState to avoid triggering re-renders
  const cacheRef = useRef(globalCache);

  const getCapacity = (id: string) => {
    const cached = cacheRef.current.get(id);
    if (!cached) return undefined;

    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      cacheRef.current.delete(id);
      return undefined;
    }

    return cached;
  };

  const setCapacity = (id: string, name: string) => {
    cacheRef.current.set(id, { name, timestamp: Date.now() });
    // No state update to avoid re-renders
  };

  const clearCache = () => {
    cacheRef.current.clear();
    // No state update to avoid re-renders
  };

  return (
    <CapacityCacheContext.Provider
      value={{ getCapacity, setCapacity, clearCache }}
    >
      {children}
    </CapacityCacheContext.Provider>
  );
}

export function useCapacityCache() {
  const context = useContext(CapacityCacheContext);
  if (!context) {
    throw new Error(
      "useCapacityCache must be used within a CapacityCacheProvider"
    );
  }
  return context;
}
