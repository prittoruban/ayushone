# User Profile Feature - Complete Guide

## Overview

Comprehensive user profile system with Google OAuth integration, allowing users to manage their personal information, avatar, and account settings.

## Features Implemented

### 1. **Extended User Profile Fields**

Users can now update:

- ✅ Full Name
- ✅ Email (read-only, from Google OAuth)
- ✅ Phone Number
- ✅ Profile Avatar/Picture
- ✅ Biography/About Me
- ✅ Street Address
- ✅ City
- ✅ Country
- ✅ Date of Birth
- ✅ Gender (Male, Female, Other, Prefer not to say)
- ✅ Account Type (Doctor/Citizen)

### 2. **Google OAuth Integration**

- Users signing in with Google are automatically redirected to profile page
- Email is pre-filled from Google account
- Avatar can be imported from Google profile
- New users get a welcome message and guided onboarding

### 3. **Avatar Upload System**

- Upload custom profile pictures
- Real-time preview before saving
- Stored in Supabase Storage with proper RLS policies
- Fallback to initials-based avatar if no image

### 4. **Smart Redirects**

- **New OAuth Users** → Profile page with `?new=true` parameter
- **Existing OAuth Users** → Profile page to review information
- **After Profile Update** → Redirected to homepage (new users) or stay on profile (existing)

## File Structure

```
src/
├── app/
│   ├── profile/
│   │   └── page.tsx              # Main profile page component
│   └── auth/
│       └── callback/
│           └── route.ts          # OAuth callback handler (updated)
├── components/
│   └── Navbar.tsx                # Updated with profile link
├── contexts/
│   └── AuthContext.tsx           # Auth state management
└── lib/
    ├── database.types.ts         # Updated with new user fields
    └── supabase.ts               # Supabase client

supabase/
├── schema.sql                    # Updated base schema
└── migrations/
    └── 001_add_user_profile_fields.sql  # Migration for existing DBs
```

## Database Schema Changes

### Users Table (Updated)

```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,         -- NEW
  name text NOT NULL,
  role text NOT NULL,
  phone text,
  avatar_url text,                    -- NEW
  bio text,                           -- NEW
  address text,                       -- NEW
  city text,                          -- NEW
  country text,                       -- NEW
  date_of_birth date,                 -- NEW
  gender text,                        -- NEW
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()  -- NEW
);
```

### Storage Bucket

- **Bucket Name**: `user-uploads`
- **Public Access**: Yes
- **RLS Policies**: Users can only upload/modify their own files

## Implementation Details

### 1. Profile Page Component (`/src/app/profile/page.tsx`)

**Key Features:**

- Form with all user fields
- Real-time avatar preview
- Loading states for all operations
- Success/error message handling
- Special UI for new users

**State Management:**

```typescript
const [formData, setFormData] = useState<Partial<AppUser>>({
  name: "",
  email: "",
  phone: "",
  bio: "",
  address: "",
  city: "",
  country: "",
  date_of_birth: "",
  gender: null,
});
```

**Avatar Upload Flow:**

1. User selects image file
2. Preview shown instantly (base64)
3. On form submit, file uploaded to Supabase Storage
4. Public URL saved to database
5. Avatar displayed in navbar and profile

### 2. OAuth Callback Update (`/src/app/auth/callback/route.ts`)

**Changes:**

```typescript
// New user - redirect to profile with flag
if (!existingProfile) {
  await supabase.from("users").insert({
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.full_name || user.email!.split("@")[0],
    role: "citizen",
    phone: user.user_metadata?.phone || null,
    avatar_url: user.user_metadata?.avatar_url || null,
  });

  return NextResponse.redirect(new URL("/profile?new=true", requestUrl.origin));
}

// Existing user - redirect to profile
return NextResponse.redirect(new URL("/profile", requestUrl.origin));
```

### 3. Navbar Integration (`/src/components/Navbar.tsx`)

**Added:**

- "My Profile" link in dropdown menu (all users)
- "Doctor Profile" link (doctors only)
- User avatar with fallback to initials
- Click outside to close dropdown

**Profile Menu Structure:**

```
┌─────────────────────────┐
│ John Doe                │
│ +1 234 567 8900         │
├─────────────────────────┤
│ 👤 My Profile           │  ← NEW (all users)
│ ⚙️  Doctor Profile      │  ← Doctors only
│ 📅 My Appointments      │
│ 🚪 Sign Out             │
└─────────────────────────┘
```

## User Flow

### Scenario 1: New User via Google OAuth

1. User clicks "Sign in with Google"
2. Google authentication completes
3. OAuth callback creates user profile with email
4. **Redirected to** `/profile?new=true`
5. Welcome message shown
6. User fills in additional details
7. Clicks "Save Changes"
8. Success message → Auto-redirect to homepage after 2s

