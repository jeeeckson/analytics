'use client';

import { ReactNode } from 'react';

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Provider component for Zustand store initialization.
 * Wraps the app to provide global state access.
 */
export function StoreProvider({ children }: StoreProviderProps) {
  // Zustand store is already initialized globally
  // This component exists for future enhancements (e.g., SSR hydration)
  return <>{children}</>;
}
