-- Fix infinite recursion in family_members RLS policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view family members in their families" ON public.family_members;
DROP POLICY IF EXISTS "Family admins can add members" ON public.family_members;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_family_ids(_user_id uuid)
RETURNS uuid[]
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT ARRAY_AGG(family_id) 
  FROM public.family_members 
  WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_family_admin(_user_id uuid, _family_id uuid)
RETURNS boolean
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.family_members 
    WHERE user_id = _user_id 
    AND family_id = _family_id 
    AND role = 'admin'
  );
$$;

-- Create new non-recursive policies
CREATE POLICY "Users can view family members in their families" 
ON public.family_members FOR SELECT 
USING (family_id = ANY(public.get_user_family_ids(auth.uid())));

CREATE POLICY "Family admins can add members" 
ON public.family_members FOR INSERT 
WITH CHECK (public.is_family_admin(auth.uid(), family_id));