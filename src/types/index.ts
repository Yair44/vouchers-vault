
export interface User {
  id: string;
  name: string;
  email: string;
  webhookUrl?: string;
  createdAt: Date;
}

export interface Voucher {
  id: string;
  userId: string;
  name: string;
  code: string;
  category?: string; // Changed from type to category
  balance: number;
  originalBalance: number;
  expiryDate: Date;
  notes?: string;
  imageUrl?: string; // Keep for backward compatibility
  imageUrls?: string[]; // New field for multiple images (up to 2)
  eligibleBusinessesUrl?: string;
  voucherUrl?: string;
  isActive: boolean;
  offerForSale?: boolean;
  salePrice?: number;
  contactInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  voucherId: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  description: string;
  purchaseDate?: Date;
  createdAt: Date;
}

export interface SharedVoucher {
  id: string;
  voucherId: string;
  sharedWithUserId: string;
  permission: 'view' | 'edit';
  createdAt: Date;
}

// Updated category system
export const DEFAULT_VOUCHER_CATEGORIES = ['retail', 'restaurants', 'entertainment', 'travel', 'services', 'other'] as const;

export interface VoucherStats {
  totalVouchers: number;
  totalValue: number;
  expiringCount: number;
  activeCount: number;
}

export interface CustomVoucherCategory {
  id: string;
  name: string;
  createdAt: Date;
}

// Utility functions for voucher status
export const getVoucherStatus = (voucher: Voucher, transactions: Transaction[] = []) => {
  const daysSinceCreation = Math.floor((new Date().getTime() - voucher.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const hasTransactions = transactions.length > 0;
  
  if (voucher.balance === 0) return 'fully_used';
  if (hasTransactions) return 'partially_used';
  if (daysSinceCreation <= 7) return 'new';
  return 'unused';
};
