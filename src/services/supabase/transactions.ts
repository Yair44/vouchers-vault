import { supabase } from '@/integrations/supabase/client';
import { handleSecureError } from '@/lib/errorHandler';
import { Transaction } from '@/types';

export const transactionService = {
  async getTransactionsByVoucherId(voucherId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('voucher_id', voucherId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(transaction => ({
        id: transaction.id,
        voucherId: transaction.voucher_id,
        amount: Number(transaction.amount),
        previousBalance: Number(transaction.previous_balance),
        newBalance: Number(transaction.new_balance),
        description: transaction.description,
        purchaseDate: transaction.purchase_date ? new Date(transaction.purchase_date) : undefined,
        createdAt: new Date(transaction.created_at || '')
      }));
    } catch (error) {
      handleSecureError(error, 'database');
      return [];
    }
  },

  async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          voucher_id: transactionData.voucherId,
          amount: transactionData.amount,
          previous_balance: transactionData.previousBalance,
          new_balance: transactionData.newBalance,
          description: transactionData.description,
          purchase_date: transactionData.purchaseDate?.toISOString().split('T')[0] || null
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        voucherId: data.voucher_id,
        amount: Number(data.amount),
        previousBalance: Number(data.previous_balance),
        newBalance: Number(data.new_balance),
        description: data.description,
        purchaseDate: data.purchase_date ? new Date(data.purchase_date) : undefined,
        createdAt: new Date(data.created_at || '')
      };
    } catch (error) {
      handleSecureError(error, 'database');
      return null;
    }
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const updateData: any = {};
      
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.previousBalance !== undefined) updateData.previous_balance = updates.previousBalance;
      if (updates.newBalance !== undefined) updateData.new_balance = updates.newBalance;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.purchaseDate !== undefined) updateData.purchase_date = updates.purchaseDate?.toISOString().split('T')[0] || null;

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        voucherId: data.voucher_id,
        amount: Number(data.amount),
        previousBalance: Number(data.previous_balance),
        newBalance: Number(data.new_balance),
        description: data.description,
        purchaseDate: data.purchase_date ? new Date(data.purchase_date) : undefined,
        createdAt: new Date(data.created_at || '')
      };
    } catch (error) {
      handleSecureError(error, 'database');
      return null;
    }
  },

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      handleSecureError(error, 'database');
      return false;
    }
  }
};