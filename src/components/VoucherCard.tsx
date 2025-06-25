
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Share, User, Clock } from 'lucide-react';
import { Voucher } from '@/types';
import { cn } from '@/lib/utils';

interface VoucherCardProps {
  voucher: Voucher;
  onClick?: () => void;
  className?: string;
}

export const VoucherCard = ({ voucher, onClick, className }: VoucherCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  const daysUntilExpiry = Math.ceil((voucher.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'gift_card': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'coupon': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'loyalty_card': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'discount': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden",
        isExpired && "opacity-60",
        className
      )}
      onClick={onClick}
    >
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ backgroundColor: voucher.colorTag }}
      />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">
              {voucher.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              {voucher.code}
            </p>
          </div>
          <div 
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: voucher.colorTag }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {voucher.imageUrl && !imageError && (
          <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={voucher.imageUrl}
              alt={voucher.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${voucher.balance.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              of ${voucher.originalBalance.toFixed(2)}
            </p>
          </div>
          
          <Badge className={getTypeColor(voucher.type)}>
            {voucher.type.replace('_', ' ')}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>
              {isExpired ? 'Expired' : isExpiringSoon ? `${daysUntilExpiry} days left` : voucher.expiryDate.toLocaleDateString()}
            </span>
          </div>
          
          {isExpiringSoon && (
            <Badge variant="destructive" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Expiring Soon
            </Badge>
          )}
        </div>

        {voucher.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {voucher.notes}
          </p>
        )}

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement share functionality
            }}
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
