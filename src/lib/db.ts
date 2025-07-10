
// Mock database implementation
// TODO: Replace with actual Supabase integration

import { User, Voucher, Transaction, SharedVoucher } from '@/types';

// Mock data storage - CLEARED to prevent dummy data conflicts
const users: User[] = [];
const vouchers: Voucher[] = [];
const transactions: Transaction[] = [];

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
    },
    update: (id: string, updates: Partial<Transaction>) => {
      const index = transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates };
        return transactions[index];
      }
      return null;
    },
    delete: (id: string) => {
      const index = transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        transactions.splice(index, 1);
        return true;
      }
      return false;
    }
  }
};

// Mock current user (TODO: Replace with actual authentication)
export const getCurrentUser = (): User => {
  return users[0]; // Return first user for demo
};
