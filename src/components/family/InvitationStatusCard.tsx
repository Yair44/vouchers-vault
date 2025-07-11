import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Copy, Share } from 'lucide-react';
import { FamilyInvitation } from '@/types/family';
import { toast } from '@/hooks/use-toast';

interface InvitationStatusCardProps {
  invitations: FamilyInvitation[];
  currentUserId?: string;
}

export const InvitationStatusCard = ({ invitations, currentUserId }: InvitationStatusCardProps) => {
  const sentInvitations = invitations.filter(inv => inv.invited_by === currentUserId);
  
  if (sentInvitations.length === 0) {
    return null;
  }

  const pendingCount = sentInvitations.filter(inv => inv.status === 'pending').length;
  const acceptedCount = sentInvitations.filter(inv => inv.status === 'accepted').length;
  const rejectedCount = sentInvitations.filter(inv => inv.status === 'rejected').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const copyInviteLink = async (invitationId: string) => {
    const link = `${window.location.origin}/family-invite/${invitationId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Success",
        description: "Invitation link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareInviteLink = async (invitationId: string, familyName: string) => {
    const link = `${window.location.origin}/family-invite/${invitationId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${familyName} Family`,
          text: `You're invited to join the ${familyName} family group!`,
          url: link,
        });
      } catch (error) {
        // User cancelled sharing or sharing not supported
        copyInviteLink(invitationId);
      }
    } else {
      copyInviteLink(invitationId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Invitation Status</span>
          <div className="flex gap-2 text-sm">
            {pendingCount > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                {pendingCount} Pending
              </Badge>
            )}
            {acceptedCount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {acceptedCount} Accepted
              </Badge>
            )}
            {rejectedCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                {rejectedCount} Rejected
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sentInvitations.map((invitation) => (
          <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(invitation.status)}
              <div>
                <p className="font-medium">{invitation.family_name}</p>
                <p className="text-sm text-muted-foreground">
                  {invitation.invited_email} • {new Date(invitation.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusBadge(invitation.status)}
              {invitation.status === 'pending' && invitation.invite_token && (
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyInviteLink(invitation.invite_token!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => shareInviteLink(invitation.invite_token!, invitation.family_name || '')}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};