import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type FeatureFlags = {
  listForSaleEnabled: boolean;
};

export const useSecureFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>({
    listForSaleEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const fetchFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('key, value');

      if (error) throw error;

      const flagsMap = data.reduce((acc, flag) => {
        acc[flag.key as keyof FeatureFlags] = flag.value;
        return acc;
      }, {} as FeatureFlags);

      setFlags(flagsMap);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFlag = async (key: keyof FeatureFlags, value: boolean) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ value })
        .eq('key', key);

      if (error) throw error;

      // Log the admin action
      await supabase
        .from('admin_audit_log')
        .insert({
          user_id: user?.id,
          action: 'feature_flag_update',
          details: {
            flag: key,
            newValue: value,
            previousValue: flags[key]
          }
        });

      // Update local state
      setFlags(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating feature flag:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchFlags();

    // Set up real-time subscription for feature flags
    const channel = supabase
      .channel('feature-flags-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags'
        },
        () => {
          fetchFlags();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { flags, updateFlag, isLoading };
};