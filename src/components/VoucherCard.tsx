
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Images, Edit, ShoppingCart, Clock } from 'lucide-react';
import { Voucher } from '@/types';
import { cn } from '@/lib/utils';
import { VoucherImagePreview } from './VoucherImagePreview';
import { VoucherEditModal } from './VoucherEditModal';
import { PurchaseRecordModal } from './PurchaseRecordModal';

interface VoucherCardProps {
  voucher: Voucher;
  onClick?: () => void;
  className?: string;
  onVoucherUpdated?: (updatedVoucher: Voucher) => void;
}

export const VoucherCard = ({ voucher, onClick, className, onVoucherUpdated }: VoucherCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  const daysUntilExpiry = Math.ceil((voucher.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

  // Get image URLs - support both old single imageUrl and new imageUrls array
  const imageIds = voucher.imageUrls || (voucher.imageUrl ? [voucher.imageUrl] : []);
  const hasImages = imageIds.length > 0;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'gift_card': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'coupon': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'loyalty_card': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'discount': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger onClick if clicking on the card itself, not on buttons
    if (e.target === e.currentTarget || (e.target as Element).closest('.card-content')) {
      onClick?.(e);
    }
  };

  const handleVoucherUpdate = (updatedVoucher: Voucher) => {
    onVoucherUpdated?.(updatedVoucher);
  };

  return (
    <>
      <Card 
        className={cn(
          "hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden",
          isExpired && "opacity-60",
          className
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 card-content">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">
                {voucher.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                {voucher.code}
              </p>
            </div>
            {hasImages && (
              <Badge variant="outline" className="ml-2">
                <Images className="h-3 w-3 mr-1" />
                {imageIds.length}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Legacy single image support */}
          {voucher.imageUrl && !voucher.imageUrls && !imageError && (
            <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={voucher.imageUrl}
                alt={voucher.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}

          <div className="flex items-center justify-between card-content">
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

          <div className="flex items-center justify-between text-sm card-content">
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
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 card-content">
              {voucher.notes}
            </p>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {hasImages ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImagePreview(true);
                }}
                className="flex items-center justify-center"
              >
                <Images className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            ) : (
              <div></div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              className="flex items-center justify-center"
            >
              <Edit className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setShowPurchaseModal(true);
              }}
              disabled={voucher.balance <= 0 || isExpired}
              className="flex items-center justify-center"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Use</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {hasImages && (
        <VoucherImagePreview
          open={showImagePreview}
          onClose={() => setShowImagePreview(false)}
          imageIds={imageIds}
          voucherName={voucher.name}
        />
      )}

      <VoucherEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        voucher={voucher}
        onVoucherUpdated={handleVoucherUpdate}
      />

      <PurchaseRecordModal
        open={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        voucher={voucher}
        onPurchaseRecorded={handleVoucherUpdate}
      />
    </>
  );
};
