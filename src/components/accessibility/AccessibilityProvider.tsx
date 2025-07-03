
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilitySettings, defaultAccessibilitySettings } from '@/types/accessibility';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider = ({ children }: AccessibilityProviderProps) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const stored = localStorage.getItem('accessibility-settings');
    return stored ? JSON.parse(stored) : defaultAccessibilitySettings;
  });

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultAccessibilitySettings);
  };

  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applyAccessibilitySettings(settings);
  }, [settings]);

  const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Font size
    const fontSizeMap = {
      'small': '0.875rem',
      'medium': '1rem',
      'large': '1.125rem',
      'extra-large': '1.25rem'
    };
    root.style.setProperty('--accessibility-font-size', fontSizeMap[settings.fontSize]);
    
    // High contrast
    root.classList.toggle('accessibility-high-contrast', settings.highContrast);
    
    // Color blind support
    root.classList.remove('accessibility-protanopia', 'accessibility-deuteranopia', 'accessibility-tritanopia');
    if (settings.colorBlindSupport !== 'none') {
      root.classList.add(`accessibility-${settings.colorBlindSupport}`);
    }
    
    // Motion reduction
    root.classList.toggle('accessibility-motion-reduced', settings.motionReduced);
    
    // Enhanced focus
    root.classList.toggle('accessibility-enhanced-focus', settings.enhancedFocus);
    
    // Screen reader enhancements
    root.classList.toggle('accessibility-screen-reader-enhanced', settings.screenReaderEnhanced);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
