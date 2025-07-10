import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FamilyGroup, FamilyMember } from '@/types/family';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useFamilyGroups = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: families, isLoading, error, refetch } = useQuery({
    queryKey: ['familyGroups'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

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
    enabled: !!user,
  });

  const createFamily = useMutation({
    mutationFn: async (name: string) => {
      if (!user) {
        console.error('User not authenticated:', { user, session: null });
        throw new Error('User not authenticated');
      }

      console.log('Creating family with user:', { userId: user.id, email: user.email });

      // Create the family group - created_by will be set automatically via DEFAULT auth.uid()
      const { data, error } = await supabase
        .from('family_groups')
        .insert({ name })
        .select()
        .single();

      console.log('Family creation result:', { data, error });

      if (error) throw error;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) {
        console.error('Error adding creator as member:', memberError);
        // Don't throw here since family was created successfully
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyGroups'] });
      toast({
        title: "Success",
        description: "Family group created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error creating family:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create family group",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Family updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update family",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Family deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete family",
        variant: "destructive",
      });
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