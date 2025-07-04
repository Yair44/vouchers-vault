
import { Search, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '@/lib/db';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const user = getCurrentUser();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center space-x-3">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
            aria-label="Voucher Manager - Go to Dashboard"
          >
            <img 
              src="/lovable-uploads/4ed15e17-ca72-48ac-be16-9691101b205f.png" 
              alt="Voucher.call Logo" 
              className="h-8 w-auto sm:h-9"
            />
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Desktop Search */}
          <div className="hidden md:flex items-center space-x-2 flex-1 max-w-md ml-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vouchers..."
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{user.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
