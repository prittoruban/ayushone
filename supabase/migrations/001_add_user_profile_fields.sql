-- Migration: Add extended user profile fields
-- Date: October 16, 2025
-- Description: Adds email, avatar, bio, location, and demographic fields to users table

-- Add new columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email text UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Update email constraint to be NOT NULL after backfilling
-- First, let's backfill email from auth.users for existing users
UPDATE public.users u
SET email = au.email
FROM auth.users au
WHERE u.id = au.id AND u.email IS NULL;

-- Now make email NOT NULL
ALTER TABLE public.users
ALTER COLUMN email SET NOT NULL;

-- Create storage bucket for user avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects for user-uploads bucket
CREATE POLICY IF NOT EXISTS "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-uploads');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_city ON public.users(city);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Update RLS policies for users table (if not already set)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY IF NOT EXISTS "Users can view their own profile"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update their own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own profile (during OAuth signup)
CREATE POLICY IF NOT EXISTS "Users can insert their own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

COMMENT ON COLUMN public.users.email IS 'User email address from auth.users';
COMMENT ON COLUMN public.users.avatar_url IS 'URL to user profile picture';
COMMENT ON COLUMN public.users.bio IS 'User biography or about me text';
COMMENT ON COLUMN public.users.address IS 'Street address';
COMMENT ON COLUMN public.users.city IS 'City of residence';
COMMENT ON COLUMN public.users.country IS 'Country of residence';
COMMENT ON COLUMN public.users.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN public.users.gender IS 'User gender identity';
COMMENT ON COLUMN public.users.updated_at IS 'Timestamp of last profile update';
