# PKCE Error Fix: "code challenge does not match previously saved code verifier"

## Error Explanation

**Error:** `code challenge does not match previously saved code verifier`

This is a **PKCE (Proof Key for Code Exchange)** error that occurs during OAuth flow.

### What is PKCE?

PKCE is a security extension for OAuth 2.0 that prevents authorization code interception attacks:

1. **Client generates code verifier** → Random string stored in cookies
2. **Client creates code challenge** → Hash of code verifier sent to OAuth provider
3. **OAuth callback receives code** → Must verify with original code verifier
4. **If mismatch** → "code challenge does not match" error

### Why This Happens

The error occurs when:

- ❌ **Cookie mismatch:** Code verifier cookie not properly passed to callback
- ❌ **Multiple client instances:** Different Supabase clients have different cookie contexts
- ❌ **Cookie cleared:** Browser cleared cookies between OAuth initiation and callback
- ❌ **Wrong cookie handler:** Callback route not using proper cookie handling

## Fixes Applied

### 1. Fixed Callback Route Cookie Handling ✅

**File:** `src/app/auth/callback/route.ts`

**Before:**

```typescript
const cookieStore = cookies();
const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
```

**After:**

```typescript
// Proper cookie handling for PKCE flow
const supabase = createRouteHandlerClient({ cookies });
```

**Why:** The `createRouteHandlerClient` expects the `cookies` function directly, not a static cookie store. This ensures the code verifier cookie is properly retrieved.

### 2. Enhanced OAuth Initiation ✅

**File:** `src/contexts/AuthContext.tsx`

**Added:**

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    skipBrowserRedirect: false, // ← Ensures proper redirect
    queryParams: {
      access_type: "offline",
      prompt: "consent",
    },
  },
});
```

**Why:** `skipBrowserRedirect: false` ensures the OAuth flow completes properly with PKCE.

## Additional Troubleshooting

### Check 1: Clear All Cookies

Sometimes stale PKCE cookies cause issues:

```bash
# Steps:
1. Open DevTools (F12)
2. Application → Cookies
3. Delete ALL cookies for localhost:3000
4. Hard refresh (Ctrl+Shift+R)
5. Try OAuth again
```

### Check 2: Verify Supabase Packages

Make sure you have compatible versions:

```bash
npm list @supabase/auth-helpers-nextjs @supabase/supabase-js @supabase/ssr
```

**Required versions:**

```json
{
  "@supabase/auth-helpers-nextjs": "^0.8.0 or higher",
  "@supabase/supabase-js": "^2.38.0 or higher",
  "@supabase/ssr": "^0.0.10 or higher"
}
```

**Update if needed:**

```bash
npm install @supabase/auth-helpers-nextjs@latest @supabase/supabase-js@latest @supabase/ssr@latest
```

### Check 3: Restart Dev Server

PKCE state can get cached incorrectly:

```bash
# Stop server
Ctrl+C

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### Check 4: Test in Incognito Mode

Rules out cookie/cache issues:

```bash
1. Open incognito/private window
2. Go to http://localhost:3000/auth/signin
3. Click "Sign in with Google"
4. Should work if PKCE state was corrupted
```

### Check 5: Verify Cookie Settings

Make sure third-party cookies aren't blocked:

**Chrome:**

1. Settings → Privacy and security
2. Third-party cookies → "Allow third-party cookies"
3. Try OAuth again

**Firefox:**

1. Settings → Privacy & Security
2. Standard or Custom (allow cookies)
3. Try OAuth again

## Testing the Fix

### Step 1: Restart Everything

```bash
# Terminal 1: Stop server
Ctrl+C

# Clear caches
rm -rf .next

# Restart dev server
npm run dev
```

### Step 2: Clear Browser Data

```bash
1. DevTools (F12)
2. Application → Clear storage
3. Check "Cookies" and "Cache storage"
4. Click "Clear site data"
5. Close DevTools
```

### Step 3: Test OAuth Flow

```bash
1. Go to: http://localhost:3000/auth/signin
2. Open console (F12 → Console)
3. Click "Sign in with Google"
4. Watch for console logs:
   ✅ "OAuth callback received with code: Yes"
   ✅ "Attempting to exchange code for session..."
   ✅ "Session established successfully"
5. Should redirect to /profile
```

