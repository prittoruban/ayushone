-- Seed data for testing
-- Note: These inserts will only work after you've created the actual auth users in Supabase

-- Insert sample doctors (replace UUIDs with actual auth.users IDs from your Supabase)
-- You'll need to manually create these users first in Supabase Auth, then update the IDs

-- Sample doctor 1: Dr. Sarah Johnson (Cardiologist in Mumbai)
INSERT INTO public.doctors (user_id, specialty, city, verified_badge, license_url) 
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual user ID
  'Cardiology',
  'Mumbai',
  true,
  'https://example.com/license1.pdf'
) ON CONFLICT (user_id) DO NOTHING;

-- Sample doctor 2: Dr. Amit Sharma (Dermatologist in Delhi)
INSERT INTO public.doctors (user_id, specialty, city, verified_badge, license_url) 
VALUES (
  '00000000-0000-0000-0000-000000000002', -- Replace with actual user ID
  'Dermatology',
  'Delhi',
  true,
  'https://example.com/license2.pdf'
) ON CONFLICT (user_id) DO NOTHING;

-- Sample doctor 3: Dr. Priya Patel (General Medicine in Bangalore)
INSERT INTO public.doctors (user_id, specialty, city, verified_badge, license_url) 
VALUES (
  '00000000-0000-0000-0000-000000000003', -- Replace with actual user ID
  'General Medicine',
  'Bangalore',
  true,
  'https://example.com/license3.pdf'
) ON CONFLICT (user_id) DO NOTHING;