# 🔧 PKCE Fix - Updated Implementation

## Critical Changes Made

### Problem

The PKCE error persisted because `@supabase/auth-helpers-nextjs` doesn't handle cookies correctly in Next.js 15 with the new async cookies API.

### Solution

Switched to using `@supabase/ssr` directly with proper cookie handling.

---

## Files Changed

### 1. ✅ `src/lib/supabase.ts` - New Server Client

Added `createServerSupabaseClient()` function that properly handles cookies for PKCE:

```typescript
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Handled gracefully
        }
      },
    },
  });
};
```

**Why this works:**

- Uses `@supabase/ssr`'s `createServerClient` (not auth-helpers)
- Properly implements `getAll()` and `setAll()` for cookies
- Correctly reads PKCE code verifier from cookies
- Sets new session cookies after exchange

### 2. ✅ `src/app/auth/callback/route.ts` - Updated Callback

Changed from:

```typescript
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
const supabase = createRouteHandlerClient({ cookies });
```

To:

```typescript
import { createServerSupabaseClient } from "@/lib/supabase";
const supabase = await createServerSupabaseClient();
```

---

## Why Previous Fix Didn't Work

The `@supabase/auth-helpers-nextjs` package has compatibility issues with Next.js 15's async cookies API. The `createRouteHandlerClient` was:

- ❌ Not awaiting the cookies properly
- ❌ Not implementing the full cookie interface
- ❌ Missing `getAll()` method for PKCE verifier retrieval

The new approach uses `@supabase/ssr` which is:

- ✅ Designed for Next.js 13+ with App Router
- ✅ Properly handles async cookies
- ✅ Implements full cookie interface for PKCE
- ✅ Actively maintained by Supabase

---

## Testing Steps (IMPORTANT!)

### 🧹 Step 1: Complete Clean Start

**This is CRITICAL - do ALL of these:**

1. **Stop all dev servers:**

   ```bash
   # Press Ctrl+C in all terminals
   ```

2. **Clear Next.js cache:**

   ```powershell
   # In PowerShell:
   Remove-Item -Recurse -Force .next

   # Or manually delete the .next folder
   ```

3. **Clear browser completely:**

   - Press `Ctrl+Shift+Delete`
   - Select "All time"
   - Check: Cookies, Cache, Site data
   - Click "Clear data"
   - **Close browser completely** (all windows)

4. **Restart browser:**
   - Open fresh browser window
   - Don't restore previous session

### 🚀 Step 2: Start Fresh Dev Server

```powershell
npm run dev
```

**Important:** Note the port number (likely 3001)

### 🧪 Step 3: Test OAuth Flow

1. **Open browser to:** http://localhost:3001/auth/signin (or your port)

2. **Open DevTools Console** (F12 → Console)

3. **Clear console** (click trash icon)

4. **Click "Sign in with Google"**

5. **Watch console output:**

   ```
   Expected logs:
   ✅ OAuth callback received with code: Yes
   ✅ Attempting to exchange code for session...
   ✅ Session established successfully user@gmail.com
   ```

6. **Should redirect to:** http://localhost:3001/profile

### ✅ Success Indicators

- No PKCE error
- No redirect loop
- Lands on profile page
- Email is pre-filled from Google account
- Console shows "Session established successfully"

---

## If Still Failing

### Check 1: Verify Cookies Are Being Read

Add this temporary debugging to the callback:

```typescript
// In callback route after creating supabase client
const cookieStore = await cookies();
const allCookies = cookieStore.getAll();
console.log(
  "All cookies:",
  allCookies.map((c) => c.name)
);
```

**Look for:** A cookie with "code-verifier" in the name

**If missing:** Browser didn't store the cookie (check browser settings)

### Check 2: Test in Different Browser

Sometimes browser extensions block cookies:

1. **Try Firefox** if using Chrome, or vice versa
2. **Try Incognito/Private mode**
3. **Disable all extensions**

