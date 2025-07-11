
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Accessibility } from 'lucide-react';
import { AccessibilityMenu } from './AccessibilityMenu';

export const AccessibilityButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsMenuOpen(true)}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        size="icon"
        aria-label="Open accessibility menu"
        title="Accessibility Options"
      >
        <Accessibility className="h-6 w-6" />
      </Button>
      
      <AccessibilityMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
};
