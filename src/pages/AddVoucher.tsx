
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Upload } from 'lucide-react';
import { db, getCurrentUser } from '@/lib/db';
import { VoucherType } from '@/types';
import { toast } from '@/hooks/use-toast';

const colorOptions = [
  { value: '#FF6B6B', label: 'Red', color: '#FF6B6B' },
  { value: '#4ECDC4', label: 'Teal', color: '#4ECDC4' },
  { value: '#45B7D1', label: 'Blue', color: '#45B7D1' },
  { value: '#96CEB4', label: 'Green', color: '#96CEB4' },
  { value: '#FFEAA7', label: 'Yellow', color: '#FFEAA7' },
  { value: '#DDA0DD', label: 'Purple', color: '#DDA0DD' },
  { value: '#FFB347', label: 'Orange', color: '#FFB347' },
  { value: '#F8BBD9', label: 'Pink', color: '#F8BBD9' },
];

export const AddVoucher = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'gift_card' as VoucherType,
    balance: '',
    expiryDate: '',
    notes: '',
    colorTag: colorOptions[0].value,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const balance = parseFloat(formData.balance);
      
      if (isNaN(balance) || balance < 0) {
        toast({
          title: "Invalid Balance",
          description: "Please enter a valid balance amount.",
          variant: "destructive",
        });
        return;
      }

      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= new Date()) {
        toast({
          title: "Invalid Expiry Date",
          description: "Expiry date must be in the future.",
          variant: "destructive",
        });
        return;
      }

      // Create voucher
      const voucher = db.vouchers.create({
        userId: user.id,
        name: formData.name,
        code: formData.code,
        type: formData.type,
        balance: balance,
        originalBalance: balance,
        expiryDate: expiryDate,
        notes: formData.notes || undefined,
        colorTag: formData.colorTag,
        isActive: true,
      });

      toast({
        title: "Voucher Added",
        description: `${voucher.name} has been added successfully.`,
      });

      navigate('/vouchers');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add voucher. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Add New Voucher</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add a new voucher, gift card, or coupon to your collection
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Voucher Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Voucher Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Amazon Gift Card"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Voucher Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="e.g., ABCD-1234-EFGH"
                  required
                />
              </div>
            </div>

            {/* Type and Balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value: VoucherType) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gift_card">Gift Card</SelectItem>
                    <SelectItem value="coupon">Coupon</SelectItem>
                    <SelectItem value="loyalty_card">Loyalty Card</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                  onChange={(e) => handleInputChange('balance', e.target.value)}
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
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Color Tag */}
            <div>
              <Label>Color Tag</Label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.colorTag === color.value 
                        ? 'border-gray-800 dark:border-gray-200 scale-110' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color.color }}
                    onClick={() => handleInputChange('colorTag', color.value)}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes or details about this voucher..."
                rows={3}
              />
            </div>

            {/* TODO: Image Upload */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Image upload coming soon! You'll be able to drag and drop voucher images here.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/vouchers')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Adding...' : 'Add Voucher'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
