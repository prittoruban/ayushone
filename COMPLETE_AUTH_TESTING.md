# Auth System Complete Testing Guide

## Current Status

✅ Fixed OAuth callback - removed manual profile insert (trigger handles it)
✅ Fixed database types - only 5 fields match actual schema
✅ Sign-in/sign-out using window.location.href for reliable redirects
✅ Profile page simplified loading logic

## Prerequisites - Run This First!

### 1. Verify Database Trigger Exists

Go to Supabase Dashboard → SQL Editor → Run this:

```sql
SELECT
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

**Expected Result:** One row showing trigger exists and enabled = 'O'

**If no results:** Run the entire `supabase/verify_and_fix_trigger.sql` file in SQL Editor

### 2. Verify Schema Matches Code

In Supabase Dashboard → Table Editor → users table should have ONLY these columns:

- `id` (uuid, primary key)
- `name` (text)
- `role` (text)
- `phone` (text, nullable)
- `created_at` (timestamp)

**If you have extra columns** (email, avatar_url, bio, etc.), they need to be removed or our code needs to use them.

---

## Testing Checklist

### Test 1: Google OAuth Sign-In (New User)

1. **Clear browser data:**

   - Open DevTools (F12)
   - Go to Application tab → Cookies → Clear all for localhost
   - Close all localhost tabs

2. **Start fresh:**

   ```powershell
   npm run dev
   ```

3. **Test OAuth flow:**

   - Navigate to http://localhost:3000
   - Click "Sign In" in navbar
   - Click "Sign in with Google"
   - Choose a Google account you've NEVER used before
   - **Expected:** Redirect to /profile?new=true
   - **Check console logs** for "database trigger should create profile"

4. **Verify profile created:**

   - Go to Supabase Dashboard → Table Editor → users
   - Find your user by the Google email
   - Verify all fields are populated (id, name, role='citizen', phone=null, created_at)

5. **Test profile page works:**
   - Should see your name and email
   - Form should be editable
   - Try updating phone number and role
   - Click "Update Profile"
   - **Expected:** Success message and data updates

### Test 2: Google OAuth Sign-In (Existing User)

1. **Sign out:**

   - Click your profile icon → Sign Out
   - **Expected:** Redirect to /auth/signin

2. **Sign in again:**
   - Click "Sign in with Google"
   - Choose the SAME Google account from Test 1
   - **Expected:** Redirect to /profile (without ?new=true)
   - **Expected:** Your updated profile data shows correctly

### Test 3: Email/Password Sign-Up (New User)

1. **Sign out** (if signed in)

2. **Go to sign up:**

   - Navigate to /auth/signup
   - Fill in:
     - Email: test@example.com
     - Password: SecurePass123!
     - Name: Test User
     - Role: citizen or doctor
     - Phone: (optional)
   - Click "Sign Up"

3. **Check email:**

   - Go to your email inbox
   - Find Supabase confirmation email
   - Click the confirmation link

4. **Verify profile created:**

   - After email confirmation, should redirect to sign-in
   - Sign in with the email/password
   - **Expected:** Redirect to / then can navigate to /profile
   - **Expected:** Profile data matches what you entered

5. **Check database:**
   - Supabase → users table
   - Find the test@example.com user
   - Verify trigger created the profile with correct fields

### Test 4: Email/Password Sign-In (Existing User)

1. **Sign out**

2. **Sign in with email/password:**
   - Go to /auth/signin
   - Enter test@example.com and password
   - Click "Sign In"
   - **Expected:** Redirect to /
   - **Expected:** Can navigate to /profile and see data

### Test 5: Sign Out Functionality

1. **While signed in:**

   - Click profile icon in navbar
   - Click "Sign Out"
   - **Expected:** Redirect to /auth/signin
   - **Expected:** Navbar shows "Sign In" button (not profile icon)
   - **Expected:** Console logs "Sign out successful!"

2. **Try accessing protected routes:**
   - Try to go to /profile directly
   - **Expected:** Should redirect or show appropriate message

### Test 6: Profile Updates

1. **Sign in** (any method)

2. **Go to /profile**

3. **Update information:**

   - Change name
   - Change phone
   - Change role (if applicable)
   - Click "Update Profile"

4. **Verify update:**
   - Should see success message
   - Refresh page - changes should persist
   - Check Supabase → users table - should see updated data

### Test 7: Error Scenarios

1. **Invalid OAuth:**

   - Start OAuth flow but cancel on Google screen
   - **Expected:** Return to sign-in with error message

2. **Wrong password:**

   - Try to sign in with wrong password
   - **Expected:** Error message displayed

3. **Duplicate email:**
   - Try to sign up with email that already exists
   - **Expected:** Error message displayed

---

## Common Issues & Solutions

### Issue: "Could not find 'avatar_url' column"

**Solution:** Run `supabase/verify_and_fix_trigger.sql` - this was the old issue, now fixed

### Issue: Profile page shows loading forever

**Solution:** Check browser console - look for auth errors. Verify you're signed in.

### Issue: OAuth redirects to signin with error

**Solution:** Check:

1. Supabase OAuth enabled for Google
2. Callback URL: http://localhost:3000/auth/callback
3. Database trigger exists (run Step 1 above)

### Issue: Sign out doesn't work

**Solution:** Should be fixed now with window.location.href. Check browser console for errors.

### Issue: Profile not created after OAuth

**Solution:**

1. Verify trigger exists (SQL query above)
2. Check Supabase logs in Dashboard → Logs → SQL logs
3. Look for errors in handle_new_user function

---

## Success Criteria

All tests should pass with:

- ✅ No console errors
- ✅ Proper redirects to expected pages
- ✅ Profile data persists in database
- ✅ Sign-in/sign-out works reliably
- ✅ Both OAuth and email/password work
- ✅ Profile updates save correctly
- ✅ RLS policies allow users to see their own data only

---

## Next Steps After Testing

If all tests pass:

1. Document any issues found
2. Test on production with real Google OAuth credentials
3. Consider adding more profile fields if needed
4. Add profile picture upload if required
5. Add email verification reminder if not confirmed

If tests fail:

1. Note which test failed
2. Check browser console for errors
3. Check Supabase logs
4. Verify database schema matches code
5. Verify trigger is installed and active
