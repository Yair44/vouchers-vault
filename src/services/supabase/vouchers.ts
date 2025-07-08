import { supabase } from '@/integrations/supabase/client';
import { handleSecureError } from '@/lib/errorHandler';
import { Voucher } from '@/types';

export const voucherService = {
  async getVouchersByUserId(userId: string): Promise<Voucher[]> {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(voucher => ({
        id: voucher.id,
        userId: voucher.user_id,
        name: voucher.name,
        code: voucher.code,
        category: voucher.category || undefined,
        balance: Number(voucher.balance),
        originalBalance: Number(voucher.original_balance),
        expiryDate: new Date(voucher.expiry_date),
        notes: voucher.notes || undefined,
        imageUrls: voucher.image_urls || undefined,
        eligibleBusinessesUrl: voucher.eligible_businesses_url || undefined,
        voucherUrl: voucher.voucher_url || undefined,
        isActive: voucher.is_active,
        offerForSale: voucher.offer_for_sale || undefined,
        salePrice: voucher.sale_price ? Number(voucher.sale_price) : undefined,
        contactInfo: voucher.contact_info || undefined,
        createdAt: new Date(voucher.created_at || ''),
        updatedAt: new Date(voucher.updated_at || '')
      }));
    } catch (error) {
      handleSecureError(error, 'database');
      return [];
    }
  },

  async getVoucherById(id: string): Promise<Voucher | null> {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        code: data.code,
        category: data.category || undefined,
        balance: Number(data.balance),
        originalBalance: Number(data.original_balance),
        expiryDate: new Date(data.expiry_date),
        notes: data.notes || undefined,
        imageUrls: data.image_urls || undefined,
        eligibleBusinessesUrl: data.eligible_businesses_url || undefined,
        voucherUrl: data.voucher_url || undefined,
        isActive: data.is_active,
        offerForSale: data.offer_for_sale || undefined,
        salePrice: data.sale_price ? Number(data.sale_price) : undefined,
        contactInfo: data.contact_info || undefined,
        createdAt: new Date(data.created_at || ''),
        updatedAt: new Date(data.updated_at || '')
      };
    } catch (error) {
      handleSecureError(error, 'database');
      return null;
    }
  },

  async createVoucher(userId: string, voucherData: Omit<Voucher, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Voucher | null> {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .insert({
          user_id: userId,
          name: voucherData.name,
          code: voucherData.code,
          category: voucherData.category || null,
          balance: voucherData.balance,
          original_balance: voucherData.originalBalance,
          expiry_date: voucherData.expiryDate.toISOString().split('T')[0],
          notes: voucherData.notes || null,
          image_urls: voucherData.imageUrls || null,
          eligible_businesses_url: voucherData.eligibleBusinessesUrl || null,
          voucher_url: voucherData.voucherUrl || null,
          is_active: voucherData.isActive,
          offer_for_sale: voucherData.offerForSale || false,
          sale_price: voucherData.salePrice || null,
          contact_info: voucherData.contactInfo || null
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        code: data.code,
        category: data.category || undefined,
        balance: Number(data.balance),
        originalBalance: Number(data.original_balance),
        expiryDate: new Date(data.expiry_date),
        notes: data.notes || undefined,
        imageUrls: data.image_urls || undefined,
        eligibleBusinessesUrl: data.eligible_businesses_url || undefined,
        voucherUrl: data.voucher_url || undefined,
        isActive: data.is_active,
        offerForSale: data.offer_for_sale || undefined,
        salePrice: data.sale_price ? Number(data.sale_price) : undefined,
        contactInfo: data.contact_info || undefined,
        createdAt: new Date(data.created_at || ''),
        updatedAt: new Date(data.updated_at || '')
      };
    } catch (error) {
      handleSecureError(error, 'database');
      return null;
    }
  },

  async updateVoucher(id: string, updates: Partial<Voucher>): Promise<Voucher | null> {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.code !== undefined) updateData.code = updates.code;
      if (updates.category !== undefined) updateData.category = updates.category || null;
      if (updates.balance !== undefined) updateData.balance = updates.balance;
      if (updates.originalBalance !== undefined) updateData.original_balance = updates.originalBalance;
      if (updates.expiryDate !== undefined) updateData.expiry_date = updates.expiryDate.toISOString().split('T')[0];
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;
      if (updates.imageUrls !== undefined) updateData.image_urls = updates.imageUrls || null;
      if (updates.eligibleBusinessesUrl !== undefined) updateData.eligible_businesses_url = updates.eligibleBusinessesUrl || null;
      if (updates.voucherUrl !== undefined) updateData.voucher_url = updates.voucherUrl || null;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.offerForSale !== undefined) updateData.offer_for_sale = updates.offerForSale || false;
      if (updates.salePrice !== undefined) updateData.sale_price = updates.salePrice || null;
      if (updates.contactInfo !== undefined) updateData.contact_info = updates.contactInfo || null;

      const { data, error } = await supabase
        .from('vouchers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        code: data.code,
        category: data.category || undefined,
        balance: Number(data.balance),
        originalBalance: Number(data.original_balance),
        expiryDate: new Date(data.expiry_date),
        notes: data.notes || undefined,
        imageUrls: data.image_urls || undefined,
        eligibleBusinessesUrl: data.eligible_businesses_url || undefined,
        voucherUrl: data.voucher_url || undefined,
        isActive: data.is_active,
        offerForSale: data.offer_for_sale || undefined,
        salePrice: data.sale_price ? Number(data.sale_price) : undefined,
        contactInfo: data.contact_info || undefined,
        createdAt: new Date(data.created_at || ''),
        updatedAt: new Date(data.updated_at || '')
      };
    } catch (error) {
      handleSecureError(error, 'database');
      return null;
    }
  },

  async deleteVoucher(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('vouchers')
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