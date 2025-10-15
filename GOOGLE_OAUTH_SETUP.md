# Google OAuth Setup Guide

This guide will help you configure Google OAuth authentication for your AYUSH ONE application.

## Prerequisites

- Google Cloud Console account
- Supabase project

## Step 1: Set up Google OAuth in Google Cloud Console

1. **Go to Google Cloud Console**

   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a new project (or select existing)**

   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it "AYUSH ONE" or similar
   - Click "Create"

3. **Enable Google+ API**

   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. **Configure OAuth Consent Screen**

   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type
   - Click "Create"
   - Fill in the required information:
     - App name: "AYUSH ONE"
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Skip the "Scopes" section (click "Save and Continue")
   - Add test users if needed
   - Click "Save and Continue"

5. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS"
   - Select "OAuth client ID"
   - Application type: "Web application"
   - Name: "AYUSH ONE Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production URL (e.g., `https://yourdomain.com`)
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (for development)
     - `https://yourdomain.com/auth/callback` (for production)
   - Click "Create"
   - **IMPORTANT**: Copy the Client ID and Client Secret

## Step 2: Configure Supabase

1. **Go to your Supabase Dashboard**

   - Visit: https://app.supabase.com/
   - Select your project

2. **Enable Google Provider**

   - Go to "Authentication" > "Providers"
   - Find "Google" in the list
   - Toggle it to "Enabled"
   - Paste your Google Client ID
   - Paste your Google Client Secret
   - Click "Save"

3. **Add the callback URL to your Google OAuth settings**
   - Supabase will show you a callback URL like:
     `https://your-project-ref.supabase.co/auth/v1/callback`
   - Go back to Google Cloud Console
   - Edit your OAuth client
   - Add this Supabase callback URL to "Authorized redirect URIs"
   - Click "Save"

## Step 3: Update Database Schema (if needed)

The database trigger should automatically create user profiles for OAuth users. If you need to update the trigger:

```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    COALESCE(new.raw_user_meta_data->>'role', 'citizen'),
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 4: Test the Integration

1. **Start your development server**

   ```bash
   npm run dev
   ```

2. **Test Sign In with Google**

   - Go to http://localhost:3000/auth/signin
   - Click "Continue with Google"
   - Sign in with a Google account
   - You should be redirected back to the home page
   - Check your Supabase database to verify the user was created

3. **Test Sign Up with Google**
   - Go to http://localhost:3000/auth/signup
   - Select your role (Doctor or Citizen)
   - Click "Continue with Google"
   - Sign in with a Google account
   - You should be redirected to the appropriate page

## Troubleshooting

### Issue: "Access blocked: This app's request is invalid"

**Solution**: Make sure your OAuth consent screen is properly configured and published.

### Issue: "redirect_uri_mismatch"

**Solution**:

- Check that all callback URLs are properly added in Google Cloud Console
- Make sure there are no typos
- Include both development and production URLs

### Issue: User profile not created

**Solution**:

- Check the database trigger is active
- Verify the callback route is working (`/auth/callback/route.ts`)
- Check browser console and server logs for errors

### Issue: "Invalid OAuth client"

**Solution**:

- Verify Client ID and Client Secret in Supabase are correct
- Make sure the Google OAuth client is enabled
- Check that you've enabled the Google+ API

## Security Best Practices

1. **Never commit credentials**

   - Client ID and Secret should only be in Supabase dashboard
   - Never add them to your code or `.env` files that get committed

2. **Use HTTPS in production**

   - Always use HTTPS for production URLs
   - Update redirect URIs to use HTTPS

3. **Verify users**

   - Implement email verification if needed
   - Add additional security checks for sensitive operations

4. **Rate limiting**
   - Consider implementing rate limiting for authentication endpoints
   - Monitor for suspicious activity

## Features Implemented

✅ **Sign In with Google** - Users can sign in using their Google account
✅ **Sign Up with Google** - New users can create accounts via Google OAuth
✅ **Automatic Profile Creation** - User profiles are created automatically after OAuth
✅ **Role Selection** - Users can select their role (Doctor/Citizen) before Google signup
✅ **Seamless Integration** - OAuth works alongside traditional email/password authentication
✅ **Beautiful UI** - Google button with official branding and loading states
✅ **Error Handling** - Comprehensive error messages for various OAuth scenarios

## Next Steps

- Add additional OAuth providers (Facebook, Apple, etc.)
- Implement email verification for OAuth users
- Add profile completion flow for OAuth users
- Customize OAuth metadata (avatar, additional fields)
- Add analytics for OAuth conversion tracking

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check server logs for backend errors
3. Verify all configuration steps were completed
4. Review Supabase Auth logs in the dashboard
