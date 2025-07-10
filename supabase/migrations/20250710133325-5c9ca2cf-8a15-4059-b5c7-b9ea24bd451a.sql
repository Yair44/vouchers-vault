-- Restore proper security policies for family_groups
-- Drop the temporary permissive policies
DROP POLICY IF EXISTS "Authenticated users can create family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Authenticated users can view family groups" ON public.family_groups;

-- Create the correct INSERT policy
CREATE POLICY "Authenticated users can create family groups" 
ON public.family_groups 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Restore the proper SELECT policy using the security definer function
CREATE POLICY "Users can view family groups they belong to" 
ON public.family_groups 
FOR SELECT 
TO authenticated
USING (id = ANY(public.get_user_family_ids(auth.uid())));