# OAuth Profile Redirect Issue - Complete Fix

## Updated: October 16, 2025

## Problem Statement

After Google OAuth authentication, users are experiencing:

```
Loading profile page → Briefly shows "Loading..." → Redirects to sign-in page
```

This creates a loop where users can't access their profile.

## Root Cause Analysis

### Why This Happens

1. **OAuth Redirect Flow:**

   ```
   Google Auth → /auth/callback → Profile Page
   ```

2. **Race Condition:**

   - OAuth callback exchanges code for session
   - Redirects to `/profile` immediately
   - Profile page loads
   - **BUT:** Session cookie not yet propagated to client browser
   - Profile page checks `user` → finds `null`
   - Redirects to `/auth/signin`

3. **Timing Issue:**
   ```
   Server Side (callback):  Session created ✅
   Client Side (profile):   Session = null ❌ (not yet synced)
   ```

## Complete Solution

### Fix 1: Delay Redirect in Profile Page

Added a 1-second grace period before redirecting:

```typescript
// src/app/profile/page.tsx

useEffect(() => {
  if (authLoading) {
    console.log("Auth still loading...");
    return;
  }

  // NEW: Wait before redirecting if no user
  if (!user) {
    console.log("No user detected, waiting before redirect...");
    const redirectTimer = setTimeout(() => {
      console.log("Still no user after waiting, redirecting to signin");
      router.push("/auth/signin");
    }, 1000); // Wait 1 second for session to sync

    return () => clearTimeout(redirectTimer);
  }

  // User exists - proceed normally
  console.log("User found:", user.email);
  // ... populate form
}, [user, userProfile, authLoading, router]);
```

**Why this works:**

- ✅ Gives browser time to receive session cookie
- ✅ Allows auth state to synchronize
- ✅ Prevents premature redirect
- ✅ Still redirects if truly no user

### Fix 2: Enhanced Session Verification in Callback

Added explicit session checks after OAuth exchange:

```typescript
// src/app/auth/callback/route.ts

// Exchange the code for a session
const { data: sessionData, error: sessionError } =
  await supabase.auth.exchangeCodeForSession(code);

if (sessionError) {
  console.error("Error exchanging code for session:", sessionError);
  return NextResponse.redirect(
    new URL("/auth/signin?error=session_failed", requestUrl.origin)
  );
}

console.log("Session established successfully");

// Verify the session is actually set
const {
  data: { session },
} = await supabase.auth.getSession();

if (!session) {
  console.error("Session not found after exchange");
  return NextResponse.redirect(
    new URL("/auth/signin?error=no_session", requestUrl.origin)
  );
}
```

**Why this works:**

- ✅ Explicitly checks for errors
- ✅ Verifies session exists before proceeding
- ✅ Provides specific error messages
- ✅ Fails fast if something is wrong

### Fix 3: Better Loading States

Added multiple loading states to show what's happening:

```typescript
if (authLoading || isCheckingAuth) {
  return (
    <div>
      <Spinner />
      <p>
        {authLoading ? "Loading authentication..." : "Verifying session..."}
      </p>
    </div>
  );
}

if (!user) {
  return (
    <div>
      <Spinner />
      <p>Checking authentication...</p>
    </div>
  );
}
```

**Why this works:**

- ✅ Users see what's happening
- ✅ Different messages for different states
- ✅ No blank screen flashes
- ✅ Clear feedback during wait period

## Testing the Fix

### Test 1: New OAuth User

1. **Clear all cookies and cache**

   ```
   Press F12 → Application → Storage → Clear site data
   ```

2. **Sign in with Google**

   - Go to `/auth/signin`
   - Click "Sign in with Google"
   - Authorize on Google

3. **Expected Console Output:**

   ```
   [Callback] Session established successfully
   [Callback] OAuth user authenticated: user-id user@email.com
   [Callback] Creating new profile for user: user-id
   [Callback] Created new user profile for OAuth user: user-id

   [Profile] Auth still loading...
   [Profile] User found: user@email.com Profile loaded: false
   [Profile] New user or profile not loaded yet, pre-filling from Google data
   ```

4. **Expected UI:**
   - ✅ Lands on `/profile?new=true`
   - ✅ Shows "Complete Your Profile"
   - ✅ Email pre-filled
   - ✅ Name pre-filled (if from Google)
   - ✅ NO redirect to sign-in

### Test 2: Existing OAuth User

1. **Sign in with previously registered Google account**

2. **Expected Console Output:**

   ```
   [Callback] Session established successfully
   [Callback] OAuth user authenticated: user-id user@email.com
   [Callback] Existing profile found, redirecting to profile

   [Profile] Auth still loading...
   [Profile] User found: user@email.com Profile loaded: true
   [Profile] Loading existing profile data
   ```

3. **Expected UI:**
   - ✅ Lands on `/profile`
   - ✅ Shows "Edit Your Profile"
   - ✅ All fields populated with existing data
   - ✅ NO redirect to sign-in

### Test 3: Direct Access (Not Logged In)

1. **Sign out completely**

2. **Navigate directly to `/profile`**

3. **Expected Console Output:**

   ```
   [Profile] Auth still loading...
   [Profile] No user detected, waiting before redirect...
   [Profile] Still no user after waiting, redirecting to signin
   ```

4. **Expected UI:**
   - ✅ Shows loading for ~1 second
   - ✅ Then redirects to `/auth/signin`
   - ✅ Only redirects ONCE (no loop)

## Debugging Checklist

### If Still Getting Redirected:

#### 1. Check Browser Console

Look for these log messages in order:

**Success Pattern:**

