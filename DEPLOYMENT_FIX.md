# Deployment Fix - Vercel Build Error

## Problem
Vercel deployment failing with:
```
[RangeError: Maximum call stack size exceeded]
Error: Command "npm run build" exited with 1
```

## Root Cause
The deprecated `@supabase/auth-helpers-nextjs` package conflicts with the new `@supabase/ssr` package, causing infinite recursion during build.

## Solution Applied

### 1. Removed Deprecated Package
**File:** `package.json`

Removed:
```json
"@supabase/auth-helpers-nextjs": "^0.10.0"
```

We now use only:
```json
"@supabase/ssr": "^0.7.0"
```

### 2. Fixed Database Types
**File:** `src/lib/database.types.ts`

Removed invalid fields from `users.Update` type:
- ❌ Removed `created_at` (can't update, it's auto-generated)
- ❌ Removed `updated_at` (doesn't exist in schema)

## Steps to Deploy

### 1. Commit and Push Changes
```bash
git add .
git commit -m "fix: remove deprecated auth-helpers package causing build error"
git push origin main
```

### 2. Vercel Will Auto-Deploy
- Vercel will detect the push
- Build should now succeed
- Deployment will complete successfully

### 3. Verify Deployment
After deployment completes:
1. Visit your Vercel URL
2. Test Google OAuth sign-in
3. Check profile page loads
4. Verify all functionality works

## What Changed

### Files Modified:
1. ✅ `package.json` - Removed `@supabase/auth-helpers-nextjs`
2. ✅ `src/lib/database.types.ts` - Fixed User.Update type
3. ✅ `src/app/auth/callback/route.ts` - Already uses new SSR package
4. ✅ `src/lib/supabase.ts` - Already uses new SSR package
5. ✅ `src/app/profile/page.tsx` - Fixed email field type issue

### Package Changes:
**Before:**
```json
"@supabase/auth-helpers-nextjs": "^0.10.0",  // DEPRECATED - CAUSES BUILD ERROR
"@supabase/ssr": "^0.7.0"
```

**After:**
```json
"@supabase/ssr": "^0.7.0"  // Only this one, no conflicts
```

## Build Process (What Vercel Does)

1. **Clone repo** from GitHub
2. **Run `npm install`** - Now won't install deprecated package
3. **Run `npm run build`** - Will succeed (no infinite loop)
4. **Deploy** - Application goes live

## Testing After Deployment

### Critical Tests:
- [ ] Homepage loads without errors
- [ ] Sign in page loads
- [ ] Google OAuth redirects correctly
- [ ] Callback creates user profile (database trigger)
- [ ] Profile page loads with user data
- [ ] Sign out works
- [ ] Map page works
- [ ] Doctor listings work

### Check Console Logs:
- No "deprecated package" warnings
- No "Maximum call stack" errors
- Auth flow logs properly

## If Build Still Fails

### Check Vercel Logs:
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments"
4. Click on the failed deployment
5. Check "Build Logs" tab

### Common Issues:
1. **Environment variables missing:**
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Check they're set correctly in Vercel → Settings → Environment Variables

2. **TypeScript errors:**
   - Run `npm run build` locally first
   - Fix any TypeScript errors before pushing

3. **Supabase configuration:**
   - Verify OAuth is enabled in Supabase Dashboard
   - Verify callback URL includes your Vercel domain
   - Example: `https://your-app.vercel.app/auth/callback`

## Success Indicators

✅ Build completes without errors
✅ No "deprecated" warnings in logs
✅ Deployment status shows "Ready"
✅ Application loads on Vercel URL
✅ All auth functionality works

## Important Notes

1. **Local dev still works** - No changes needed to local setup
2. **Database trigger required** - Make sure you ran `verify_and_fix_trigger.sql`
3. **OAuth callback URL** - Update in Supabase to include Vercel domain
4. **Environment variables** - Must be set in Vercel dashboard

## Next Steps After Successful Deployment

1. Update OAuth callback URLs in Supabase:
   - Add: `https://your-app.vercel.app/auth/callback`
   - Keep: `http://localhost:3000/auth/callback` (for local dev)

2. Test complete auth flow on production

3. Monitor Vercel logs for any runtime errors

4. Update documentation with production URL

## Summary

**Problem:** Deprecated package causing infinite recursion
**Solution:** Removed deprecated package, fixed type issues
**Action Required:** Commit and push changes
**Result:** Vercel build will succeed automatically
