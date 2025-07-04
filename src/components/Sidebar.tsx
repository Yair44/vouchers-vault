import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, Share, Upload, Users, User, Clock } from 'lucide-react';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
const navigation = [{
  name: 'Dashboard',
  href: '/',
  icon: Calendar
}, {
  name: 'My Vouchers',
  href: '/vouchers',
  icon: Calendar
}, {
  name: 'Add Voucher',
  href: '/add',
  icon: Upload
}, {
  name: 'Shared with Me',
  href: '/shared',
  icon: Share
}, {
  name: 'Expiring Soon',
  href: '/expiring',
  icon: Clock
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
  return <div className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0", isOpen ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-50 shadow-green-50 shadow-emerald " />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VoucherVault
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map(item => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return <Link key={item.name} to={item.href} onClick={onClose} className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors", isActive ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800")}>
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>;
        })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 VoucherVault
          </div>
        </div>
      </div>
    </div>;
};