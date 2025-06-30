
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { ImageStorage } from '@/lib/imageStorage';

interface VoucherImagePreviewProps {
  open: boolean;
  onClose: () => void;
  imageIds: string[];
  voucherName: string;
}

export const VoucherImagePreview = ({ 
  open, 
  onClose, 
  imageIds, 
  voucherName 
}: VoucherImagePreviewProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageData, setImageData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const loadImage = async (imageId: string) => {
    if (imageData[imageId]) return;
    
    setLoading(true);
    try {
      const data = await ImageStorage.getImage(imageId);
      if (data) {
        setImageData(prev => ({ ...prev, [imageId]: data }));
      }
    } catch (error) {
      console.error('Failed to load image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentImageIndex(prev => 
      prev > 0 ? prev - 1 : imageIds.length - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex(prev => 
      prev < imageIds.length - 1 ? prev + 1 : 0
    );
  };

  const handleDownload = () => {
    const currentImageId = imageIds[currentImageIndex];
    const data = imageData[currentImageId];
    if (data) {
      const link = document.createElement('a');
      link.download = `${voucherName}_image_${currentImageIndex + 1}.jpg`;
      link.href = data;
      link.click();
    }
  };

  // Load current image when dialog opens or index changes
  useEffect(() => {
    if (open && imageIds[currentImageIndex]) {
      loadImage(imageIds[currentImageIndex]);
    }
  }, [open, currentImageIndex, imageIds]);

  const currentImageId = imageIds[currentImageIndex];
  const currentImage = imageData[currentImageId];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{voucherName} - Image {currentImageIndex + 1} of {imageIds.length}</span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!currentImage}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg min-h-[400px]">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : currentImage ? (
            <img
              src={currentImage}
              alt={`${voucherName} image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[60vh] object-contain rounded"
            />
          ) : (
            <div className="text-center text-gray-500">Image not found</div>
          )}

          {imageIds.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 transform -translate-y-1/2"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {imageIds.length > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            {imageIds.map((_, index) => (
              <Button
                key={index}
                variant={index === currentImageIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentImageIndex(index)}
                className="w-8 h-8 p-0"
              >
                {index + 1}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
