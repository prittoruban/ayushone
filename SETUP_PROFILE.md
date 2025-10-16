# Quick Setup Guide - User Profile Feature

## Step-by-Step Implementation

### Step 1: Update Database Schema

Choose **ONE** of these options:

#### Option A: Fresh Install (New Project)

If you're starting fresh, simply run the updated `schema.sql`:

```bash
# In Supabase SQL Editor, run:
supabase/schema.sql
```

#### Option B: Existing Project (Migration)

If you have existing data, run the migration:

```bash
# In Supabase SQL Editor, run:
supabase/migrations/001_add_user_profile_fields.sql
```

This will:

- ✅ Add new columns to users table
- ✅ Backfill email from auth.users
- ✅ Create storage bucket for avatars
- ✅ Set up RLS policies
- ✅ Create indexes for performance

### Step 2: Create Storage Bucket (Manual Check)

1. Go to Supabase Dashboard → Storage
2. Check if `user-uploads` bucket exists
3. If not, create it:
   - Name: `user-uploads`
   - Public: ✅ Enabled
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

### Step 3: Verify RLS Policies

Run this in SQL Editor to verify policies are set:

```sql
-- Check users table policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Check storage policies
SELECT * FROM storage.policies;
```

Expected results:

- Users can view their own profile
- Users can update their own profile
- Users can upload to their folder in storage
- Public can view avatars

### Step 4: Test the Implementation

#### Test 1: Google OAuth Flow

1. Click "Sign in with Google" on your app
2. Complete Google authentication
3. ✅ Should redirect to `/profile?new=true`
4. ✅ Email should be pre-filled
5. Fill in profile details
6. Click "Save Changes"
7. ✅ Should redirect to homepage

#### Test 2: Profile Update

1. Log in with existing account
2. Click profile menu → "My Profile"
3. ✅ Should show `/profile` with current data
4. Update any field
5. Upload an avatar
6. Click "Save Changes"
7. ✅ Should see success message
8. ✅ Avatar should appear in navbar

#### Test 3: Avatar Upload

1. Go to profile page
2. Click camera icon
3. Select an image
4. ✅ Preview should appear immediately
5. Click "Save Changes"
6. ✅ Check Supabase Storage → `user-uploads/avatars/`
7. ✅ File should be there with correct naming

### Step 5: Verify Data in Database

Check users table in Supabase:

```sql
SELECT
  id,
  email,
  name,
  phone,
  avatar_url,
  city,
  country,
  created_at,
  updated_at
FROM public.users
LIMIT 5;
```

All fields should be populated after profile updates.

## Common Issues & Fixes

### Issue 1: "Email field is null"

**Fix:**

```sql
-- Backfill email from auth.users
UPDATE public.users u
SET email = au.email
FROM auth.users au
WHERE u.id = au.id AND u.email IS NULL;
```

### Issue 2: "Avatar upload fails with 403"

**Fix:**

```sql
-- Enable public access on bucket
UPDATE storage.buckets
SET public = true
WHERE id = 'user-uploads';

-- Add RLS policies
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-uploads');
```

### Issue 3: "Profile page shows loading forever"

**Possible causes:**

- User not authenticated → Check `useAuth()` hook
- RLS blocking query → Check policies with `SELECT * FROM pg_policies WHERE tablename = 'users'`
- Network error → Check browser console

### Issue 4: "OAuth redirects to home instead of profile"

**Fix:**
Check `/src/app/auth/callback/route.ts` line ~45:

```typescript
// Should be:
return NextResponse.redirect(new URL("/profile", requestUrl.origin));
// NOT:
return NextResponse.redirect(new URL("/", requestUrl.origin));
```

## Environment Variables

Make sure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Security Checklist

Before going to production:

- [ ] RLS enabled on users table
- [ ] RLS policies limit access to own profile
- [ ] Storage bucket has proper policies
- [ ] Avatar uploads limited to authenticated users
- [ ] Email field cannot be changed by users
- [ ] SQL injection prevention (using Supabase client)
- [ ] XSS prevention (React escapes by default)
- [ ] File upload size limited
- [ ] Only image files allowed for avatars

## Performance Optimizations

### Recommended Indexes

Already created by migration:

```sql
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_city ON public.users(city);
CREATE INDEX idx_users_role ON public.users(role);
```

### Avatar Optimization

Consider adding image transformation:

```typescript
const { data } = supabase.storage.from("user-uploads").getPublicUrl(filePath, {
  transform: {
    width: 200,
    height: 200,
    quality: 80,
  },
});
```

## Deployment Checklist

Before deploying to production:

1. **Database:**

   - [ ] Run migration in production Supabase
   - [ ] Verify all policies are active
   - [ ] Check indexes are created
   - [ ] Backfill email for existing users

2. **Storage:**

   - [ ] Create `user-uploads` bucket
   - [ ] Set public access
   - [ ] Configure CORS if needed
   - [ ] Set file size limits

3. **Environment:**

   - [ ] Update production env variables
   - [ ] Set correct OAuth redirect URLs
   - [ ] Test Google OAuth in production

4. **Testing:**
   - [ ] Test new user signup flow
   - [ ] Test existing user login
   - [ ] Test profile updates
   - [ ] Test avatar uploads
   - [ ] Test on mobile devices

## Monitoring

After deployment, monitor:

1. **Database:**

   - Watch `users` table size
   - Check for failed updates
   - Monitor query performance

2. **Storage:**

   - Track storage usage in `user-uploads`
   - Monitor upload success rate
   - Check for orphaned files

3. **Authentication:**
   - Track OAuth success rate
   - Monitor redirect failures
   - Check for stuck sessions

## Rollback Plan

If issues occur:

1. **Revert database changes:**

```sql
-- Remove new columns (data loss!)
ALTER TABLE public.users
DROP COLUMN email,
DROP COLUMN avatar_url,
DROP COLUMN bio,
DROP COLUMN address,
DROP COLUMN city,
DROP COLUMN country,
DROP COLUMN date_of_birth,
DROP COLUMN gender,
DROP COLUMN updated_at;
```

2. **Revert OAuth redirect:**
   Edit `/src/app/auth/callback/route.ts`:

```typescript
return NextResponse.redirect(new URL("/", requestUrl.origin));
```

3. **Hide profile link:**
   Comment out in `/src/components/Navbar.tsx`

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Storage Guide:** https://supabase.com/docs/guides/storage
- **Auth Guide:** https://supabase.com/docs/guides/auth
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

---

**Estimated Setup Time:** 10-15 minutes
**Difficulty:** Intermediate
**Prerequisites:** Basic Supabase & Next.js knowledge
