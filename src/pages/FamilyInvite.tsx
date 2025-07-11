import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface InvitationData {
  id: string;
  family_id: string;
  invited_email: string;
  status: string;
  family_groups: {
    name: string;
  } | null;
}

export const FamilyInvite = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('family_invitations')
          .select(`
            id,
            family_id,
            invited_email,
            status,
            family_groups(name)
          `)
          .eq('invite_token', token)
          .single();

        if (error) throw error;
        setInvitation(data);
      } catch (error) {
        console.error('Error fetching invitation:', error);
        toast({
          title: "Error",
          description: "Invalid or expired invitation link",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleResponse = async (action: 'accept' | 'reject') => {
    if (!invitation || !user) return;

    setResponding(true);

    try {
      if (action === 'accept') {
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
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Invitation ${action}ed successfully`,
      });

      navigate('/family-share');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} invitation`,
        variant: "destructive",
      });
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Invalid Invitation</h3>
            <p className="text-muted-foreground mb-4">
              This invitation link is invalid or has expired.
            </p>
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.status !== 'pending') {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            {invitation.status === 'accepted' ? (
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            ) : (
              <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            )}
            <h3 className="text-lg font-semibold mb-2">
              Invitation {invitation.status === 'accepted' ? 'Accepted' : 'Declined'}
            </h3>
            <p className="text-muted-foreground mb-4">
              You have already responded to this invitation.
            </p>
            <Button onClick={() => navigate('/family-share')}>
              Go to Family Share
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
            <p className="text-muted-foreground mb-4">
              Please sign in to accept this family invitation.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Users className="h-5 w-5" />
            Family Invitation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div>
            <h3 className="text-lg font-semibold">
              Join {invitation.family_groups?.name}
            </h3>
            <p className="text-muted-foreground">
              You've been invited to join this family group and share vouchers together.
            </p>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => handleResponse('reject')}
              disabled={responding}
            >
              Decline
            </Button>
            <Button 
              className="flex-1"
              onClick={() => handleResponse('accept')}
              disabled={responding}
            >
              {responding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accept'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};