-- Migration: Add trigger for handling OAuth user creation
-- This trigger automatically creates a user profile when someone signs up via OAuth (Google, etc.)

-- Function to handle new user creation from OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table if not exists
  INSERT INTO public.users (id, name, role, phone)
  VALUES (
    new.id,
    -- Try to get name from various metadata fields, fallback to email username
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    ),
    -- Get role from metadata, default to 'citizen'
    COALESCE(new.raw_user_meta_data->>'role', 'citizen'),
    -- Get phone from metadata if available
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING; -- Skip if user already exists
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Update RLS policies to allow authenticated users to read their own data
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Anyone can read doctor profiles (for public listing)
CREATE POLICY "Anyone can read doctors" ON public.doctors
  FOR SELECT
  USING (true);

-- Policy: Doctors can update their own profile
CREATE POLICY "Doctors can update own profile" ON public.doctors
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Doctors can insert their own profile
CREATE POLICY "Doctors can insert own profile" ON public.doctors
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates a user profile when a new auth user is created (via OAuth or email signup)';