### Check 3: Verify Supabase Configuration

1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard/project/ldhipwazhslwjvhyvrcl

2. **Authentication → URL Configuration:**

   ```
   Site URL: http://localhost:3001
   Redirect URLs:
     - http://localhost:3001/**
     - http://localhost:3001/auth/callback
   ```

3. **Authentication → Providers → Google:**
   - Status: Enabled ✅
   - Client ID: Filled in ✅
   - Client Secret: Filled in ✅

### Check 4: Verify Google OAuth Configuration

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com

2. **Credentials → OAuth 2.0 Client ID:**

   ```
   Authorized redirect URIs:
     - https://ldhipwazhslwjvhyvrcl.supabase.co/auth/v1/callback
   ```

   **Important:** Must be Supabase URL, NOT localhost!

### Check 5: Check for Port Conflicts

If server keeps switching ports:

```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (use the PID from above)
taskkill /PID <PID> /F

# Then restart
npm run dev
```

---

## Common Error Messages

### "code challenge does not match"

- **Cause:** Cookie not being read properly
- **Fix:** Use the new implementation (already done)
- **Test:** Clear cookies and try again

### "redirect_uri_mismatch"

- **Cause:** Google OAuth redirect URI incorrect
- **Fix:** Add Supabase callback URL to Google Console
- **URL:** `https://ldhipwazhslwjvhyvrcl.supabase.co/auth/v1/callback`

### "invalid_grant"

- **Cause:** Authorization code expired or already used
- **Fix:** Don't refresh callback page, start OAuth from signin page

### "Invalid client_id"

- **Cause:** Google OAuth not configured in Supabase
- **Fix:** Enable Google provider and add credentials

---

## Architecture Changes

### Before (Not Working)

```
Sign In → OAuth → Callback → createRouteHandlerClient
          ↓                    ↓
    Code Verifier Cookie → ❌ Can't read properly
```

### After (Working)

```
Sign In → OAuth → Callback → createServerSupabaseClient
          ↓                    ↓
    Code Verifier Cookie → ✅ getAll() reads all cookies
                           ✅ setAll() sets session cookies
                           ✅ PKCE verification succeeds
```

---

## Package Versions

Your current versions (from package.json):

```json
{
  "@supabase/auth-helpers-nextjs": "^0.10.0", // Not used anymore
  "@supabase/ssr": "^0.7.0", // Now used for server
  "@supabase/supabase-js": "^2.57.4" // Latest
}
```

These versions are **correct** and support the new implementation.

---

## Production Deployment

When deploying to production:

1. **Update Supabase URL Configuration:**

   ```
   Site URL: https://yourdomain.com
   Redirect URLs:
     - https://yourdomain.com/**
   ```

2. **Update Google OAuth:**

   - Keep Supabase redirect URI (stays the same)
   - `https://ldhipwazhslwjvhyvrcl.supabase.co/auth/v1/callback`

3. **Environment Variables:**
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` is set
   - Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set

---

## Summary

✅ **Replaced:** `createRouteHandlerClient` with `createServerSupabaseClient`
✅ **Uses:** `@supabase/ssr` directly (better Next.js 15 support)
✅ **Implements:** Proper cookie `getAll()` and `setAll()` for PKCE
✅ **Fixed:** Async cookies handling

**Status:** Ready to test with complete clean start

**Next:** Clear everything → Restart → Test OAuth → Should work! 🎉

---

## Quick Checklist

Before testing, confirm:

- [ ] Deleted `.next` folder
- [ ] Cleared ALL browser cookies
- [ ] Closed and reopened browser
- [ ] Dev server restarted (`npm run dev`)
- [ ] Using correct port (check terminal output)
- [ ] DevTools console is open
- [ ] Starting from `/auth/signin` page (not bookmarked callback URL)

**Ready!** Go to: http://localhost:[YOUR_PORT]/auth/signin
