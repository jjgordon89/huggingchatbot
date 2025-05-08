typescriptreact
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Density = 'default' | 'compact' | 'comfortable';

interface AppSettings {
  theme: Theme;
  density: Density;
}

interface AppSettingsContextType extends AppSettings {
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  resetSettings: () => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  density: 'default',
};

export const AppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (error) {
        console.error('Failed to parse stored settings:', error);
        // Fallback to default settings if parsing fails
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem('appSettings'); // Clear invalid data
      }
    } else {
       // Check system preference for initial theme if no settings are stored
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setSettings(prevSettings => ({
        ...prevSettings,
        theme: prevSettings.theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : prevSettings.theme,
      }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));

    // Apply theme class
    document.documentElement.classList.remove('light', 'dark');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeToApply = settings.theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : settings.theme;
    document.documentElement.classList.add(themeToApply);

    // Apply density class
    document.documentElement.classList.remove('density-compact', 'density-comfortable');
    if (settings.density !== 'default') {
        document.documentElement.classList.add(`density-${settings.density}`);
    }

  }, [settings]);

  const setTheme = (theme: Theme) => {
    setSettings(prevSettings => ({ ...prevSettings, theme }));
  };

  const setDensity = (density: Density) => {
    setSettings(prevSettings => ({ ...prevSettings, density }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('appSettings');
    // Clean up classes
    document.documentElement.classList.remove('light', 'dark', 'density-compact', 'density-comfortable');
     // Re-apply system theme preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.add(systemPrefersDark ? 'dark' : 'light');
  };

  return (
    <AppSettingsContext.Provider value={{ ...settings, setTheme, setDensity, resetSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};