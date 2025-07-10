import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Settings } from 'lucide-react';
import { FamilyGroup, FamilyMember } from '@/types/family';

interface FamilyGroupCardProps {
  family: FamilyGroup & { members: FamilyMember[] };
  onInviteMember: () => void;
  onUpdate: () => void;
}

export const FamilyGroupCard = ({ family, onInviteMember, onUpdate }: FamilyGroupCardProps) => {
  const memberCount = family.members?.length || 0;
  const adminCount = family.members?.filter(m => m.role === 'admin').length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{family.name}</span>
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            {memberCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
          <p>{adminCount} admin{adminCount !== 1 ? 's' : ''}</p>
          <p className="text-xs">Created {new Date(family.created_at).toLocaleDateString()}</p>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" onClick={onInviteMember} className="flex-1">
            <UserPlus className="h-4 w-4 mr-1" />
            Invite
          </Button>
          <Button size="sm" variant="outline" onClick={onUpdate}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};