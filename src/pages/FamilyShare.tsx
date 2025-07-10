import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, UserPlus, Share2 } from 'lucide-react';
import { CreateFamilyModal } from '@/components/family/CreateFamilyModal';
import { InviteMemberModal } from '@/components/family/InviteMemberModal';
import { FamilyGroupCard } from '@/components/family/FamilyGroupCard';
import { SharedVoucherCard } from '@/components/family/SharedVoucherCard';
import { InvitationCard } from '@/components/family/InvitationCard';
import { useFamilyGroups } from '@/hooks/useFamilyGroups';
import { useFamilyInvitations } from '@/hooks/useFamilyInvitations';
import { useSharedVouchers } from '@/hooks/useSharedVouchers';
import { useAuth } from '@/contexts/AuthContext';

export const FamilyShare = () => {
  const [createFamilyOpen, setCreateFamilyOpen] = useState(false);
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');

  const { families, isLoading: familiesLoading, refetch: refetchFamilies } = useFamilyGroups();
  const { invitations, isLoading: invitationsLoading, respondToInvitation } = useFamilyInvitations(); 
  const { sharedVouchers, isLoading: vouchersLoading } = useSharedVouchers();
  const { user } = useAuth();

  const handleInviteMember = (familyId: string) => {
    setSelectedFamilyId(familyId);
    setInviteMemberOpen(true);
  };

  const handleInvitationResponse = async (invitationId: string, action: 'accept' | 'reject') => {
    await respondToInvitation(invitationId, action);
    refetchFamilies();
  };

  // Only show invitations where the current user is the invitee (not the inviter)
  const pendingInvitations = invitations?.filter(inv => 
    inv.status === 'pending' && 
    (inv.invited_user_id === user?.id || inv.invited_email === user?.email)
  ) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Share</h1>
          <p className="text-muted-foreground">
            Create families and share vouchers with your loved ones
          </p>
        </div>
        <Button onClick={() => setCreateFamilyOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Family
        </Button>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Pending Invitations ({pendingInvitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onRespond={handleInvitationResponse}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="families" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="families">My Families</TabsTrigger>
          <TabsTrigger value="vouchers">Shared Vouchers</TabsTrigger>
        </TabsList>

        <TabsContent value="families" className="space-y-4">
          {familiesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : families && families.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {families.map((family) => (
                <FamilyGroupCard
                  key={family.id}
                  family={family}
                  onInviteMember={() => handleInviteMember(family.id)}
                  onUpdate={refetchFamilies}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Families Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first family to start sharing vouchers with others.
                </p>
                <Button onClick={() => setCreateFamilyOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Family
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vouchers" className="space-y-4">
          {vouchersLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sharedVouchers && sharedVouchers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sharedVouchers.map((voucher) => (
                <SharedVoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  onUpdate={() => {}}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Shared Vouchers</h3>
                <p className="text-muted-foreground mb-4">
                  Share vouchers with your family members to see them here.
                </p>
                <Button asChild>
                  <a href="/vouchers">Go to My Vouchers</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateFamilyModal
        open={createFamilyOpen}
        onOpenChange={setCreateFamilyOpen}
        onSuccess={refetchFamilies}
      />

      <InviteMemberModal
        open={inviteMemberOpen}
        onOpenChange={setInviteMemberOpen}
        familyId={selectedFamilyId}
        onSuccess={() => {
          setInviteMemberOpen(false);
          refetchFamilies();
        }}
      />
    </div>
  );
};