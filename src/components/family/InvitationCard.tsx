import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';
import { FamilyInvitation } from '@/types/family';

interface InvitationCardProps {
  invitation: FamilyInvitation;
  onRespond: (invitationId: string, action: 'accept' | 'reject') => void;
}

export const InvitationCard = ({ invitation, onRespond }: InvitationCardProps) => {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{invitation.family_name}</span>
            <Badge variant="secondary">Pending</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Invited {new Date(invitation.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRespond(invitation.id, 'reject')}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => onRespond(invitation.id, 'accept')}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};