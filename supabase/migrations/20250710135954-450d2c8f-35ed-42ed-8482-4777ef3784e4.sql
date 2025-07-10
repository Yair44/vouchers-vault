-- Fix family_groups RLS policies and add DEFAULT constraint for created_by
-- Step 1: Add DEFAULT constraint to created_by column so it automatically uses auth.uid()
ALTER TABLE public.family_groups 
  ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Step 2: Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can create family groups" ON public.family_groups;
DROP POLICY IF EXISTS "Users can view family groups they belong to" ON public.family_groups;

-- Step 3: Create simplified INSERT policy that works with DEFAULT auth.uid()
CREATE POLICY "Allow auth users to insert their own family groups"
  ON public.family_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Step 4: Create simplified SELECT policy for users to see groups they created
CREATE POLICY "Allow auth users to select their own family groups"
  ON public.family_groups
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Step 5: Keep the existing UPDATE policy that uses the security definer function
-- (This allows family admins to update groups they belong to)