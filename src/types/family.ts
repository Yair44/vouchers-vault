export interface FamilyGroup {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  // Joined from profiles table
  email?: string;
  full_name?: string;
}

export interface FamilyInvitation {
  id: string;
  family_id: string;
  invited_by: string;
  invited_email: string;
  invited_user_id?: string;
  invite_token?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  // Joined data
  family_name?: string;
  inviter_name?: string;
}

export interface SharedVoucher {
  id: string;
  voucher_id: string;
  family_id: string;
  permission: 'view' | 'edit';
  shared_by: string;
  created_at: string;
  // Joined data
  family_name?: string;
  owner_name?: string;
}

export interface DatabaseVoucher {
  id: string;
  user_id: string;
  name: string;
  code: string;
  category?: string;
  balance: number;
  original_balance: number;
  expiry_date: string;
  notes?: string;
  image_urls?: string[];
  eligible_businesses_url?: string;
  voucher_url?: string;
  is_active: boolean;
  offer_for_sale?: boolean;
  sale_price?: number;
  contact_info?: string;
  created_at: string;
  updated_at: string;
  // Joined data for shared vouchers
  owner_name?: string;
  shared_families?: string[];
  permission?: 'view' | 'edit';
  is_shared?: boolean;
}

export interface Transaction {
  id: string;
  voucher_id: string;
  amount: number;
  previous_balance: number;
  new_balance: number;
  description: string;
  purchase_date?: string;
  created_at: string;
}