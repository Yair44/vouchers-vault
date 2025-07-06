import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Clock, User, Share2, ExternalLink } from 'lucide-react';
import { DatabaseVoucher } from '@/types/family';
import { useNavigate } from 'react-router-dom';

interface SharedVoucherCardProps {
  voucher: DatabaseVoucher;
  onUpdate: () => void;
}

export const SharedVoucherCard = ({ voucher, onUpdate }: SharedVoucherCardProps) => {
  const navigate = useNavigate();
  
  const expiryDate = new Date(voucher.expiry_date);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

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

  const handleViewDetails = () => {
    navigate(`/voucher/${voucher.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">
              {voucher.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{voucher.owner_name}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={voucher.permission === 'edit' ? 'default' : 'secondary'}>
              {voucher.permission === 'edit' ? (
                <>
                  <Edit className="h-3 w-3 mr-1" />
                  Editable
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  View Only
                </>
              )}
            </Badge>
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
              of ${voucher.original_balance.toFixed(2)}
            </p>
          </div>
          
          {voucher.category && (
            <Badge className={getCategoryColor(voucher.category)}>
              {voucher.category.charAt(0).toUpperCase() + voucher.category.slice(1)}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${Math.max((voucher.balance / voucher.original_balance) * 100, 2)}%`
            }}
          />
        </div>

        {/* Expiry Info */}
        {!isExpired && (
          <div className="flex items-center justify-between text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 p-2 rounded">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>
                {isExpiringSoon ? `${daysUntilExpiry} days left` : expiryDate.toLocaleDateString()}
              </span>
            </div>
            
            {isExpiringSoon && (
              <Badge variant="destructive" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Expiring Soon
              </Badge>
            )}
          </div>
        )}

        {/* Shared Families */}
        {voucher.shared_families && voucher.shared_families.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Share2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              Shared with: {voucher.shared_families.join(', ')}
            </span>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewDetails} 
          className="w-full flex items-center justify-center"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};