
// Mock image storage for development - replace with actual cloud storage in production
export class ImageStorage {
  private static readonly STORAGE_KEY = 'voucher_images';

  static async uploadImage(imageData: string, voucherId: string): Promise<string> {
    // Generate unique image ID
    const imageId = `${voucherId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store in localStorage for demo (replace with actual upload in production)
    const existingImages = this.getStoredImages();
    existingImages[imageId] = imageData;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingImages));
    
    return imageId;
  }

  static async getImage(imageId: string): Promise<string | null> {
    const existingImages = this.getStoredImages();
    return existingImages[imageId] || null;
  }

  static async deleteImage(imageId: string): Promise<boolean> {
    const existingImages = this.getStoredImages();
    if (existingImages[imageId]) {
      delete existingImages[imageId];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingImages));
      return true;
    }
    return false;
  }

  private static getStoredImages(): Record<string, string> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }
}
