# Session Failed Error - Troubleshooting Guide

## Error: `session_failed`

You're seeing: `http://localhost:3000/auth/signin?error=session_failed`

This means the OAuth callback received a code from Google, but Supabase could not exchange it for a session.

## Common Causes & Solutions

### 1. **Supabase Configuration Issue** ⚠️

#### Check OAuth Redirect URL

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **URL Configuration**
3. Verify these URLs are set:

```
Site URL: http://localhost:3000
Redirect URLs:
  - http://localhost:3000/**
  - http://localhost:3000/auth/callback
```

For production, also add:

```
Site URL: https://yourdomain.com
Redirect URLs:
  - https://yourdomain.com/**
  - https://yourdomain.com/auth/callback
```

#### Fix:

```typescript
// Your callback URL should match exactly
redirectTo: `${window.location.origin}/auth/callback`;
// For localhost: http://localhost:3000/auth/callback
// For production: https://yourdomain.com/auth/callback
```

### 2. **Google OAuth Configuration Issue** ⚠️

#### Check Google Cloud Console

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, verify:

```
Development:
https://[your-project-ref].supabase.co/auth/v1/callback

Production:
https://[your-project-ref].supabase.co/auth/v1/callback
```

**Important:** The redirect URI should point to **Supabase**, not your app!

#### Fix Steps:

1. Copy your Supabase project reference from dashboard URL
   - Example: `https://abcdefgh.supabase.co`
2. Add this to Google OAuth authorized redirect URIs:
   - `https://abcdefgh.supabase.co/auth/v1/callback`
3. **Save** and wait 5 minutes for changes to propagate
4. Try OAuth again

### 3. **Code Already Used** ⚠️

OAuth authorization codes are single-use. If you refresh the callback page, the code becomes invalid.

#### Symptoms:

- Works first time
- Fails on refresh
- Error: "code already used" or "invalid grant"

#### Fix:

- Don't refresh the `/auth/callback` page
- Start OAuth flow again from `/auth/signin`
- Clear browser history if stuck

### 4. **Environment Variables Missing** ⚠️

#### Check `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Verify:

```bash
# Print env vars (careful not to share publicly!)
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Fix:

1. Copy correct values from Supabase Dashboard → Settings → API
2. Paste into `.env.local`
3. **Restart dev server**: `npm run dev` or `yarn dev`

### 5. **Cookie Issues** ⚠️

#### Symptoms:

- Session created but not persisted
- Works in one browser, fails in another
- Incognito mode works, normal mode doesn't

#### Fix:

```bash
# Clear all site data
1. Open DevTools (F12)
2. Application → Storage → Clear site data
3. Hard refresh (Ctrl+Shift+R)
4. Try OAuth again
```

### 6. **Supabase Package Version** ⚠️

Some Supabase auth helper versions have bugs with Next.js 13+.

#### Check your `package.json`:

```json
{
  "@supabase/auth-helpers-nextjs": "^0.8.0", // Should be 0.8.0 or higher
  "@supabase/supabase-js": "^2.38.0" // Should be 2.38.0 or higher
}
```

#### Fix:

```bash
# Update Supabase packages
npm install @supabase/auth-helpers-nextjs@latest @supabase/supabase-js@latest

# Or with yarn
yarn add @supabase/auth-helpers-nextjs@latest @supabase/supabase-js@latest

