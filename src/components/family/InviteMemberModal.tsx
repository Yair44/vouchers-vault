import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Mail, Link2, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId: string;
  onSuccess: () => void;
}

export const InviteMemberModal = ({ open, onOpenChange, familyId, onSuccess }: InviteMemberModalProps) => {
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { user } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !email.trim()) {
      return;
    }

    setIsInviting(true);

    try {
      const { error } = await supabase
        .from('family_invitations')
        .insert({
          family_id: familyId,
          invited_by: user.id,
          invited_email: email.trim()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email invitation sent successfully",
      });

      setEmail('');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const generateInviteLink = async () => {
    if (!user) return;

    setIsGeneratingLink(true);

    try {
      const { data, error } = await supabase
        .from('family_invitations')
        .insert({
          family_id: familyId,
          invited_by: user.id,
          invited_email: 'link-invitation@placeholder.com' // Placeholder email for link invitations
        })
        .select('invite_token')
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/invite/${data.invite_token}`;
      setInviteLink(link);

      toast({
        title: "Success",
        description: "Invitation link generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invitation link",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      
      toast({
        title: "Copied!",
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

  const handleClose = () => {
    setEmail('');
    setInviteLink('');
    setLinkCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite Family Member</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="email" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Share Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  disabled={isInviting}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isInviting}>
                  {isInviting ? 'Sending...' : 'Send Email Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Generate a shareable link that anyone can use to join your family. 
                Share it via messaging apps, social media, or any other way you prefer.
              </div>
              
              {!inviteLink ? (
                <Button 
                  onClick={generateInviteLink} 
                  disabled={isGeneratingLink}
                  className="w-full"
                >
                  {isGeneratingLink ? 'Generating...' : 'Generate Invitation Link'}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Label>Invitation Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                      className="shrink-0"
                    >
                      {linkCopied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    This link will allow anyone to join your family. Keep it secure!
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Close
                </Button>
                {inviteLink && (
                  <Button onClick={copyToClipboard}>
                    {linkCopied ? 'Copied!' : 'Copy Link'}
                  </Button>
                )}
              </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};