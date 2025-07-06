-- Create family groups table
CREATE TABLE public.family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create family members table  
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- Create family invitations table
CREATE TABLE public.family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vouchers table (core voucher data)
CREATE TABLE public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  category TEXT,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  expiry_date DATE NOT NULL,
  notes TEXT,
  image_urls TEXT[],
  eligible_businesses_url TEXT,
  voucher_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  offer_for_sale BOOLEAN DEFAULT false,
  sale_price DECIMAL(10,2),
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transactions table for voucher usage history
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  previous_balance DECIMAL(10,2) NOT NULL,
  new_balance DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  purchase_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shared vouchers table
CREATE TABLE public.shared_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')) DEFAULT 'view',
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(voucher_id, family_id)
);

-- Enable Row Level Security
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_vouchers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_groups
CREATE POLICY "Users can view family groups they belong to" 
ON public.family_groups FOR SELECT 
USING (
  id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create family groups" 
ON public.family_groups FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Family admins can update their groups" 
ON public.family_groups FOR UPDATE 
USING (
  id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for family_members
CREATE POLICY "Users can view family members in their families" 
ON public.family_members FOR SELECT 
USING (
  family_id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Family admins can add members" 
ON public.family_members FOR INSERT 
WITH CHECK (
  family_id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for family_invitations
CREATE POLICY "Users can view invitations sent to them or sent by them" 
ON public.family_invitations FOR SELECT 
USING (
  invited_user_id = auth.uid() OR 
  invited_by = auth.uid() OR
  invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Family admins can create invitations" 
ON public.family_invitations FOR INSERT 
WITH CHECK (
  family_id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can update their own invitations"
ON public.family_invitations FOR UPDATE
USING (invited_user_id = auth.uid() OR invited_by = auth.uid());

-- RLS Policies for vouchers
CREATE POLICY "Users can view their own vouchers" 
ON public.vouchers FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can view vouchers shared with their families" 
ON public.vouchers FOR SELECT 
USING (
  id IN (
    SELECT sv.voucher_id FROM public.shared_vouchers sv
    JOIN public.family_members fm ON sv.family_id = fm.family_id
    WHERE fm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own vouchers" 
ON public.vouchers FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own vouchers" 
ON public.vouchers FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can update vouchers with edit permission" 
ON public.vouchers FOR UPDATE 
USING (
  id IN (
    SELECT sv.voucher_id FROM public.shared_vouchers sv
    JOIN public.family_members fm ON sv.family_id = fm.family_id
    WHERE fm.user_id = auth.uid() AND sv.permission = 'edit'
  )
);

-- RLS Policies for transactions
CREATE POLICY "Users can view transactions for their vouchers" 
ON public.transactions FOR SELECT 
USING (
  voucher_id IN (
    SELECT id FROM public.vouchers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view transactions for shared vouchers" 
ON public.transactions FOR SELECT 
USING (
  voucher_id IN (
    SELECT sv.voucher_id FROM public.shared_vouchers sv
    JOIN public.family_members fm ON sv.family_id = fm.family_id
    WHERE fm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create transactions for their vouchers" 
ON public.transactions FOR INSERT 
WITH CHECK (
  voucher_id IN (
    SELECT id FROM public.vouchers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create transactions for editable shared vouchers" 
ON public.transactions FOR INSERT 
WITH CHECK (
  voucher_id IN (
    SELECT sv.voucher_id FROM public.shared_vouchers sv
    JOIN public.family_members fm ON sv.family_id = fm.family_id
    WHERE fm.user_id = auth.uid() AND sv.permission = 'edit'
  )
);

-- RLS Policies for shared_vouchers
CREATE POLICY "Users can view shares for their families" 
ON public.shared_vouchers FOR SELECT 
USING (
  family_id IN (
    SELECT family_id FROM public.family_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can share their own vouchers" 
ON public.shared_vouchers FOR INSERT 
WITH CHECK (
  voucher_id IN (
    SELECT id FROM public.vouchers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update shares of their own vouchers" 
ON public.shared_vouchers FOR UPDATE 
USING (shared_by = auth.uid());

CREATE POLICY "Users can delete shares of their own vouchers" 
ON public.shared_vouchers FOR DELETE 
USING (shared_by = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX idx_family_invitations_invited_email ON public.family_invitations(invited_email);
CREATE INDEX idx_family_invitations_invited_user_id ON public.family_invitations(invited_user_id);
CREATE INDEX idx_vouchers_user_id ON public.vouchers(user_id);
CREATE INDEX idx_transactions_voucher_id ON public.transactions(voucher_id);
CREATE INDEX idx_shared_vouchers_family_id ON public.shared_vouchers(family_id);
CREATE INDEX idx_shared_vouchers_voucher_id ON public.shared_vouchers(voucher_id);

-- Add updated_at triggers
CREATE TRIGGER update_family_groups_updated_at
  BEFORE UPDATE ON public.family_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_invitations_updated_at
  BEFORE UPDATE ON public.family_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vouchers_updated_at
  BEFORE UPDATE ON public.vouchers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();