import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
interface LayoutProps {
  children: React.ReactNode;
}
export const Layout = ({
  children
}: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-4 lg:p-6 bg-violet-50">
          {children}
        </main>
      </div>
    </div>;
};