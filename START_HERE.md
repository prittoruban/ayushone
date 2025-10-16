# 🚀 Quick Start - Test OAuth Now

## Critical Implementation Change

**Changed from `@supabase/auth-helpers-nextjs` to `@supabase/ssr`** for proper PKCE support in Next.js 15.

---

## Steps to Test (DO IN ORDER!)

### 1️⃣ Clean Build

```powershell
# Stop current server (Ctrl+C)
# Delete Next.js cache
Remove-Item -Recurse -Force .next

# Restart
npm run dev
```

### 2️⃣ Clear Browser

```
1. Press Ctrl+Shift+Delete
2. Select "All time"
3. Check: ✅ Cookies ✅ Cache ✅ Site data
4. Click "Clear data"
5. Close browser completely
6. Reopen browser
```

### 3️⃣ Test OAuth

```
1. Go to: http://localhost:[PORT]/auth/signin
2. Open Console (F12)
3. Click "Sign in with Google"
4. Should redirect to /profile
```

---

## What Changed

### Before (Broken)

```typescript
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
const supabase = createRouteHandlerClient({ cookies });
```

**Problem:** Doesn't read PKCE code verifier cookie properly

### After (Fixed)

```typescript
import { createServerSupabaseClient } from "@/lib/supabase";
const supabase = await createServerSupabaseClient();
```

**Solution:** Uses @supabase/ssr with full cookie interface

---

## Files Changed

1. ✅ `src/lib/supabase.ts` - Added `createServerSupabaseClient()`
2. ✅ `src/app/auth/callback/route.ts` - Uses new server client

---

## Expected Console Output

```
✅ OAuth callback received with code: Yes
✅ Attempting to exchange code for session...
✅ Session established successfully user@gmail.com
→ Redirects to /profile
```

---

## If Still Failing

### Quick Debug:

1. Check port number in terminal
2. Clear cookies again
3. Try incognito mode
4. Check Google OAuth redirect URI:
   - Must be: `https://ldhipwazhslwjvhyvrcl.supabase.co/auth/v1/callback`
   - Add in Google Cloud Console → Credentials

### Need Help?

See `PKCE_FIX_FINAL.md` for detailed troubleshooting

---

## Why This Fix Is Different

Previous attempts fixed the cookie _passing_ but not the cookie _reading_.

The new implementation:

- ✅ Properly implements `getAll()` to read ALL cookies
- ✅ Finds the PKCE code verifier cookie
- ✅ Verifies code challenge matches
- ✅ Sets session cookies correctly

**This is the proper way to handle PKCE in Next.js 15+ App Router.**

---

**Ready to test!** 🎉

Commands:

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

Then: Clear browser → Test OAuth → Should work!
