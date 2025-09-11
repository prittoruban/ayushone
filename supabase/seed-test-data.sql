-- Create some test users and doctors for demo purposes
-- This script will create auth users and corresponding doctor profiles

-- First, let's create a function to handle creating test users with profiles
CREATE OR REPLACE FUNCTION create_test_doctor(
  email TEXT,
  password TEXT,
  full_name TEXT,
  specialty TEXT,
  city TEXT
) RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Insert into auth.users (this is for demo - in production use Supabase Auth)
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) VALUES (
    gen_random_uuid(),
    email,
    crypt(password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    jsonb_build_object('name', full_name, 'role', 'doctor')
  ) RETURNING id INTO user_id;
  
  -- Insert into public.users
  INSERT INTO public.users (id, name, email, role)
  VALUES (user_id, full_name, email, 'doctor');
  
  -- Insert into public.doctors
  INSERT INTO public.doctors (user_id, specialty, city, verified_badge, license_url)
  VALUES (user_id, specialty, city, true, 'https://example.com/license-' || user_id || '.pdf');
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Create test doctors
SELECT create_test_doctor('dr.sarah@ayushone.com', 'password123', 'Dr. Sarah Johnson', 'Cardiology', 'Mumbai');
SELECT create_test_doctor('dr.amit@ayushone.com', 'password123', 'Dr. Amit Sharma', 'Dermatology', 'Delhi');
SELECT create_test_doctor('dr.priya@ayushone.com', 'password123', 'Dr. Priya Patel', 'Ayurveda', 'Bangalore');
SELECT create_test_doctor('dr.rajesh@ayushone.com', 'password123', 'Dr. Rajesh Kumar', 'Homeopathy', 'Chennai');
SELECT create_test_doctor('dr.meera@ayushone.com', 'password123', 'Dr. Meera Singh', 'Yoga', 'Pune');

-- Clean up the function
DROP FUNCTION create_test_doctor(TEXT, TEXT, TEXT, TEXT, TEXT);