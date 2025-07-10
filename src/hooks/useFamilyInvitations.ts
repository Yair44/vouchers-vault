import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FamilyInvitation } from '@/types/family';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useFamilyInvitations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ['familyInvitations'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('family_invitations')
        .select(`
          *,
          family_groups(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(invitation => ({
        ...invitation,
        family_name: invitation.family_groups?.name
      })) as FamilyInvitation[];
    },
    enabled: !!user,
  });

  const respondToInvitation = useMutation({
    mutationFn: async ({ invitationId, action }: { invitationId: string; action: 'accept' | 'reject' }) => {
      if (!user) throw new Error('User not authenticated');

      if (action === 'accept') {
        // First, get the invitation details
        const { data: invitation, error: invError } = await supabase
          .from('family_invitations')
          .select('family_id')
          .eq('id', invitationId)
          .single();

        if (invError) throw invError;

        // Add user as family member
        const { error: memberError } = await supabase
          .from('family_members')
          .insert({
            family_id: invitation.family_id,
            user_id: user.id,
            role: 'member'
          });

        if (memberError) throw memberError;
      }

      // Update invitation status
      const { error } = await supabase
        .from('family_invitations')
        .update({ 
          status: action === 'accept' ? 'accepted' : 'rejected',
          invited_user_id: user.id
        })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['familyInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['familyGroups'] });
      
      toast({
        title: "Success",
        description: `Invitation ${action}ed successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to respond to invitation",
        variant: "destructive",
      });
    },
  });

  return {
    invitations,
    isLoading,
    respondToInvitation: (invitationId: string, action: 'accept' | 'reject') => 
      respondToInvitation.mutate({ invitationId, action }),
    isResponding: respondToInvitation.isPending,
  };
};