### Scenario 2: Existing User via Google OAuth

1. User clicks "Sign in with Google"
2. Google authentication completes
3. OAuth callback finds existing profile
4. **Redirected to** `/profile`
5. User can review/update information
6. Changes saved instantly

### Scenario 3: Manual Profile Update

1. User logged in
2. Clicks profile menu → "My Profile"
3. **Navigates to** `/profile`
4. Updates any fields
5. Clicks "Save Changes"
6. Success message shown
7. Can click "Cancel" to go back

## Security & Permissions

### Row-Level Security (RLS) Policies

**Users Table:**

```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id);
```

**Storage (user-uploads bucket):**

```sql
-- Upload: User can only upload to their own folder
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- View: Anyone can view avatars (public profile pictures)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-uploads');
```

## API Endpoints Used

### 1. Get User Profile

```typescript
const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("id", user.id)
  .single();
```

### 2. Update User Profile

```typescript
const { error } = await supabase
  .from("users")
  .update({
    name: formData.name,
    phone: formData.phone,
    bio: formData.bio,
    // ... other fields
    updated_at: new Date().toISOString(),
  })
  .eq("id", user.id);
```

### 3. Upload Avatar

```typescript
const { error } = await supabase.storage
  .from("user-uploads")
  .upload(`avatars/${user.id}-${Date.now()}.jpg`, file);

const { data } = supabase.storage.from("user-uploads").getPublicUrl(filePath);
```

## Setup Instructions

### For New Projects

1. Use the updated `schema.sql` file
2. Run in Supabase SQL Editor
3. Create `user-uploads` storage bucket
4. Enable public access on bucket

### For Existing Projects

1. Run migration file: `supabase/migrations/001_add_user_profile_fields.sql`
2. Or manually execute in Supabase SQL Editor
3. Existing user data will be preserved
4. Email will be backfilled from auth.users

### Google OAuth Setup

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add OAuth Client ID and Secret
4. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. Update `redirectTo` in AuthContext if needed

## Testing Checklist

### Profile Page

- [ ] Page loads without errors
- [ ] Email is pre-filled and disabled
- [ ] All form fields are editable
- [ ] Avatar upload shows preview
- [ ] Form validation works
- [ ] Submit button shows loading state
- [ ] Success message appears after save
- [ ] Error handling works

### Google OAuth Flow

- [ ] Google sign-in redirects to profile
- [ ] Email is pre-filled from Google
- [ ] New users see welcome message
- [ ] Profile saves successfully
- [ ] Redirects to home after completion

### Navigation

- [ ] Profile link appears in navbar
- [ ] Profile menu opens/closes properly
- [ ] Avatar or initials shown correctly
- [ ] All menu links work

### Permissions

- [ ] Users can only view/edit their own profile
- [ ] Avatar uploads work
- [ ] Public can view avatars
- [ ] Email cannot be changed

## Troubleshooting

### Issue: Email not appearing

**Solution:** Make sure to run the migration that backfills email from auth.users

### Issue: Avatar upload fails

**Solution:**

1. Check if `user-uploads` bucket exists
2. Verify bucket is public
3. Check RLS policies on storage.objects

### Issue: Profile not updating

**Solution:**

1. Check browser console for errors
2. Verify RLS policies on users table
3. Ensure user is authenticated

### Issue: OAuth doesn't redirect to profile

**Solution:**

1. Check `/auth/callback/route.ts` redirects
2. Verify Supabase OAuth configuration
3. Check browser network tab for redirect chain

## Future Enhancements

### Potential Additions:

1. **Email Verification**: Send verification email for profile changes
2. **Password Change**: Allow password reset from profile
3. **2FA**: Two-factor authentication setup
4. **Activity Log**: Show recent account activity
5. **Privacy Settings**: Control who can see profile information
6. **Avatar Cropper**: Crop/resize images before upload
7. **Profile Visibility**: Public profile pages for doctors
8. **Social Links**: Add LinkedIn, Twitter, etc.
9. **Notifications Preferences**: Email/SMS notification settings
10. **Account Deletion**: Self-service account deletion

## Related Files Modified

1. **`supabase/schema.sql`** - Base schema with new fields
2. **`supabase/migrations/001_add_user_profile_fields.sql`** - Migration script
3. **`src/lib/database.types.ts`** - TypeScript types for database
4. **`src/app/auth/callback/route.ts`** - OAuth callback handler
5. **`src/app/profile/page.tsx`** - Profile page component (NEW)
6. **`src/components/Navbar.tsx`** - Navigation with profile link

## Support

For questions or issues:

1. Check this documentation
2. Review Supabase logs in dashboard
3. Check browser console for errors
4. Verify database schema matches types

---

**Last Updated:** October 16, 2025
**Version:** 1.0.0
**Status:** ✅ Complete and Production Ready
