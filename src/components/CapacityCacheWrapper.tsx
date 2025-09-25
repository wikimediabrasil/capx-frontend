'use client';
import { CapacityCacheProvider } from '@/contexts/CapacityCacheContext';
import React from 'react';

interface CapacityCacheWrapperProps {
  children: React.ReactNode;
  language?: string;
}

export function CapacityCacheWrapper({ children }: CapacityCacheWrapperProps) {
  return <CapacityCacheProvider>{children}</CapacityCacheProvider>;
}
