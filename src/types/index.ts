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
  type: string; // Changed from VoucherType to string to support custom types
  balance: number;
  originalBalance: number;
  expiryDate: Date;
  notes?: string;
  imageUrl?: string;
  eligibleBusinessesUrl?: string;
  voucherUrl?: string;
  isActive: boolean;
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
  createdAt: Date;
}

export interface SharedVoucher {
  id: string;
  voucherId: string;
  sharedWithUserId: string;
  permission: 'view' | 'edit';
  createdAt: Date;
}

// Keep default types but allow custom ones too
export const DEFAULT_VOUCHER_TYPES = ['gift_card', 'coupon', 'loyalty_card', 'discount', 'other'] as const;

export interface VoucherStats {
  totalVouchers: number;
  totalValue: number;
  expiringCount: number;
  activeCount: number;
}

export interface CustomVoucherType {
  id: string;
  name: string;
  createdAt: Date;
}
