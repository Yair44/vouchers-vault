import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVoucherCategories } from '@/hooks/useVoucherCategories';
import { VoucherTypeManager } from '@/components/VoucherTypeManager';
import { Settings, Upload, X } from 'lucide-react';
import { compressImage, validateImageFile } from '@/lib/imageCompression';
import { ImageStorage } from '@/lib/imageStorage';
import { toast } from '@/hooks/use-toast';

interface ManualRecordingTabProps {
  formData: {
    name: string;
    code: string;
    category: string;
    balance: string;
    expiryDate: string;
    notes: string;
    eligibleBusinessesUrl: string;
    voucherUrl: string;
  };
  onInputChange: (field: string, value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent, imageIds?: string[]) => void;
}

export const ManualRecordingTab = ({ formData, onInputChange, isLoading, onSubmit }: ManualRecordingTabProps) => {
  const { getAllCategories } = useVoucherCategories();
  const [showTypeManager, setShowTypeManager] = useState(false);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const allCategories = getAllCategories();

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
        
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const imageId = await ImageStorage.uploadImage(compressedImage, tempId);
        setImageIds(prev => [...prev, imageId]);
      }
      
      if (validFiles.length > 0) {
        toast({
          title: "Images Uploaded",
          description: `${validFiles.length} image(s) uploaded and compressed successfully.`
        });
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

  const handleFormSubmit = (e: React.FormEvent) => {
    onSubmit(e, imageIds);
  };

  const handleCategoryChange = (value: string) => {
    // Convert "none" back to empty string for the form data
    const actualValue = value === "none" ? "" : value;
    onInputChange('category', actualValue);
  };

  return (
    <>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div>
          <Label>Voucher Images (Up to 2)</Label>
          <div className="mt-2 space-y-2">
            {imageIds.map((imageId, index) => (
              <div key={imageId} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Image {index + 1}</span>
                  <span className="text-xs text-gray-500">Compressed & Ready</span>
                </div>
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
                <p className="text-xs text-gray-500 mt-2">
                  Images will be automatically compressed while maintaining clarity for reading text/numbers
                </p>
              </div>
            )}
          </div>
        </div>

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

        {/* Category and Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="category">Category</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTypeManager(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <Select value={formData.category || "none"} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {allCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <span className="capitalize">{category.name.replace('_', ' ')}</span>
                  </SelectItem>
                ))}
                <SelectItem value="__new_category__">+ Add New Category</SelectItem>
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
          className="w-full"
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
