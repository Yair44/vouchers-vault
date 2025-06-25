
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
  type: VoucherType;
  balance: number;
  originalBalance: number;
  expiryDate: Date;
  notes?: string;
  colorTag: string;
  imageUrl?: string;
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

export type VoucherType = 'gift_card' | 'coupon' | 'loyalty_card' | 'discount' | 'other';

export interface VoucherStats {
  totalVouchers: number;
  totalValue: number;
  expiringCount: number;
  activeCount: number;
}
