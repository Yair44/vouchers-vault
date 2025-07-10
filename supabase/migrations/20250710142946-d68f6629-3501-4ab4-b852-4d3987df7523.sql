-- Add invite_token column to family_invitations for shareable links
ALTER TABLE public.family_invitations 
ADD COLUMN invite_token UUID DEFAULT gen_random_uuid();

-- Create index for invite_token lookups
CREATE INDEX idx_family_invitations_invite_token ON public.family_invitations(invite_token);

-- Add RLS policy for accessing invitations via token
CREATE POLICY "Anyone can view invitations by token" 
ON public.family_invitations FOR SELECT 
USING (invite_token IS NOT NULL);