
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Voucher } from '@/types';
import { db } from '@/lib/db';
import { toast } from '@/hooks/use-toast';
import { useVoucherCategories } from '@/hooks/useVoucherCategories';
import { VoucherDeleteModal } from './VoucherDeleteModal';
import { Trash2 } from 'lucide-react';

interface VoucherEditModalProps {
  open: boolean;
  onClose: () => void;
  voucher: Voucher;
  onVoucherUpdated: (updatedVoucher: Voucher) => void;
}

export const VoucherEditModal = ({ 
  open, 
  onClose, 
  voucher, 
  onVoucherUpdated 
}: VoucherEditModalProps) => {
  const [formData, setFormData] = useState({
    name: voucher.name,
    code: voucher.code,
    category: voucher.category,
    notes: voucher.notes || '',
    eligibleBusinessesUrl: voucher.eligibleBusinessesUrl || '',
    voucherUrl: voucher.voucherUrl || '',
    expiryDate: voucher.expiryDate.toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { getAllCategories } = useVoucherCategories();
  const allCategories = getAllCategories();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!validateUrl(formData.eligibleBusinessesUrl) || !validateUrl(formData.voucherUrl)) {
        toast({
          title: "Invalid URL",
          description: "Please enter valid URLs.",
          variant: "destructive"
        });
        return;
      }

      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= new Date()) {
        toast({
          title: "Invalid Expiry Date",
          description: "Expiry date must be in the future.",
          variant: "destructive"
        });
        return;
      }

      const updatedVoucher = db.vouchers.update(voucher.id, {
        name: formData.name,
        code: formData.code,
        category: formData.category,
        notes: formData.notes || undefined,
        eligibleBusinessesUrl: formData.eligibleBusinessesUrl || undefined,
        voucherUrl: formData.voucherUrl || undefined,
        expiryDate: expiryDate
      });

      if (updatedVoucher) {
        onVoucherUpdated(updatedVoucher);
        toast({
          title: "Voucher Updated",
          description: `${updatedVoucher.name} has been updated successfully.`
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update voucher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVoucher = () => {
    const success = db.vouchers.delete(voucher.id);
    if (success) {
      toast({
        title: "Voucher Deleted",
        description: `${voucher.name} has been permanently deleted.`
      });
      onClose();
      // Navigate back to vouchers page
      window.location.href = '/vouchers';
    } else {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the voucher. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Voucher - {voucher.name}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Voucher Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Voucher Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        <span className="capitalize">{category.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* URL Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="eligibleBusinessesUrl">Eligible Businesses URL</Label>
                <Input
                  id="eligibleBusinessesUrl"
                  type="url"
                  value={formData.eligibleBusinessesUrl}
                  onChange={(e) => handleInputChange('eligibleBusinessesUrl', e.target.value)}
                  placeholder="https://example.com/eligible-businesses"
                  className={!validateUrl(formData.eligibleBusinessesUrl) ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label htmlFor="voucherUrl">Voucher URL</Label>
                <Input
                  id="voucherUrl"
                  type="url"
                  value={formData.voucherUrl}
                  onChange={(e) => handleInputChange('voucherUrl', e.target.value)}
                  placeholder="https://example.com/voucher"
                  className={!validateUrl(formData.voucherUrl) ? 'border-red-500' : ''}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Updating...' : 'Update Voucher'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <VoucherDeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        voucherName={voucher.name}
        onConfirmDelete={handleDeleteVoucher}
      />
    </>
  );
};
