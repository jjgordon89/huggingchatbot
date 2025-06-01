
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Density = 'default' | 'compact' | 'comfortable';

interface DensityContextType {
  density: Density;
  setDensity: (density: Density) => void;
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

interface DensityProviderProps {
  children: ReactNode;
}

export const DensityProvider: React.FC<DensityProviderProps> = ({ children }) => {
  const [density, setDensityState] = useState<Density>(() => {
    const storedDensity = localStorage.getItem('interface-density');
    if (storedDensity === 'compact' || storedDensity === 'comfortable') {
      return storedDensity;
    }
    return 'default';
  });

  useEffect(() => {
    // Apply the correct class to the document element
    document.documentElement.classList.remove('density-compact', 'density-comfortable');
    if (density !== 'default') {
      document.documentElement.classList.add(`density-${density}`);
    }
    // Save preference to local storage
    localStorage.setItem('interface-density', density);
  }, [density]);

  const setDensity = (newDensity: Density) => {
    setDensityState(newDensity);
  };

  return (
    <DensityContext.Provider value={{ density, setDensity }}>
      {children}
    </DensityContext.Provider>
  );
};

export const useDensity = (): DensityContextType => {
  const context = useContext(DensityContext);
  if (context === undefined) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
};

export type { Density, DensityContextType };
