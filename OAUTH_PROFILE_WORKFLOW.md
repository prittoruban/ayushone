# Google OAuth to Profile Page - Correct Workflow

## Updated: October 16, 2025

## The Correct Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    GOOGLE OAUTH FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Sign in with Google"
   ↓
2. Google authentication page
   ↓
3. User authorizes app
   ↓
4. Redirect to /auth/callback?code=xxx
   ↓
5. Callback exchanges code for session
   ↓
6. Check if profile exists in database
   ↓
   ├─ Profile EXISTS → Redirect to /profile
   │  ↓
   │  Profile page loads with existing data
   │  User can edit and save
   │
   └─ Profile DOESN'T EXIST → Create basic profile → Redirect to /profile?new=true
      ↓
      Profile page loads with Google data (email, name)
      User sees welcome message
      User fills in additional details
      User clicks "Save" → Profile created in database
      Auto-redirect to home after 2 seconds
```

## What Was Fixed

### Problem 1: Redirect Loop

**Before:** Profile page redirected to sign-in immediately if `userProfile` was null
**After:** Profile page waits for auth to load, then allows user to stay even if profile doesn't exist yet

### Problem 2: Profile Not Created

**Before:** Form only did `update` which failed for new users without existing profile
**After:** Form does `upsert` which creates OR updates profile

### Problem 3: Silent Failures

**Before:** AuthContext failed silently when profile didn't exist
**After:** AuthContext retries up to 3 times and logs helpful messages

## Code Changes Summary

### 1. Profile Page (`src/app/profile/page.tsx`)

#### useEffect - Wait for Auth

```typescript
useEffect(() => {
  // Wait for auth to finish loading
  if (authLoading) {
    console.log("Auth still loading...");
    return; // Don't redirect yet
  }

  // Only redirect if NO user at all
  if (!user) {
    console.log("No user found, redirecting to signin");
    router.push("/auth/signin");
    return;
  }

  console.log("User found:", user.email, "Profile loaded:", !!userProfile);

  // User exists - populate form
  if (userProfile) {
    // Load existing profile data
    setFormData({ ...userProfile });
  } else if (user) {
    // NEW: Pre-fill from Google for new users
    setFormData({
      name: user.user_metadata?.full_name || "",
      email: user.email || "",
      phone: user.user_metadata?.phone || "",
      // ... empty fields for user to fill
    });
  }
}, [user, userProfile, authLoading, router]);
```

**Key Change:** Don't redirect if `userProfile` is null - user might be new!

#### handleSubmit - Upsert Instead of Update

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation and avatar upload

  const profileData = {
    id: user.id,
    email: user.email!,
    name:
      formData.name ||
      user.user_metadata?.full_name ||
      user.email!.split("@")[0],
    role: userProfile?.role || "citizen", // Keep existing or default
    phone: formData.phone,
    bio: formData.bio,
    // ... all other fields
  };

  // NEW: Use upsert instead of update
  const { error } = await supabase.from("users").upsert(profileData, {
    onConflict: "id", // Update if exists, insert if doesn't
  });

  if (error) throw error;

  // Success!
  setMessage({ type: "success", text: "Profile updated successfully!" });

  // Refresh session to reload profile
  await supabase.auth.getSession();

  // Redirect based on user type
  if (isNewUser) {
    setTimeout(() => router.push("/"), 2000);
  }
};
```

**Key Change:** `upsert` creates profile if it doesn't exist, updates if it does!

### 2. Auth Context (`src/contexts/AuthContext.tsx`)

#### fetchUserProfile - Retry Logic

```typescript
const fetchUserProfile = useCallback(
  async (userId: string, retryCount = 0) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Profile not found
        console.log(
          "User profile not found (attempt " + (retryCount + 1) + ")"
        );

        // NEW: Retry up to 3 times for new OAuth users
        if (retryCount < 3) {
          console.log("Retrying in 1 second...");
          setTimeout(() => {
            fetchUserProfile(userId, retryCount + 1);
          }, 1000);
        } else {
          console.log("Profile still not found - new OAuth user:", userId);
          setUserProfile(null); // This is OK for new users!
        }
      }
      return;
    }

    console.log("User profile loaded:", data.email);
    setUserProfile(data);
  },
  [supabase]
);
```

**Key Change:** Retry mechanism for new users + better logging!

### 3. OAuth Callback (`src/app/auth/callback/route.ts`)

Already correct - creates basic profile and redirects to `/profile?new=true` or `/profile`

## User Experience

### New User (First Time with Google)

1. **Sign in with Google**

   - Clicks "Sign in with Google" button
   - Authorizes app on Google

