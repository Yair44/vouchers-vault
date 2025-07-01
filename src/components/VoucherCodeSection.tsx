
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Download, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoucherStatusBadge } from './VoucherStatusBadge';
import { Voucher, Transaction } from '@/types';

interface VoucherCodeSectionProps {
  code: string;
  imageIds?: string[];
  voucherName: string;
  voucher?: Voucher;
  transactions?: Transaction[];
  onImagePreview?: () => void;
  onImageUpload?: (files: FileList) => void;
  onImageRemove?: (index: number) => void;
  isUploadingImage?: boolean;
  className?: string;
}

export const VoucherCodeSection = ({ 
  code, 
  imageIds = [], 
  voucherName,
  voucher,
  transactions = [],
  onImagePreview,
  onImageUpload,
  onImageRemove,
  isUploadingImage = false,
  className 
}: VoucherCodeSectionProps) => {
  const hasImages = imageIds.length > 0;

  return (
    <Card className={cn("overflow-hidden shadow-md", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Voucher Code with Status Badge */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              {voucher && (
                <VoucherStatusBadge voucher={voucher} transactions={transactions} />
              )}
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Voucher Code
              </h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-2 border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-xl font-mono font-bold text-gray-900 dark:text-gray-100 tracking-wider">
                {code}
              </p>
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Images ({imageIds.length}/2)
              </h4>
              {hasImages && onImagePreview && (
                <Button variant="outline" size="sm" onClick={onImagePreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Images
                </Button>
              )}
            </div>

            {hasImages && (
              <div className="space-y-2">
                {imageIds.map((imageId, index) => (
                  <div key={imageId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Image {index + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onImageRemove?.(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {imageIds.length < 2 && onImageUpload && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && onImageUpload(e.target.files)}
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
      </CardContent>
    </Card>
  );
};