### Expected Console Output

**On Sign-In Page:**

```
[AuthContext] Initiating Google OAuth...
```

**On Callback:**

```
OAuth callback received with code: Yes
Attempting to exchange code for session...
Session established successfully user@gmail.com
OAuth user authenticated: user@gmail.com
```

**Success:** Redirects to `/profile` with pre-filled email

## Common Issues After Fix

### Issue 1: Still Getting PKCE Error

**Cause:** Stale cookies from previous attempts

**Fix:**

```bash
1. Close ALL browser tabs for localhost:3000
2. Clear ALL browser data (Ctrl+Shift+Delete)
3. Restart browser completely
4. Open fresh tab → localhost:3000/auth/signin
5. Try OAuth
```

### Issue 2: "Invalid client_id"

**Cause:** Google OAuth not configured in Supabase

**Fix:**

1. Supabase Dashboard → Authentication → Providers
2. Enable Google
3. Add Client ID and Client Secret from Google Cloud Console
4. Save

### Issue 3: "redirect_uri_mismatch"

**Cause:** Google OAuth redirect URI incorrect

**Fix:**

1. Google Cloud Console → Credentials
2. OAuth 2.0 Client ID → Edit
3. Add: `https://ldhipwazhslwjvhyvrcl.supabase.co/auth/v1/callback`
4. Save and wait 5 minutes

### Issue 4: Works Once, Then Fails

**Cause:** Browser caching PKCE state

**Fix:**

1. Always start OAuth from `/auth/signin` page (don't bookmark callback URL)
2. Don't refresh callback page
3. If stuck, start over from signin page

## Architecture Explanation

### Correct PKCE Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Sign in with Google"                        │
│    → AuthContext.signInWithGoogle()                         │
│    → supabase.auth.signInWithOAuth()                        │
│    → Generates code_verifier, stores in cookie              │
│    → Creates code_challenge (hash of verifier)              │
│    → Redirects to Google with code_challenge                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User authorizes on Google                                │
│    → Google redirects to Supabase with auth code            │
│    → Supabase redirects to /auth/callback?code=...          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Callback route handles exchange                          │
│    → createRouteHandlerClient({ cookies })                  │
│    → Retrieves code_verifier from cookies ← CRITICAL        │
│    → exchangeCodeForSession(code)                           │
│    → Supabase verifies: code_challenge matches verifier     │
│    → Returns session tokens                                 │
│    → Redirects to /profile                                  │
└─────────────────────────────────────────────────────────────┘
```

### Why Cookie Handling Matters

```typescript
// ❌ WRONG - Static cookie store doesn't update
const cookieStore = cookies();
const supabase = createRouteHandlerClient({
  cookies: () => cookieStore, // Stale cookies!
});

// ✅ CORRECT - Dynamic cookie access
const supabase = createRouteHandlerClient({
  cookies, // Fresh cookies with PKCE verifier
});
```

## Production Considerations

### 1. Domain Configuration

For production, update redirect URLs:

**Supabase Dashboard:**

```
Site URL: https://yourdomain.com
Redirect URLs:
  - https://yourdomain.com/**
  - https://yourdomain.com/auth/callback
```

**Google Cloud Console:**

```
Authorized redirect URIs:
  - https://your-supabase-project.supabase.co/auth/v1/callback
```

### 2. Cookie Security

Ensure secure cookie settings in production:

```typescript
// Supabase handles this automatically in production
// Cookies will have:
// - Secure flag (HTTPS only)
// - HttpOnly flag
// - SameSite=Lax or Strict
```

### 3. Error Monitoring

Add error tracking for PKCE failures:

```typescript
if (sessionError) {
  // Log to your error tracking service
  console.error("OAuth exchange failed:", {
    error: sessionError.message,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get("user-agent"),
  });
}
```

## Summary

✅ **Fixed:** Cookie handling in callback route
✅ **Added:** skipBrowserRedirect configuration
✅ **Enhanced:** Error logging for debugging

**Test:** Clear cookies → Restart server → Try OAuth → Should work!

**If still failing:** Check browser console for specific error messages and verify Google OAuth configuration.
