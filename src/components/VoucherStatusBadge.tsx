
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
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        };
      case 'new':
        return {
          label: 'New',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        };
      case 'unused':
        return {
          label: 'Unused',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        };
      case 'partially_used':
        return {
          label: 'Partially Used',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        };
      case 'fully_used':
        return {
          label: 'Fully Used',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};