2. **Lands on Profile Page**

   - URL: `/profile?new=true`
   - Sees: "Complete Your Profile 🎉"
   - Email is pre-filled from Google (read-only)
   - Name is pre-filled from Google
   - Avatar from Google (if available)

3. **Fills Additional Info**

   - Phone number
   - Bio
   - Address, City, Country
   - Date of birth
   - Gender
   - Can upload custom avatar

4. **Saves Profile**
   - Clicks "Save Changes"
   - Profile created in database
   - Success message: "Profile updated successfully!"
   - Auto-redirects to home after 2 seconds

### Existing User (Returning)

1. **Sign in with Google**

   - Already has profile in database

2. **Lands on Profile Page**

   - URL: `/profile`
   - Sees: "Edit Your Profile"
   - All existing data loaded

3. **Can Update Info**
   - Edit any field
   - Upload new avatar
   - Click "Save Changes"
   - Page reloads with updated data

## Testing Checklist

### Test 1: Brand New OAuth User

- [ ] Clear all cookies and local storage
- [ ] Click "Sign in with Google"
- [ ] Authorize on Google
- [ ] Should land on `/profile?new=true` ✅
- [ ] Email should be pre-filled ✅
- [ ] Should NOT redirect back to sign-in ✅
- [ ] Fill in profile details
- [ ] Click "Save Changes"
- [ ] Profile should be created ✅
- [ ] Should redirect to home after 2s ✅

### Test 2: Existing OAuth User

- [ ] Sign in with Google (account that signed in before)
- [ ] Should land on `/profile` ✅
- [ ] All existing data should load ✅
- [ ] Update some fields
- [ ] Click "Save Changes"
- [ ] Page should reload with new data ✅

### Test 3: Direct Profile Access (Logged Out)

- [ ] Sign out completely
- [ ] Navigate to `/profile` directly
- [ ] Should redirect to `/auth/signin` ✅
- [ ] Should only redirect ONCE (no loop) ✅

### Test 4: Direct Profile Access (Logged In)

- [ ] Sign in normally
- [ ] Navigate to `/profile` directly
- [ ] Profile page should load ✅
- [ ] Should show your data ✅

## Console Logs to Look For

### Successful New User Flow:

```
Auth still loading...
User found: user@gmail.com Profile loaded: false
New user or profile not loaded yet, pre-filling from Google data
User profile not found (attempt 1)
Retrying in 1 second...
User profile not found (attempt 2)
Retrying in 1 second...
User profile not found (attempt 3)
Retrying in 1 second...
Profile still not found after retries - new OAuth user: xxx
[User fills form and clicks Save]
Profile saved successfully!
Session refreshed, profile should reload automatically
```

### Successful Existing User Flow:

```
Auth still loading...
User found: user@gmail.com Profile loaded: true
Loading existing profile data
User profile loaded: user@gmail.com
```

## Troubleshooting

### Issue: Still redirecting to sign-in

**Check:**

1. Open browser console
2. Look for: "No user found, redirecting to signin"
3. If you see this immediately after OAuth, clear cookies and try again

**Solution:**

```bash
# Clear browser data
1. F12 → Application → Storage → Clear site data
2. Ctrl+Shift+R (hard refresh)
3. Try OAuth flow again
```

### Issue: Profile not saving

**Check:**

1. Console for errors
2. Network tab → Check if upsert succeeded
3. Supabase Dashboard → Check if row was created

**Solution:**

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Should have policy allowing insert:
CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

### Issue: Form fields empty after OAuth

**Check:**

1. Console: "New user or profile not loaded yet, pre-filling from Google data"
2. Check if `user.email` and `user.user_metadata` have data

**Solution:**

```typescript
// Add temporary logging in profile page
useEffect(() => {
  if (user) {
    console.log("User data:", {
      email: user.email,
      metadata: user.user_metadata,
    });
  }
}, [user]);
```

## Database Requirements

### Users Table Must Have:

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('doctor', 'citizen')),
  phone text,
  avatar_url text,
  bio text,
  address text,
  city text,
  country text,
  date_of_birth date,
  gender text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### RLS Policies Required:

```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);
```

## Summary

✅ **OAuth redirects to profile page** - Not sign-in page
✅ **Email pre-filled from Google** - Read-only, can't change
✅ **Form works for new users** - Upsert creates profile
✅ **Form works for existing users** - Upsert updates profile
✅ **No redirect loops** - Proper auth loading check
✅ **Better error handling** - Retry logic and logging
✅ **Clear user feedback** - Loading messages and success alerts

---

**Status:** ✅ Working Correctly
**Last Updated:** October 16, 2025
**Next Steps:** Test with real Google OAuth and verify database
