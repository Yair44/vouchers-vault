
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<string> => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    maxSizeKB = 500
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Apply image smoothing for better text clarity
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with compression
      let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Check file size and adjust quality if needed
      const sizeKB = (compressedDataUrl.length * 3/4) / 1024;
      
      if (sizeKB > maxSizeKB && quality > 0.3) {
        const newQuality = Math.max(0.3, quality * (maxSizeKB / sizeKB));
        compressedDataUrl = canvas.toDataURL('image/jpeg', newQuality);
      }

      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  return validTypes.includes(file.type) && file.size <= maxSize;
};
