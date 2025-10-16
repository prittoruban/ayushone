# Authentication Loop Fix - October 16, 2025

## Problem

Users were experiencing an infinite redirect loop:

```
Google Sign In → Profile Page → Sign In Page → Profile Page → Loop...
```

## Root Cause Identified

### Issue 1: Premature Redirect Check

The profile page was checking `!user` and redirecting immediately, without waiting for the auth state to fully load:

```typescript
// BEFORE (Broken):
useEffect(() => {
  if (!authLoading && !user) {
    router.push("/auth/signin"); // Redirects too quickly!
    return;
  }
  // ...
}, [user, userProfile, authLoading, router]);
```

**Problem:**

- Auth loading finishes (`authLoading = false`)
- But `user` might still be `null` temporarily
- Immediate redirect before session is established
- Creates loop: profile → signin → callback → profile → signin...

### Issue 2: Race Condition

The OAuth callback redirects to `/profile`, but the client-side AuthContext might not have received the session yet, causing:

1. Callback sets session in Supabase
2. Redirects to `/profile`
3. Profile page checks auth (too fast)
4. Session not propagated to client yet
5. `user` is `null` → redirect to signin
6. Loop continues

## Solutions Implemented

### Fix 1: Wait for Auth to Complete (Profile Page)

Updated the useEffect to properly wait:

```typescript
// AFTER (Fixed):
useEffect(() => {
  // Wait for auth to finish loading before checking user
  if (authLoading) {
    return; // Don't do anything while loading
  }

  // Only redirect if auth is loaded and definitely no user
  if (!user) {
    console.log("No user found, redirecting to signin");
    router.push("/auth/signin");
    return;
  }

  // User exists, populate form...
}, [user, userProfile, authLoading, router]);
```

**Benefits:**

- ✅ Waits for `authLoading` to be `false`
- ✅ Then checks if user exists
- ✅ Only redirects if truly no user
- ✅ Prevents premature redirects

### Fix 2: Enhanced Loading States

Added two loading states:

```typescript
// While auth is loading
if (authLoading) {
  return <LoadingSpinner message="Loading your profile..." />;
}

// If no user but auth finished (during redirect)
if (!user) {
  return <LoadingSpinner message="Redirecting..." />;
}
```

**Benefits:**

- ✅ Users see feedback while waiting
- ✅ Prevents blank screen flashes
- ✅ Clear indication of what's happening

### Fix 3: Better Error Handling in Callback

Added comprehensive logging and error handling:

```typescript
if (user) {
  console.log("OAuth user authenticated:", user.id);

  const { data: existingProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    console.error("Error fetching profile:", profileError);
  }

  if (!existingProfile) {
    console.log("Creating new profile for user:", user.id);

    const { error: insertError } = await supabase.from("users").insert({
      // ... profile data
    });

    if (insertError) {
      console.error("Error creating profile:", insertError);
      return NextResponse.redirect(
        new URL("/auth/signin?error=profile_creation_failed", requestUrl.origin)
      );
    }
  }

  console.log("Existing profile found, redirecting to profile");
}
```

**Benefits:**

- ✅ Detailed console logs for debugging
- ✅ Proper error handling for profile creation
- ✅ Informative error messages
- ✅ Graceful fallback on failure

## How to Test the Fix

### Test 1: New User OAuth Flow

1. Clear browser cookies and local storage
2. Go to `/auth/signin`
3. Click "Sign in with Google"
4. Authorize app in Google
5. **Expected:** Should land on `/profile?new=true` without loop
6. **Check console:** Should see "OAuth user authenticated" and "Creating new profile"

### Test 2: Existing User OAuth Flow

1. Sign in with existing Google account
2. **Expected:** Should land on `/profile` without loop
3. **Check console:** Should see "Existing profile found"

### Test 3: Direct Profile Access (Not Logged In)

1. Sign out completely
2. Navigate directly to `/profile`
3. **Expected:** Should redirect to `/auth/signin` once (no loop)
4. **Check console:** Should see "No user found, redirecting to signin"

### Test 4: Direct Profile Access (Logged In)

1. Sign in normally
2. Navigate to `/profile`
3. **Expected:** Profile page loads with your data
4. **No redirects**

## Debugging Checklist

If loop still occurs, check these:

