// Mock database implementation
// TODO: Replace with actual Supabase integration

import { User, Voucher, Transaction, SharedVoucher } from '@/types';

// Mock data storage
const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    webhookUrl: 'https://api.example.com/webhook',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: new Date('2024-01-01')
  }
];

const vouchers: Voucher[] = [
  {
    id: '1',
    userId: '1',
    name: 'Amazon Gift Card',
    code: 'AMZN-1234-5678-9012',
    type: 'gift_card',
    balance: 85.50,
    originalBalance: 100.00,
    expiryDate: new Date('2025-12-31'),
    notes: 'Birthday gift from mom',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-20')
  },
  {
    id: '2',
    userId: '1',
    name: 'Starbucks Card',
    code: 'SB-9876-5432-1098',
    type: 'gift_card',
    balance: 23.75,
    originalBalance: 50.00,
    expiryDate: new Date('2025-01-15'),
    notes: 'Office coffee runs',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-06-25')
  },
  {
    id: '3',
    userId: '1',
    name: '20% Off Coupon',
    code: 'SAVE20NOW',
    type: 'coupon',
    balance: 1,
    originalBalance: 1,
    expiryDate: new Date('2024-07-15'),
    notes: 'Online shopping discount',
    isActive: true,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01')
  },
  {
    id: '4',
    userId: '1',
    name: 'Target Gift Card',
    code: 'TGT-4567-8901-2345',
    type: 'gift_card',
    balance: 45.25,
    originalBalance: 50.00,
    expiryDate: new Date('2025-08-30'),
    notes: 'Shopping voucher',
    isActive: true,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-06-15')
  },
  {
    id: '5',
    userId: '1',
    name: 'Best Buy Electronics Card',
    code: 'BB-7890-1234-5678',
    type: 'gift_card',
    balance: 120.00,
    originalBalance: 120.00,
    expiryDate: new Date('2025-11-20'),
    notes: 'Electronics purchase',
    isActive: true,
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-04-05')
  },
  {
    id: '6',
    userId: '1',
    name: 'Netflix Premium Voucher',
    code: 'NF-PREM-9876-5432',
    type: 'coupon',
    balance: 15.99,
    originalBalance: 15.99,
    expiryDate: new Date('2025-02-28'),
    notes: 'Streaming service',
    isActive: true,
    createdAt: new Date('2024-05-12'),
    updatedAt: new Date('2024-05-12')
  },
  {
    id: '7',
    userId: '1',
    name: 'McDonald\'s Meal Card',
    code: 'MCD-MEAL-1111-2222',
    type: 'gift_card',
    balance: 25.50,
    originalBalance: 30.00,
    expiryDate: new Date('2025-04-15'),
    notes: 'Fast food voucher',
    isActive: true,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-20')
  },
  {
    id: '8',
    userId: '1',
    name: 'Home Depot Card',
    code: 'HD-HOME-3333-4444',
    type: 'gift_card',
    balance: 75.80,
    originalBalance: 100.00,
    expiryDate: new Date('2025-09-10'),
    notes: 'Home improvement store',
    isActive: true,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-05-30')
  }
];

const transactions: Transaction[] = [
  {
    id: '1',
    voucherId: '1',
    amount: -14.50,
    previousBalance: 100.00,
    newBalance: 85.50,
    description: 'Used for book purchase',
    createdAt: new Date('2024-06-20')
  },
  {
    id: '2',
    voucherId: '2',
    amount: -26.25,
    previousBalance: 50.00,
    newBalance: 23.75,
    description: 'Coffee and snacks',
    createdAt: new Date('2024-06-25')
  }
];

// Mock API functions
export const db = {
  users: {
    findById: (id: string) => users.find(u => u.id === id),
    findByEmail: (email: string) => users.find(u => u.email === email),
    create: (userData: Omit<User, 'id' | 'createdAt'>) => {
      const user: User = {
        ...userData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date()
      };
      users.push(user);
      return user;
    }
  },
  
  vouchers: {
    findByUserId: (userId: string) => vouchers.filter(v => v.userId === userId),
    findById: (id: string) => vouchers.find(v => v.id === id),
    create: (voucherData: Omit<Voucher, 'id' | 'createdAt' | 'updatedAt'>) => {
      const voucher: Voucher = {
        ...voucherData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      vouchers.push(voucher);
      return voucher;
    },
    update: (id: string, updates: Partial<Voucher>) => {
      const index = vouchers.findIndex(v => v.id === id);
      if (index !== -1) {
        vouchers[index] = { ...vouchers[index], ...updates, updatedAt: new Date() };
        return vouchers[index];
      }
      return null;
    },
    delete: (id: string) => {
      const index = vouchers.findIndex(v => v.id === id);
      if (index !== -1) {
        vouchers.splice(index, 1);
        return true;
      }
      return false;
    }
  },
  
  transactions: {
    findByVoucherId: (voucherId: string) => transactions.filter(t => t.voucherId === voucherId),
    create: (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
      const transaction: Transaction = {
        ...transactionData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date()
      };
      transactions.push(transaction);
      return transaction;
    }
  }
};

// Mock current user (TODO: Replace with actual authentication)
export const getCurrentUser = (): User => {
  return users[0]; // Return first user for demo
};
