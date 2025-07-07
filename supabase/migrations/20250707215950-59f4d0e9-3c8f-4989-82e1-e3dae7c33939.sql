-- First let's check if RLS is enabled and see current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'family_groups';

-- Drop the existing INSERT policy and recreate it with better error handling
DROP POLICY IF EXISTS "Users can create family groups" ON public.family_groups;

-- Create a more permissive INSERT policy for authenticated users
CREATE POLICY "Authenticated users can create family groups" 
ON public.family_groups 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Also ensure the table has RLS enabled
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;