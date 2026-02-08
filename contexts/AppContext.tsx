import React, { createContext, useContext, useState } from 'react';

type AppContextType = {
  splashDone: boolean;
  isLoading: boolean;
  setSplashDone: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [splashDone, setSplashDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AppContext.Provider value={{ splashDone, isLoading, setSplashDone, setIsLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
