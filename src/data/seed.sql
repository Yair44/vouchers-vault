
-- Seed data for VoucherVault
-- TODO: Replace with actual Supabase seed data

-- Insert demo users
INSERT INTO users (id, name, email, webhook_url) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'John Doe', 'john@example.com', 'https://api.example.com/webhook'),
('550e8400-e29b-41d4-a716-446655440001', 'Jane Smith', 'jane@example.com', NULL),
('550e8400-e29b-41d4-a716-446655440002', 'Mike Johnson', 'mike@example.com', 'https://hooks.zapier.com/hooks/catch/12345/');

-- Insert demo vouchers for John Doe
INSERT INTO vouchers (id, user_id, name, code, type, balance, original_balance, expiry_date, notes, color_tag, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Amazon Gift Card', 'AMZN-1234-5678-9012', 'gift_card', 85.50, 100.00, '2025-12-31', 'Birthday gift from mom', '#FF6B6B', true),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Starbucks Card', 'SB-9876-5432-1098', 'gift_card', 23.75, 50.00, '2025-01-15', 'Office coffee runs', '#4ECDC4', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '20% Off Coupon', 'SAVE20NOW', 'coupon', 1, 1, '2024-07-15', 'Online shopping discount', '#FFE66D', true),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Best Buy Rewards', 'BB-REWARDS-789', 'loyalty_card', 125.00, 125.00, '2025-06-30', 'Electronics purchase points', '#96CEB4', true),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Target Gift Card', 'TGT-ABCD-EFGH-1234', 'gift_card', 0.00, 75.00, '2025-03-15', 'Used for home supplies', '#DDA0DD', false);

-- Insert demo vouchers for Jane Smith
INSERT INTO vouchers (id, user_id, name, code, type, balance, original_balance, expiry_date, notes, color_tag, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Spotify Premium', 'SPOT-PREM-2024', 'coupon', 1, 1, '2024-08-01', '3 months free trial', '#45B7D1', true),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'Walmart Gift Card', 'WM-5555-6666-7777', 'gift_card', 150.00, 150.00, '2026-01-01', 'Grocery shopping', '#FFEAA7', true);

-- Insert transaction history
INSERT INTO transactions (voucher_id, amount, previous_balance, new_balance, description) VALUES
('660e8400-e29b-41d4-a716-446655440000', -14.50, 100.00, 85.50, 'Used for book purchase'),
('660e8400-e29b-41d4-a716-446655440001', -26.25, 50.00, 23.75, 'Coffee and snacks'),
('660e8400-e29b-41d4-a716-446655440004', -75.00, 75.00, 0.00, 'Used for home supplies purchase');

-- Insert shared voucher example
INSERT INTO shared_vouchers (voucher_id, shared_with_user_id, permission) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'view');
