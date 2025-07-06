-- Fix the family_invitations policy that's trying to access auth.users
DROP POLICY IF EXISTS "Users can view invitations sent to them or sent by them" ON public.family_invitations;

-- Create a security definer function to get user email safely
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT email FROM public.profiles WHERE user_id = _user_id;
$$;

-- Recreate the policy using the profiles table instead of auth.users
CREATE POLICY "Users can view invitations sent to them or sent by them" 
ON public.family_invitations FOR SELECT 
USING (
  invited_user_id = auth.uid() OR 
  invited_by = auth.uid() OR
  invited_email = public.get_user_email(auth.uid())
);

-- Also fix any remaining family_groups policies that might cause recursion
DROP POLICY IF EXISTS "Users can view family groups they belong to" ON public.family_groups;

CREATE POLICY "Users can view family groups they belong to" 
ON public.family_groups FOR SELECT 
USING (id = ANY(public.get_user_family_ids(auth.uid())));