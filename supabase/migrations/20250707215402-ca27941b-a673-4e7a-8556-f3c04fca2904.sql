-- Fix the family_members RLS policy to allow family creators to add themselves as admin
DROP POLICY IF EXISTS "Family admins can add members" ON public.family_members;

-- Create new policy that allows family creators to add themselves AND existing admins to add others
CREATE POLICY "Family creators and admins can add members" 
ON public.family_members FOR INSERT 
WITH CHECK (
  -- Allow if the user is the creator of the family
  family_id IN (
    SELECT id FROM public.family_groups 
    WHERE created_by = auth.uid()
  )
  OR
  -- OR allow if the user is already an admin of the family
  public.is_family_admin(auth.uid(), family_id)
);