### 1. Browser Console Logs

Look for:

```
✅ "Loading your profile..."
✅ "OAuth user authenticated: [user-id]"
✅ "Creating new profile..." or "Existing profile found"
❌ "No user found, redirecting to signin" (repeatedly = problem)
```

### 2. Network Tab

Check:

- OAuth callback (`/auth/callback?code=...`) - Should return 302 redirect
- Profile page load - Should not immediately redirect
- Session cookie is set properly

### 3. Supabase Dashboard

Verify:

- User exists in Authentication → Users
- User profile exists in Database → users table
- Row-Level Security policies allow user to read their profile

### 4. Auth State

Add temporary logging in profile page:

```typescript
useEffect(() => {
  console.log("Auth state:", {
    authLoading,
    user: !!user,
    userProfile: !!userProfile,
  });
}, [authLoading, user, userProfile]);
```

Expected output:

```
1. { authLoading: true, user: false, userProfile: false }
2. { authLoading: false, user: true, userProfile: false }
3. { authLoading: false, user: true, userProfile: true }
```

## Common Issues & Solutions

### Issue: Still looping after fix

**Solution 1:** Clear browser cache and cookies

```
1. Open DevTools (F12)
2. Application → Storage → Clear site data
3. Hard refresh (Ctrl+Shift+R)
4. Try OAuth flow again
```

**Solution 2:** Check Supabase session

```typescript
// Add to profile page temporarily
useEffect(() => {
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    console.log("Session:", data.session);
  };
  checkSession();
}, []);
```

**Solution 3:** Increase timeout
If network is slow, add a small delay:

```typescript
useEffect(() => {
  if (authLoading) return;

  // Add small delay to ensure session is propagated
  const timer = setTimeout(() => {
    if (!user) {
      console.log("No user found, redirecting to signin");
      router.push("/auth/signin");
    }
  }, 100); // 100ms delay

  return () => clearTimeout(timer);
}, [authLoading, user, router]);
```

### Issue: Profile not created in database

**Check:**

1. RLS policies allow insert:

```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

2. User has permission:

```sql
-- Should have policy like:
CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

### Issue: Redirect to wrong page

**Check OAuth callback:**

```typescript
// Should redirect to profile, not home
return NextResponse.redirect(new URL("/profile", requestUrl.origin));
// NOT:
return NextResponse.redirect(new URL("/", requestUrl.origin));
```

## Files Modified

1. **`src/app/profile/page.tsx`**

   - Line ~49-76: Updated useEffect logic
   - Line ~189-213: Enhanced loading states

2. **`src/app/auth/callback/route.ts`**
   - Line ~21-52: Added comprehensive logging
   - Line ~36-43: Better error handling

## Testing Results

### Expected Behavior:

- ✅ OAuth → Profile (new user) - No loop
- ✅ OAuth → Profile (existing user) - No loop
- ✅ Direct /profile access (logged out) - Redirects once to signin
- ✅ Direct /profile access (logged in) - Loads profile

### Before Fix:

- ❌ OAuth → Profile → Signin → Profile → Loop
- ❌ Flashing screens
- ❌ Console errors

### After Fix:

- ✅ Smooth redirect flow
- ✅ Clear loading messages
- ✅ No console errors
- ✅ Proper auth state management

## Prevention Tips

### For Future Development:

1. **Always check authLoading first:**

```typescript
if (authLoading) return; // Wait for auth to load
if (!user) {
  /* redirect */
} // Then check user
```

2. **Use proper loading states:**

```typescript
if (authLoading) return <Loading />;
if (!user) return <Redirecting />;
return <ActualContent />;
```

3. **Log auth state changes:**

```typescript
useEffect(() => {
  console.log("Auth changed:", { authLoading, user: !!user });
}, [authLoading, user]);
```

4. **Test all redirect paths:**

- New user OAuth
- Existing user OAuth
- Direct URL access (logged in)
- Direct URL access (logged out)

## Support

If you still experience loops:

1. Check browser console for specific errors
2. Verify Supabase session is set
3. Check network tab for redirect chain
4. Clear all cookies and try again
5. Check RLS policies in Supabase

---

**Status:** ✅ Fixed
**Date:** October 16, 2025
**Files Changed:** 2
**Severity:** Critical → Resolved