```
✅ "Session established successfully"
✅ "OAuth user authenticated: [id] [email]"
✅ "Auth still loading..."
✅ "User found: [email]"
✅ "New user or profile not loaded yet" OR "Loading existing profile data"
```

**Failure Pattern (redirecting):**

```
❌ "Auth still loading..."
❌ "No user detected, waiting before redirect..."
❌ "Still no user after waiting, redirecting to signin"
```

#### 2. Check Network Tab

1. Open DevTools (F12) → Network tab
2. Look for `/auth/callback` request
3. Should return `302` redirect to `/profile`
4. Check Response Headers for `Set-Cookie`
5. Cookie should include `sb-` prefix (Supabase session)

#### 3. Check Application/Storage

1. DevTools → Application → Cookies
2. Look for cookies with `sb-` prefix
3. Should have values (not empty)
4. Check expiration (should be in future)

#### 4. Check Supabase Logs

1. Go to Supabase Dashboard
2. Authentication → Users
3. Verify user was created
4. Check Last Sign In time

#### 5. Increase Wait Time (if needed)

If 1 second isn't enough:

```typescript
// In src/app/profile/page.tsx, line ~65
const redirectTimer = setTimeout(() => {
  console.log("Still no user after waiting, redirecting to signin");
  router.push("/auth/signin");
}, 2000); // Change to 2000 (2 seconds)
```

## Common Issues & Solutions

### Issue 1: Cookies Blocked

**Symptoms:**

- Session created on server
- No cookies in browser
- Always redirects

**Solution:**

```typescript
// Check if cookies are enabled
if (!navigator.cookieEnabled) {
  alert("Please enable cookies to use this feature");
}
```

### Issue 2: CORS Issues

**Symptoms:**

- Console shows CORS errors
- Can't read cookies from Supabase domain

**Solution:**
Check Supabase Dashboard → Settings → API

- Ensure your domain is in allowed origins
- Or use `localhost` for development

### Issue 3: Session Not Persisting

**Symptoms:**

- Works initially
- Refresh page → session lost
- Have to login again

**Solution:**

```typescript
// In Supabase client creation
const supabase = createClientComponentClient({
  persistSession: true, // Ensure this is true
  autoRefreshToken: true,
});
```

### Issue 4: Multiple Redirects

**Symptoms:**

- Profile → Sign-in → Profile → Sign-in (rapid loop)

**Solution:**

```typescript
// Add redirect guard
const [hasRedirected, setHasRedirected] = useState(false);

if (!user && !hasRedirected) {
  setHasRedirected(true);
  setTimeout(() => router.push("/auth/signin"), 1000);
}
```

## Files Modified

| File                             | Lines   | What Changed                  |
| -------------------------------- | ------- | ----------------------------- |
| `src/app/profile/page.tsx`       | 52-104  | Added 1s wait before redirect |
| `src/app/profile/page.tsx`       | 240-265 | Enhanced loading states       |
| `src/app/auth/callback/route.ts` | 13-35   | Added session verification    |

## Advanced Troubleshooting

### Enable Detailed Logging

Add to `src/app/profile/page.tsx`:

```typescript
useEffect(() => {
  console.log("=== Profile Page Auth State ===");
  console.log("authLoading:", authLoading);
  console.log(
    "user:",
    user
      ? {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata,
        }
      : null
  );
  console.log(
    "userProfile:",
    userProfile
      ? {
          email: userProfile.email,
          name: userProfile.name,
        }
      : null
  );
  console.log("================================");
}, [authLoading, user, userProfile]);
```

### Check Session Manually

Add temporary button to profile page:

```typescript
<button
  onClick={async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("Current session:", session);
    alert(session ? "Session exists" : "No session");
  }}
>
  Check Session
</button>
```

### Force Session Refresh

Add to profile page:

```typescript
useEffect(() => {
  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) console.error("Session refresh error:", error);
    else console.log("Session refreshed:", data);
  };

  if (!authLoading && !user) {
    refreshSession();
  }
}, [authLoading, user]);
```

## Environment Checklist

- [ ] Supabase URL configured correctly
- [ ] Supabase Anon Key configured correctly
- [ ] Google OAuth Client ID configured
- [ ] Google OAuth Client Secret configured
- [ ] Redirect URL matches: `https://[project].supabase.co/auth/v1/callback`
- [ ] Site URL configured in Supabase
- [ ] Cookies enabled in browser
- [ ] No ad blockers interfering
- [ ] Using latest Supabase client version

## Success Criteria

After implementing fixes, you should see:

✅ OAuth completes without errors
✅ Lands on `/profile` (not `/auth/signin`)
✅ Email pre-filled from Google
✅ Loading messages show proper state
✅ Console logs show user found
✅ No redirect loop
✅ Session persists on page refresh
✅ Can save profile successfully

## Still Not Working?

If you've tried everything above:

1. **Check Supabase Service Status**

   - https://status.supabase.com

2. **Verify OAuth Configuration**

   - Supabase Dashboard → Authentication → Providers → Google
   - Ensure Client ID and Secret are correct
   - Check redirect URI matches

3. **Test with Different Browser**

   - Some browsers block third-party cookies
   - Try Chrome Incognito or Firefox Private

4. **Check Supabase Logs**

   - Dashboard → Logs
   - Look for authentication errors

5. **Contact Support**
   - Provide console logs
   - Provide network tab screenshots
   - Describe exact steps to reproduce

---

**Status:** ✅ Should be Fixed
**Last Updated:** October 16, 2025
**Next Steps:** Clear cookies and test OAuth flow
