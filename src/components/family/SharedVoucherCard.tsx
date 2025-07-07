import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Calendar, DollarSign } from 'lucide-react';
import { DatabaseVoucher } from '@/types/family';

interface SharedVoucherCardProps {
  voucher: DatabaseVoucher;
  onUpdate: () => void;
}

export const SharedVoucherCard = ({ voucher }: SharedVoucherCardProps) => {
  const isExpired = new Date(voucher.expiry_date) < new Date();
  const isOwner = voucher.owner_name === 'You';

  return (
    <Card className={isExpired ? 'opacity-60' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="truncate">{voucher.name}</span>
          <Badge variant={voucher.permission === 'edit' ? 'default' : 'secondary'}>
            {voucher.permission === 'edit' ? (
              <Edit className="h-3 w-3 mr-1" />
            ) : (
              <Eye className="h-3 w-3 mr-1" />
            )}
            {voucher.permission}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">${voucher.balance}</span>
          <span className="text-muted-foreground">/ ${voucher.original_balance}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Expires {new Date(voucher.expiry_date).toLocaleDateString()}</span>
        </div>
        
        {voucher.category && (
          <Badge variant="outline" className="text-xs">
            {voucher.category}
          </Badge>
        )}
        
        <div className="text-xs text-muted-foreground">
          {isOwner ? 'Shared by you' : `Shared by ${voucher.owner_name}`}
        </div>
      </CardContent>
    </Card>
  );
};