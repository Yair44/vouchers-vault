
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileImage, X } from 'lucide-react';

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
  onSubmit: (e: React.FormEvent) => void;
}

export const ImageUploadTab = ({ formData, onInputChange, isLoading, onSubmit }: ImageUploadTabProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
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

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          Drag and drop voucher images or PDFs here, or click to browse
        </p>
        <input
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button type="button" variant="outline" asChild>
            <span>Browse Files</span>
          </Button>
        </label>
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

      {/* TODO: OCR Integration */}
      <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded">
        <p><strong>TODO:</strong> OCR integration to automatically extract voucher details from uploaded images.</p>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isLoading ? 'Adding...' : 'Add Voucher'}
      </Button>
    </form>
  );
};
