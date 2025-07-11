
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
    console.error('useAccessibility called outside of AccessibilityProvider context');
    console.trace('Call stack for useAccessibility error');
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider = ({ children }: AccessibilityProviderProps) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('accessibility-settings');
      return stored ? JSON.parse(stored) : defaultAccessibilitySettings;
    }
    return defaultAccessibilitySettings;
  });

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultAccessibilitySettings);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    }
    applyAccessibilitySettings(settings);
  }, [settings]);

  const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Font size with scaling factor
    const fontSizeMap = {
      'small': { size: '0.875rem', scale: 0.875 },
      'medium': { size: '1rem', scale: 1 },
      'large': { size: '1.125rem', scale: 1.125 },
      'extra-large': { size: '1.25rem', scale: 1.25 }
    };
    
    const fontConfig = fontSizeMap[settings.fontSize];
    root.style.setProperty('--accessibility-font-size', fontConfig.size);
    root.style.setProperty('--accessibility-font-scale', fontConfig.scale.toString());
    
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
