import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Mail, Link, Clock } from 'lucide-react';
import { FamilyInvitation } from '@/types/family';

interface SentInvitationCardProps {
  invitation: FamilyInvitation;
  onCancel: (invitationId: string) => void;
  isCancelling?: boolean;
}

export const SentInvitationCard = ({ invitation, onCancel, isCancelling }: SentInvitationCardProps) => {
  const getStatusBadge = () => {
    switch (invitation.status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="secondary">{invitation.status}</Badge>;
    }
  };

  const getInvitationIcon = () => {
    return invitation.invite_token ? <Link className="h-4 w-4 text-green-600" /> : <Mail className="h-4 w-4 text-blue-600" />;
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getInvitationIcon()}
            <span className="font-medium">{invitation.invited_email}</span>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Sent {new Date(invitation.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span>Family: {invitation.family_name}</span>
          </div>
        </div>
        
        {invitation.status === 'pending' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancel(invitation.id)}
            disabled={isCancelling}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};