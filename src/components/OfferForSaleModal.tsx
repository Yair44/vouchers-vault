
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Voucher } from '@/types';
import { voucherService } from '@/services/supabase';
import { toast } from '@/hooks/use-toast';

interface OfferForSaleModalProps {
  open: boolean;
  onClose: () => void;
  voucher: Voucher;
  onVoucherUpdated: (updatedVoucher: Voucher) => void;
}

export const OfferForSaleModal = ({ 
  open, 
  onClose, 
  voucher, 
  onVoucherUpdated 
}: OfferForSaleModalProps) => {
  const [salePrice, setSalePrice] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredContact, setPreferredContact] = useState('email');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const salePriceNum = parseFloat(salePrice) || 0;
  const discountAmount = voucher.balance - salePriceNum;
  const discountPercentage = voucher.balance > 0 ? (discountAmount / voucher.balance) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (salePriceNum <= 0 || salePriceNum >= voucher.balance) {
        toast({
          title: "Invalid Sale Price",
          description: `Sale price must be between $0.01 and $${voucher.balance.toFixed(2)}.`,
          variant: "destructive"
        });
        return;
      }

      if (!phone && !email) {
        toast({
          title: "Contact Information Required",
          description: "Please provide either phone number or email address.",
          variant: "destructive"
        });
        return;
      }

      const contactInfo = JSON.stringify({
        phone,
        email,
        preferredContact,
        notes
      });

      const updatedVoucher = await voucherService.updateVoucher(voucher.id, {
        offerForSale: true,
        salePrice: salePriceNum,
        contactInfo
      });

      if (updatedVoucher) {
        onVoucherUpdated(updatedVoucher);
        toast({
          title: "Voucher Listed for Sale",
          description: `${voucher.name} is now offered for $${salePriceNum.toFixed(2)}.`
        });
        
        // Reset form and close
        setSalePrice('');
        setPhone('');
        setEmail('');
        setNotes('');
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to list voucher for sale. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Offer for Sale - {voucher.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Current Value:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                ${voucher.balance.toFixed(2)}
              </span>
            </div>
            {salePrice && salePriceNum > 0 && (
              <>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Your Asking Price:</span>
                  <span className="font-semibold">${salePriceNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Discount Offered:</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {discountPercentage.toFixed(1)}% (${discountAmount.toFixed(2)})
                  </span>
                </div>
              </>
            )}
          </div>

          <div>
            <Label htmlFor="salePrice">Selling Amount *</Label>
            <Input
              id="salePrice"
              type="number"
              step="0.01"
              min="0.01"
              max={voucher.balance}
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Contact Information *</Label>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label>Preferred Contact Method</Label>
              <RadioGroup value={preferredContact} onValueChange={setPreferredContact}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="contact-email" />
                  <Label htmlFor="contact-email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="contact-phone" />
                  <Label htmlFor="contact-phone">Phone</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information for potential buyers..."
                rows={3}
              />
            </div>
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
              type="submit"
              disabled={isLoading || !salePrice || (!phone && !email)}
              className="flex-1"
            >
              {isLoading ? 'Listing...' : 'List for Sale'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