# Restart dev server
npm run dev
```

## Debugging Steps

### Step 1: Check Browser Console

1. Open DevTools (F12) → Console
2. Look for error messages
3. Check for:
   ```
   ✅ "OAuth callback received with code: Yes"
   ✅ "Attempting to exchange code for session..."
   ❌ "Error exchanging code for session:"
   ```

### Step 2: Check Network Tab

1. DevTools → Network tab
2. Find `/auth/callback` request
3. Check Response:
   - Status: Should be `302` (redirect)
   - Location header: Should point to `/profile`
4. Look for errors in response body

### Step 3: Check Supabase Logs

1. Go to Supabase Dashboard
2. Logs → Auth Logs
3. Look for recent OAuth attempts
4. Check for error messages

### Step 4: Test with Fresh OAuth Flow

```bash
# Complete clean start
1. Sign out completely
2. Clear all cookies and cache
3. Close browser
4. Open new browser window
5. Go to localhost:3000/auth/signin
6. Click "Sign in with Google"
7. Watch console for errors
```

## Detailed Error Messages

The callback now provides detailed error messages. Check the URL:

```
http://localhost:3000/auth/signin?error=session_failed&details=<error_details>
```

### Common Error Details:

#### "Invalid login credentials"

- Google OAuth not enabled in Supabase
- **Fix:** Dashboard → Authentication → Providers → Enable Google

#### "Invalid client_id"

- Wrong Google OAuth Client ID in Supabase
- **Fix:** Dashboard → Authentication → Providers → Google → Update Client ID

#### "redirect_uri_mismatch"

- Redirect URI not authorized in Google Console
- **Fix:** Add `https://[project].supabase.co/auth/v1/callback` to Google Console

#### "invalid_grant"

- Code expired or already used
- **Fix:** Start OAuth flow again (don't refresh callback page)

## Quick Fix Checklist

Try these in order:

- [ ] **Restart dev server** - `npm run dev`
- [ ] **Clear cookies** - DevTools → Application → Clear site data
- [ ] **Check Supabase redirect URLs** - Dashboard → Authentication → URL Configuration
- [ ] **Verify Google OAuth redirect URI** - Must be Supabase URL, not localhost
- [ ] **Update Supabase packages** - `npm install @supabase/auth-helpers-nextjs@latest`
- [ ] **Check environment variables** - `.env.local` has correct values
- [ ] **Test in incognito** - Rules out cookie/cache issues
- [ ] **Check Supabase logs** - Dashboard → Logs → Auth

## Testing the Fix

After making changes:

```bash
# 1. Restart everything
npm run dev

# 2. Clear browser
DevTools → Application → Clear site data

# 3. Test OAuth flow
1. Go to http://localhost:3000/auth/signin
2. Click "Sign in with Google"
3. Authorize on Google
4. Watch console logs
5. Should land on /profile

# Expected console output:
✅ "OAuth callback received with code: Yes"
✅ "Attempting to exchange code for session..."
✅ "Session established successfully"
✅ "OAuth user authenticated: user@email.com"
```

## Still Not Working?

### Verify Supabase Configuration

```bash
# Check if Google OAuth is enabled
curl https://[your-project].supabase.co/auth/v1/settings

# Should show:
# "external": {
#   "google": {
#     "enabled": true
#   }
# }
```

### Alternative: Use Different Auth Method

If Google OAuth continues to fail:

```typescript
// Temporarily use email/password auth for testing
<Button
  onClick={() => {
    signIn("test@example.com", "password123");
  }}
>
  Test Sign In
</Button>
```

### Get Help

If none of the above works:

1. **Supabase Discord**: https://discord.supabase.com
2. **GitHub Issues**: https://github.com/supabase/supabase/issues
3. **Stack Overflow**: Tag with `supabase` and `next.js`

**Provide this info:**

- Exact error message from URL
- Console logs
- Supabase version
- Next.js version
- Browser used
- Steps to reproduce

---

## Most Common Fix (90% of cases)

**The Google OAuth redirect URI is wrong!**

```
❌ WRONG: http://localhost:3000/auth/callback
❌ WRONG: https://yourdomain.com/auth/callback

✅ CORRECT: https://[your-supabase-project].supabase.co/auth/v1/callback
```

**How to fix:**

1. Get your Supabase URL from dashboard
2. Add `/auth/v1/callback` to it
3. Add that to Google Cloud Console → Authorized redirect URIs
4. Wait 5 minutes
5. Try again

---

**Status:** Ready to debug
**Next Step:** Check Google OAuth redirect URI first!
