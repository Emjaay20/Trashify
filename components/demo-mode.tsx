'use client';

import { createContext, useContext, type ReactNode } from 'react';

const DemoMode = createContext(false);

export function DemoModeProvider({ demo, children }: { demo: boolean; children: ReactNode }) {
  return <DemoMode.Provider value={demo}>{children}</DemoMode.Provider>;
}

export function useDemoMode() {
  return useContext(DemoMode);
}
