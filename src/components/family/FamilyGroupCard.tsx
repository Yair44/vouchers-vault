import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Crown, Settings } from 'lucide-react';
import { FamilyGroup, FamilyMember } from '@/types/family';

interface FamilyGroupCardProps {
  family: FamilyGroup & { members: FamilyMember[] };
  onInviteMember: () => void;
  onUpdate: () => void;
}

export const FamilyGroupCard = ({ family, onInviteMember, onUpdate }: FamilyGroupCardProps) => {
  const isAdmin = false; // TODO: Fix current user check

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              {family.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {family.members.length} member{family.members.length !== 1 ? 's' : ''}
            </p>
          </div>
          {isAdmin && <Badge variant="secondary" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Admin
          </Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Members:</p>
          <div className="space-y-1">
            {family.members.slice(0, 3).map((member) => (
              <div key={member.id} className="flex items-center justify-between text-sm">
                <span>{member.email || 'Unknown'}</span>
                {member.role === 'admin' && (
                  <Badge variant="outline">Admin</Badge>
                )}
              </div>
            ))}
            {family.members.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{family.members.length - 3} more
              </p>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onInviteMember}
              className="flex-1"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onUpdate}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};