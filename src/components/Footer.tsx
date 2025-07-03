
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
          <Link 
            to="/site-terms" 
            className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium"
          >
            Site Terms
          </Link>
          <Link 
            to="/privacy-policy" 
            className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium"
          >
            Privacy Policy
          </Link>
          <Link 
            to="/accessibility-statement" 
            className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium"
          >
            Accessibility Statement
          </Link>
          <Link 
            to="/contact-us" 
            className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium"
          >
            Contact Us
          </Link>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © 2025 Voucher Manager. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
