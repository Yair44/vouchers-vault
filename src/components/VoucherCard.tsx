import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, Edit } from 'lucide-react';
import { Voucher } from '@/types';
import { cn } from '@/lib/utils';
import { VoucherProgress } from './VoucherProgress';
import { VoucherStatusBadge } from './VoucherStatusBadge';
import { getVoucherStatus } from '@/types';
import { useNavigate } from 'react-router-dom';
interface VoucherCardProps {
  voucher: Voucher;
  className?: string;
}
export const VoucherCard = ({
  voucher,
  className
}: VoucherCardProps) => {
  const navigate = useNavigate();
  const status = getVoucherStatus(voucher);
  const daysUntilExpiry = Math.ceil((voucher.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = status === 'expired';
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'retail':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'restaurants':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'entertainment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'travel':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'services':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  const handleFullDetails = () => {
    navigate(`/voucher/${voucher.id}`);
  };
  return <Card className={cn("hover:shadow-lg transition-all duration-200 relative overflow-hidden shadow-md", voucher.offerForSale && "ring-2 ring-orange-200 dark:ring-orange-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">
              {voucher.name}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <VoucherStatusBadge voucher={voucher} />
            {voucher.offerForSale && <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                For Sale
              </Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${voucher.balance.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              of ${voucher.originalBalance.toFixed(2)}
            </p>
          </div>
          
          {voucher.category && <Badge className={getCategoryColor(voucher.category)}>
              {voucher.category.charAt(0).toUpperCase() + voucher.category.slice(1)}
            </Badge>}
        </div>

        <VoucherProgress current={voucher.balance} original={voucher.originalBalance} />

        {/* Only show expiry details if not expired */}
        {!isExpired && <div className="flex items-center justify-between text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 p-2 rounded">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>
                {isExpiringSoon ? `${daysUntilExpiry} days left` : voucher.expiryDate.toLocaleDateString()}
              </span>
            </div>
            
            {isExpiringSoon && <Badge variant="destructive" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Expiring Soon
              </Badge>}
          </div>}

        <Button variant="outline" size="sm" onClick={handleFullDetails} className="w-full flex items-center justify-center bg-indigo-200 hover:bg-indigo-100">
          <Edit className="h-4 w-4 mr-2" />
          Full Details
        </Button>
      </CardContent>
    </Card>;
};