import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseVoucher } from '@/types/family';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useSharedVouchers = (filter?: string, familyId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: sharedVouchers, isLoading, error, refetch } = useQuery({
    queryKey: ['sharedVouchers', filter, familyId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('vouchers')
        .select(`
          *,
          shared_vouchers!inner(
            id,
            family_id,
            permission,
            shared_by
          )
        `);

      // Apply family filter if specified
      if (familyId) {
        query = query.eq('shared_vouchers.family_id', familyId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(voucher => ({
        ...voucher,
        owner_name: 'Unknown',
        shared_families: [],
        permission: voucher.shared_vouchers?.[0]?.permission || 'view',
        is_shared: true
      })) as DatabaseVoucher[];
    },
    enabled: !!user,
  });

  const shareVoucher = useMutation({
    mutationFn: async ({ voucherId, familyId, permission }: { 
      voucherId: string; 
      familyId: string; 
      permission: 'view' | 'edit' 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('shared_vouchers')
        .insert({
          voucher_id: voucherId,
          family_id: familyId,
          permission,
          shared_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedVouchers'] });
      toast({
        title: "Success",
        description: "Voucher shared successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to share voucher",
        variant: "destructive",
      });
    },
  });

  const unshareVoucher = useMutation({
    mutationFn: async ({ voucherId, familyId }: { voucherId: string; familyId: string }) => {
      const { error } = await supabase
        .from('shared_vouchers')
        .delete()
        .eq('voucher_id', voucherId)
        .eq('family_id', familyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedVouchers'] });
      toast({
        title: "Success",
        description: "Voucher unshared successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unshare voucher",
        variant: "destructive",
      });
    },
  });

  return {
    sharedVouchers,
    isLoading,
    error,
    refetch,
    shareVoucher: shareVoucher.mutate,
    unshareVoucher: unshareVoucher.mutate,
    isSharing: shareVoucher.isPending,
    isUnsharing: unshareVoucher.isPending,
  };
};