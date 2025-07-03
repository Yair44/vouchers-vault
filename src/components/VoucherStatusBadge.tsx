
import { Badge } from '@/components/ui/badge';
import { getVoucherStatus } from '@/types';
import { Voucher, Transaction } from '@/types';
import { cn } from '@/lib/utils';

interface VoucherStatusBadgeProps {
  voucher: Voucher;
  transactions?: Transaction[];
  className?: string;
}

export const VoucherStatusBadge = ({ voucher, transactions = [], className }: VoucherStatusBadgeProps) => {
  const status = getVoucherStatus(voucher, transactions);
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'expired':
        return {
          label: 'Expired',
          className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/20'
        };
      case 'new':
        return {
          label: 'New',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/20'
        };
      case 'unused':
        return {
          label: 'Unused',
          className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/20'
        };
      case 'partially_used':
        return {
          label: 'Partially Used',
          className: 'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/20'
        };
      case 'fully_used':
        return {
          label: 'Fully Used',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/20'
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/20'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};
