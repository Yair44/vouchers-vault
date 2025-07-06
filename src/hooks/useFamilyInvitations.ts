import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FamilyInvitation } from '@/types/family';

export const useFamilyInvitations = () => {
  const queryClient = useQueryClient();

  const { data: invitations, isLoading, error } = useQuery({
    queryKey: ['familyInvitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FamilyInvitation[];
    },
  });

  const sendInvitation = useMutation({
    mutationFn: async ({ familyId, email }: { familyId: string; email: string }) => {
      // Check if user exists
      const { data: user } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .single();

      const { data, error } = await supabase
        .from('family_invitations')
        .insert({
          family_id: familyId,
          invited_email: email,
          invited_user_id: user?.user_id,
          invited_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyInvitations'] });
    },
  });

  const respondToInvitation = useMutation({
    mutationFn: async ({ invitationId, action }: { invitationId: string; action: 'accept' | 'reject' }) => {
      const { data: invitation, error: fetchError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('family_invitations')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // If accepted, add user to family
      if (action === 'accept') {
        const { error: memberError } = await supabase
          .from('family_members')
          .insert({
            family_id: invitation.family_id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            role: 'member'
          });

        if (memberError) throw memberError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['familyGroups'] });
    },
  });

  return {
    invitations,
    isLoading,
    error,
    sendInvitation: sendInvitation.mutate,
    respondToInvitation: (invitationId: string, action: 'accept' | 'reject') => 
      respondToInvitation.mutate({ invitationId, action }),
    isSending: sendInvitation.isPending,
    isResponding: respondToInvitation.isPending,
  };
};