import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Upload, FileImage, X, Scan } from 'lucide-react';
import { compressImage, validateImageFile } from '@/lib/imageCompression';
import { ImageStorage } from '@/lib/imageStorage';
import { toast } from '@/hooks/use-toast';

interface ImageUploadTabProps {
  formData: {
    name: string;
    code: string;
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

export const ImageUploadTab = ({ formData, onInputChange, isLoading, onSubmit }: ImageUploadTabProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || imageIds.length >= 2) return;
    
    const validFiles = Array.from(files).filter(file => 
      validateImageFile(file)
    );
    
    if (validFiles.length === 0) {
      toast({
        title: "Invalid Files",
        description: "Please upload valid image files (JPEG, PNG, WebP) under 10MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
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
      
      setUploadedFiles(prev => [...prev, ...validFiles]);
      
      toast({
        title: "Images Uploaded",
        description: `${validFiles.length} image(s) uploaded and compressed successfully.`
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = async (index: number) => {
    const imageId = imageIds[index];
    try {
      if (imageId) {
        await ImageStorage.deleteImage(imageId);
      }
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
      setImageIds(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleScanFile = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsScanning(true);
    
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Implement actual OCR functionality
      console.log('Scanning files:', uploadedFiles.map(f => f.name));
      
      // Automatically open the form after scanning
      setIsFormOpen(true);
      
    } catch (error) {
      console.error('File scanning failed:', error);
    } finally {
      setIsScanning(false);
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

  return (
    <div className="space-y-6">
      {/* Image Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Drag and drop voucher images here, or click to browse (up to 2 images)
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          id="file-upload"
          disabled={isUploading || imageIds.length >= 2}
        />
        <label htmlFor="file-upload">
          <Button 
            type="button" 
            variant="outline" 
            asChild 
            disabled={isUploading || imageIds.length >= 2}
          >
            <span>
              {isUploading ? 'Uploading...' : `Browse Files (${imageIds.length}/2)`}
            </span>
          </Button>
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Images will be automatically compressed while maintaining clarity for reading text/numbers
        </p>
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Files</Label>
          <div className="grid grid-cols-1 gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <FileImage className="h-4 w-4" />
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <span className="text-xs text-green-600">Compressed</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan File Button */}
      {uploadedFiles.length > 0 && (
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={handleScanFile}
            disabled={isScanning}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {isScanning ? (
              <>
                <Scan className="h-4 w-4 animate-pulse mr-2" />
                Scanning...
              </>
            ) : (
              <>
                <Scan className="h-4 w-4 mr-2" />
                Scan File
              </>
            )}
          </Button>
        </div>
      )}

      {/* Collapsible Form Fields */}
      <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
        <CollapsibleContent className="space-y-4 mt-4">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Mandatory Fields */}
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

            {/* Optional Fields */}
            <div>
              <Label htmlFor="code">Voucher Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => onInputChange('code', e.target.value)}
                placeholder="e.g., ABCD-1234-EFGH"
              />
            </div>

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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Adding...' : 'Add Voucher'}
            </Button>
          </form>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
