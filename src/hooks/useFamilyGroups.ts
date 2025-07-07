import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FamilyGroup, FamilyMember } from '@/types/family';

export const useFamilyGroups = () => {
  const queryClient = useQueryClient();

  const { data: families, isLoading, error, refetch } = useQuery({
    queryKey: ['familyGroups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_groups')
        .select(`
          *,
          members:family_members(
            id,
            family_id,
            user_id,
            role,
            joined_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (FamilyGroup & { members: FamilyMember[] })[];
    },
  });

  const createFamily = useMutation({
    mutationFn: async (name: string) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('family_groups')
        .insert({ name, created_by: user.id })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyGroups'] });
    },
  });

  const updateFamily = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('family_groups')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyGroups'] });
    },
  });

  const deleteFamily = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('family_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyGroups'] });
    },
  });

  return {
    families,
    isLoading,
    error,
    refetch,
    createFamily: createFamily.mutate,
    updateFamily: updateFamily.mutate,
    deleteFamily: deleteFamily.mutate,
    isCreating: createFamily.isPending,
    isUpdating: updateFamily.isPending,
    isDeleting: deleteFamily.isPending,
  };
};