-- Verify and Fix Database Trigger for Auto Profile Creation
-- Run this in Supabase SQL Editor to ensure profiles are created automatically

-- STEP 1: Check if trigger exists
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- If the above returns no rows, the trigger doesn't exist. Run the rest of this script.
-- If it returns a row with enabled = 'O' (or 'D'), the trigger is disabled. Run the rest to fix it.

-- STEP 2: Create or replace the trigger function
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

-- STEP 3: Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 4: Verify trigger is now active
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  'Trigger is ACTIVE!' as status
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- STEP 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- STEP 6: Ensure RLS policies exist
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Recreate policies
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- SUCCESS MESSAGE
SELECT 'Database trigger setup complete! Users will now be created automatically.' as message;
