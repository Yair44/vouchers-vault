
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Upload, Users, User, Ticket } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [{
  name: 'Dashboard',
  href: '/',
  icon: LayoutDashboard
}, {
  name: 'My Vouchers',
  href: '/vouchers',
  icon: Ticket
}, {
  name: 'Add Voucher',
  href: '/add',
  icon: Upload
}, {
  name: 'Shared with Me',
  href: '/shared',
  icon: Users
}, {
  name: 'Profile',
  href: '/profile',
  icon: User
}];

export const Sidebar = ({
  isOpen,
  onClose
}: SidebarProps) => {
  const location = useLocation();
  
  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center px-6 py-8 border-b border-gray-200 dark:border-gray-800">
          <Link 
            to="/" 
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
            aria-label="Voucher.co.il - Go to Dashboard"
            onClick={onClose}
          >
            <img 
              src="/lovable-uploads/dca40be2-4b8b-454e-8703-93bfde464786.png" 
              alt="Voucher.co.il Logo" 
              className="h-16 w-auto max-w-full"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 VoucherVault
          </div>
        </div>
      </div>
    </div>
  );
};
