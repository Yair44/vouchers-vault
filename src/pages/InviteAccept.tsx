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
  invited_by: string;
  status: string;
  family_groups: {
    name: string;
  };
}

export const InviteAccept = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('family_invitations')
          .select(`
            id,
            family_id,
            invited_by,
            status,
            family_groups(name)
          `)
          .eq('invite_token', token)
          .eq('status', 'pending')
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Invitation not found or already used');
          } else {
            setError('Failed to load invitation');
          }
        } else {
          setInvitation(data);
        }
      } catch (err) {
        setError('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!user || !invitation) {
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to accept this invitation",
          variant: "destructive",
        });
        navigate('/auth');
      }
      return;
    }

    setAccepting(true);

    try {
      // Add user as family member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: invitation.family_id,
          user_id: user.id,
          role: 'member'
        });

      if (memberError) throw memberError;

      // Update invitation status
      const { error: inviteError } = await supabase
        .from('family_invitations')
        .update({ 
          status: 'accepted',
          invited_user_id: user.id
        })
        .eq('id', invitation.id);

      if (inviteError) throw inviteError;

      toast({
        title: "Success!",
        description: `You've joined ${invitation.family_groups.name}`,
      });

      navigate('/family-share');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!invitation) return;

    try {
      const { error } = await supabase
        .from('family_invitations')
        .update({ status: 'rejected' })
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: "Invitation declined",
        description: "You have declined the family invitation",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to decline invitation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading invitation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-red-600">Invitation Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This invitation link is invalid or has already been used.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="h-12 w-12 mx-auto text-primary mb-4" />
          <CardTitle>Family Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              You've been invited to join
            </p>
            <p className="text-2xl font-bold text-primary">
              {invitation.family_groups.name}
            </p>
          </div>

          {!user ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Please sign in to accept this invitation
              </p>
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full"
              >
                Sign In to Accept
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Would you like to join this family?
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleDeclineInvitation}
                  variant="outline"
                  className="flex-1"
                >
                  Decline
                </Button>
                <Button
                  onClick={handleAcceptInvitation}
                  disabled={accepting}
                  className="flex-1"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept & Join
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};