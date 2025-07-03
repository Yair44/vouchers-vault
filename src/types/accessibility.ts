
export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  colorBlindSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  motionReduced: boolean;
  enhancedFocus: boolean;
  screenReaderEnhanced: boolean;
}

export const defaultAccessibilitySettings: AccessibilitySettings = {
  fontSize: 'medium',
  highContrast: false,
  colorBlindSupport: 'none',
  motionReduced: false,
  enhancedFocus: false,
  screenReaderEnhanced: false,
};
