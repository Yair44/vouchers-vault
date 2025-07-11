

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { X, RotateCcw } from 'lucide-react';
import { useAccessibility } from './AccessibilityProvider';

interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityMenu = ({ isOpen, onClose }: AccessibilityMenuProps) => {
  const { settings, updateSettings, resetSettings } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Accessibility Options</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetSettings}
              aria-label="Reset accessibility settings"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              aria-label="Close accessibility menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Font Size</Label>
            <ToggleGroup
              type="single"
              value={settings.fontSize}
              onValueChange={(value) => value && updateSettings({ fontSize: value as any })}
              className="grid grid-cols-2 gap-2"
            >
              <ToggleGroupItem value="small" aria-label="Small font size">Small</ToggleGroupItem>
              <ToggleGroupItem value="medium" aria-label="Medium font size">Medium</ToggleGroupItem>
              <ToggleGroupItem value="large" aria-label="Large font size">Large</ToggleGroupItem>
              <ToggleGroupItem value="extra-large" aria-label="Extra large font size">Extra Large</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="text-sm font-medium">
              High Contrast Mode
            </Label>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
              aria-describedby="high-contrast-desc"
            />
          </div>
          <p id="high-contrast-desc" className="text-xs text-gray-600 dark:text-gray-400">
            Increases contrast for better visibility
          </p>

          {/* Color Blind Support */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Color Blind Support</Label>
            <ToggleGroup
              type="single"
              value={settings.colorBlindSupport}
              onValueChange={(value) => value && updateSettings({ colorBlindSupport: value as any })}
              className="flex flex-col space-y-2"
            >
              <ToggleGroupItem value="none" className="w-full justify-start">None</ToggleGroupItem>
              <ToggleGroupItem value="protanopia" className="w-full justify-start">Protanopia (Red-blind)</ToggleGroupItem>
              <ToggleGroupItem value="deuteranopia" className="w-full justify-start">Deuteranopia (Green-blind)</ToggleGroupItem>
              <ToggleGroupItem value="tritanopia" className="w-full justify-start">Tritanopia (Blue-blind)</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Motion Reduction */}
          <div className="flex items-center justify-between">
            <Label htmlFor="motion-reduced" className="text-sm font-medium">
              Reduce Motion
            </Label>
            <Switch
              id="motion-reduced"
              checked={settings.motionReduced}
              onCheckedChange={(checked) => updateSettings({ motionReduced: checked })}
              aria-describedby="motion-reduced-desc"
            />
          </div>
          <p id="motion-reduced-desc" className="text-xs text-gray-600 dark:text-gray-400">
            Disables animations and transitions
          </p>

          {/* Enhanced Focus */}
          <div className="flex items-center justify-between">
            <Label htmlFor="enhanced-focus" className="text-sm font-medium">
              Enhanced Focus Indicators
            </Label>
            <Switch
              id="enhanced-focus"
              checked={settings.enhancedFocus}
              onCheckedChange={(checked) => updateSettings({ enhancedFocus: checked })}
              aria-describedby="enhanced-focus-desc"
            />
          </div>
          <p id="enhanced-focus-desc" className="text-xs text-gray-600 dark:text-gray-400">
            Makes keyboard navigation more visible
          </p>

          {/* Screen Reader Enhanced */}
          <div className="flex items-center justify-between">
            <Label htmlFor="screen-reader" className="text-sm font-medium">
              Screen Reader Enhancements
            </Label>
            <Switch
              id="screen-reader"
              checked={settings.screenReaderEnhanced}
              onCheckedChange={(checked) => updateSettings({ screenReaderEnhanced: checked })}
              aria-describedby="screen-reader-desc"
            />
          </div>
          <p id="screen-reader-desc" className="text-xs text-gray-600 dark:text-gray-400">
            Adds extra descriptions for screen readers
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
