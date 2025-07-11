
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Voucher } from '@/types';
import { voucherService, transactionService } from '@/services/supabase';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PurchaseRecordModalProps {
  open: boolean;
  onClose: () => void;
  voucher: Voucher;
  onPurchaseRecorded: (updatedVoucher: Voucher) => void;
}

export const PurchaseRecordModal = ({ 
  open, 
  onClose, 
  voucher, 
  onPurchaseRecorded 
}: PurchaseRecordModalProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const purchaseAmount = parseFloat(amount);
      
      if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid purchase amount.",
          variant: "destructive"
        });
        return;
      }

      if (purchaseAmount > voucher.balance) {
        toast({
          title: "Insufficient Balance",
          description: `Amount cannot exceed current balance of $${voucher.balance.toFixed(2)}.`,
          variant: "destructive"
        });
        return;
      }

      // Create transaction record
      const transaction = await transactionService.createTransaction({
        voucherId: voucher.id,
        amount: -purchaseAmount, // Negative for expenditure
        previousBalance: voucher.balance,
        newBalance: voucher.balance - purchaseAmount,
        description: description || 'Purchase recorded',
        purchaseDate
      });

      // Update voucher balance
      const updatedVoucher = await voucherService.updateVoucher(voucher.id, {
        balance: voucher.balance - purchaseAmount
      });

      if (updatedVoucher) {
        onPurchaseRecorded(updatedVoucher);
        toast({
          title: "Purchase Recorded",
          description: `$${purchaseAmount.toFixed(2)} has been deducted from ${voucher.name}.`
        });
        
        // Reset form and close
        setAmount('');
        setDescription('');
        setPurchaseDate(new Date());
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const newBalance = amount ? voucher.balance - parseFloat(amount || '0') : voucher.balance;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Purchase - {voucher.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                ${voucher.balance.toFixed(2)}
              </span>
            </div>
            {amount && !isNaN(parseFloat(amount)) && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">New Balance:</span>
                <span className={`font-semibold ${newBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${Math.max(0, newBalance).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Purchase Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={voucher.balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label>Purchase Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !purchaseDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {purchaseDate ? format(purchaseDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={purchaseDate}
                  onSelect={(date) => date && setPurchaseDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you purchase?"
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
              type="submit"
              disabled={isLoading || !amount}
              className="flex-1"
            >
              {isLoading ? 'Recording...' : 'Record Purchase'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
