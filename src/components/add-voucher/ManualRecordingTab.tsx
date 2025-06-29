
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVoucherTypes } from '@/hooks/useVoucherTypes';
import { VoucherTypeManager } from '@/components/VoucherTypeManager';
import { useState } from 'react';
import { Settings } from 'lucide-react';

interface ManualRecordingTabProps {
  formData: {
    name: string;
    code: string;
    type: string;
    balance: string;
    expiryDate: string;
    notes: string;
    eligibleBusinessesUrl: string;
    voucherUrl: string;
  };
  onInputChange: (field: string, value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const ManualRecordingTab = ({ formData, onInputChange, isLoading, onSubmit }: ManualRecordingTabProps) => {
  const { getAllTypes } = useVoucherTypes();
  const [showTypeManager, setShowTypeManager] = useState(false);
  const allTypes = getAllTypes();

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Name and Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Voucher Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="e.g., Amazon Gift Card"
              required
            />
          </div>
          <div>
            <Label htmlFor="code">Voucher Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => onInputChange('code', e.target.value)}
              placeholder="e.g., ABCD-1234-EFGH"
            />
          </div>
        </div>

        {/* Type and Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="type">Type *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTypeManager(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <Select value={formData.type} onValueChange={(value) => onInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {allTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    <span className="capitalize">{type.name.replace('_', ' ')}</span>
                  </SelectItem>
                ))}
                <SelectItem value="__new_type__">+ Add New Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="balance">Balance/Value *</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              min="0"
              value={formData.balance}
              onChange={(e) => onInputChange('balance', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <Label htmlFor="expiryDate">Expiry Date *</Label>
          <Input
            id="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => onInputChange('expiryDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        {/* URL Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="eligibleBusinessesUrl">Eligible Businesses for Usage</Label>
            <Input
              id="eligibleBusinessesUrl"
              type="url"
              value={formData.eligibleBusinessesUrl}
              onChange={(e) => onInputChange('eligibleBusinessesUrl', e.target.value)}
              placeholder="https://example.com/eligible-businesses"
              className={!validateUrl(formData.eligibleBusinessesUrl) ? 'border-red-500' : ''}
            />
            {formData.eligibleBusinessesUrl && !validateUrl(formData.eligibleBusinessesUrl) && (
              <p className="text-sm text-red-500 mt-1">Please enter a valid URL</p>
            )}
          </div>
          <div>
            <Label htmlFor="voucherUrl">Voucher Link</Label>
            <Input
              id="voucherUrl"
              type="url"
              value={formData.voucherUrl}
              onChange={(e) => onInputChange('voucherUrl', e.target.value)}
              placeholder="https://example.com/voucher"
              className={!validateUrl(formData.voucherUrl) ? 'border-red-500' : ''}
            />
            {formData.voucherUrl && !validateUrl(formData.voucherUrl) && (
              <p className="text-sm text-red-500 mt-1">Please enter a valid URL</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => onInputChange('notes', e.target.value)}
            placeholder="Add any additional notes or details about this voucher..."
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading ? 'Adding...' : 'Add Voucher'}
        </Button>
      </form>

      <VoucherTypeManager 
        open={showTypeManager} 
        onClose={() => setShowTypeManager(false)} 
      />
    </>
  );
};
