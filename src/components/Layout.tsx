
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { AccessibilityButton } from './accessibility/AccessibilityButton';
import { ColorBlindFilters } from './accessibility/ColorBlindFilters';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({
  children
}: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-4 lg:p-6 bg-violet-50 flex-1">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
      
      {/* Accessibility Button */}
      <AccessibilityButton />
      
      {/* Color Blind Support SVG Filters */}
      <ColorBlindFilters />
    </div>
  );
};
