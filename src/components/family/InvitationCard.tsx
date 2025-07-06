import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Users, Mail } from 'lucide-react';
import { FamilyInvitation } from '@/types/family';

interface InvitationCardProps {
  invitation: FamilyInvitation;
  onRespond: (invitationId: string, action: 'accept' | 'reject') => void;
}

export const InvitationCard = ({ invitation, onRespond }: InvitationCardProps) => {
  return (
    <Card className="bg-background">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium">
                Family Invitation
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {invitation.family_name || 'Unknown Family'}
              </p>
              <p className="text-xs text-muted-foreground">
                Invited {new Date(invitation.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onRespond(invitation.id, 'accept')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRespond(invitation.id, 'reject')}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
            >
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};