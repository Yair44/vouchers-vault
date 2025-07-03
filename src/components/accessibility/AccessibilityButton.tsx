
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="8" r="1"/>
          <path d="M12 12v4"/>
          <path d="M8 15l8-8"/>
          <path d="M16 15l-8-8"/>
        </svg>
      </Button>
      
      <AccessibilityMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
};
