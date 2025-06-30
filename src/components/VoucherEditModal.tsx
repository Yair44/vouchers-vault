
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
import { useVoucherTypes } from '@/hooks/useVoucherTypes';
import { Upload, X } from 'lucide-react';
import { compressImage, validateImageFile } from '@/lib/imageCompression';
import { ImageStorage } from '@/lib/imageStorage';

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
    type: voucher.type,
    notes: voucher.notes || '',
    eligibleBusinessesUrl: voucher.eligibleBusinessesUrl || '',
    voucherUrl: voucher.voucherUrl || '',
    expiryDate: voucher.expiryDate.toISOString().split('T')[0]
  });
  const [imageIds, setImageIds] = useState<string[]>(voucher.imageUrls || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { getAllTypes } = useVoucherTypes();
  const allTypes = getAllTypes();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || imageIds.length >= 2) return;

    setIsUploadingImage(true);
    try {
      const validFiles = Array.from(files).filter(validateImageFile);
      
      for (const file of validFiles.slice(0, 2 - imageIds.length)) {
        const compressedImage = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85,
          maxSizeKB: 500
        });
        
        const imageId = await ImageStorage.uploadImage(compressedImage, voucher.id);
        setImageIds(prev => [...prev, imageId]);
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageId = imageIds[index];
    try {
      await ImageStorage.deleteImage(imageId);
      setImageIds(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
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
        type: formData.type,
        notes: formData.notes || undefined,
        eligibleBusinessesUrl: formData.eligibleBusinessesUrl || undefined,
        voucherUrl: formData.voucherUrl || undefined,
        expiryDate: expiryDate,
        imageUrls: imageIds.length > 0 ? imageIds : undefined
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Voucher - {voucher.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Images Section */}
          <div>
            <Label>Images (Up to 2)</Label>
            <div className="mt-2 space-y-2">
              {imageIds.map((imageId, index) => (
                <div key={imageId} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Image {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {imageIds.length < 2 && (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploadingImage}
                  />
                  <label htmlFor="image-upload">
                    <Button type="button" variant="outline" asChild disabled={isUploadingImage}>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploadingImage ? 'Uploading...' : `Add Image (${imageIds.length}/2)`}
                      </span>
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </div>

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
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      <span className="capitalize">{type.name.replace('_', ' ')}</span>
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
  );
};
