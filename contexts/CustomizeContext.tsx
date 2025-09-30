
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { CustomizeSettings } from '../types';
import { api } from '../services/api';

interface CustomizeContextType {
  settings: CustomizeSettings | null;
  loading: boolean;
  refetchSettings: () => void;
}

const CustomizeContext = createContext<CustomizeContextType | undefined>(undefined);

export const CustomizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CustomizeSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const settingsData = await api.getCustomizeSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error("Failed to fetch customize settings", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <CustomizeContext.Provider value={{ settings, loading, refetchSettings: fetchSettings }}>
      {children}
    </CustomizeContext.Provider>
  );
};

export const useCustomize = (): CustomizeContextType => {
  const context = useContext(CustomizeContext);
  if (context === undefined) {
    throw new Error('useCustomize must be used within a CustomizeProvider');
  }
  return context;
};
