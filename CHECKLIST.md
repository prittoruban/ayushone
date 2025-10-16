# ✅ Map Feature Implementation Checklist

Use this checklist to verify that all components of the map feature are properly set up and working.

## 📁 Files Checklist

### Created Files

- [x] `src/app/map/page.tsx` - Map page component
- [x] `src/components/MapView.tsx` - Interactive map component
- [x] `supabase/migration_add_location.sql` - Database migration script
- [x] `MAP_FEATURE_README.md` - User documentation
- [x] `IMPLEMENTATION_SUMMARY.md` - Technical summary
- [x] `GEOAPIFY_SETUP.md` - API key setup guide
- [x] `CHECKLIST.md` - This file

### Modified Files

- [x] `supabase/schema.sql` - Added location column
- [x] `src/app/api/doctors/route.ts` - Location API handling
- [x] `src/app/doctor/profile/page.tsx` - Location capture UI
- [x] `src/components/Navbar.tsx` - Added map link
- [x] `src/lib/database.types.ts` - Added location types
- [x] `.env.local` - Added Geoapify API key placeholder
- [x] `package.json` - Added Leaflet dependencies

## 🗄️ Database Setup

- [ ] Run migration in Supabase SQL Editor:
  ```sql
  ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS location jsonb;
  ```
- [ ] Verify column was added:
  ```sql
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'doctors' AND column_name = 'location';
  ```
- [ ] Check existing data:
  ```sql
  SELECT id, user_id, location FROM doctors LIMIT 5;
  ```

## 🔑 API Configuration

- [ ] Sign up at https://www.geoapify.com/
- [ ] Create a project
- [ ] Copy your API key
- [ ] Add to `.env.local`:
  ```bash
  NEXT_PUBLIC_GEOAPIFY_API_KEY=your_actual_key_here
  ```
- [ ] Verify key format (should be alphanumeric, no spaces)

## 📦 Dependencies

- [ ] Installed `leaflet`:
  ```bash
  npm list leaflet
  ```
- [ ] Installed `react-leaflet`:
  ```bash
  npm list react-leaflet
  ```
- [ ] Installed `@types/leaflet`:
  ```bash
  npm list @types/leaflet
  ```
- [ ] If missing, install:
  ```bash
  npm install leaflet react-leaflet @types/leaflet
  ```

## 🖥️ Development Server

- [ ] Restart dev server:
  ```bash
  npm run dev
  ```
- [ ] Server running without errors
- [ ] No TypeScript compilation errors
- [ ] Check terminal for warnings

## 🧪 Testing - Doctor Flow

### Doctor Profile Page

- [ ] Navigate to `/doctor/profile`
- [ ] Sign in as a doctor account
- [ ] Page loads without errors
- [ ] "Use My Location" button visible
- [ ] Click "Use My Location" button
- [ ] Browser requests location permission
- [ ] Grant permission
- [ ] Coordinates appear below button
- [ ] Coordinates format: `lat.######, lng.######`
- [ ] Fill in other profile fields
- [ ] Click "Save Profile"
- [ ] Success message appears
- [ ] Check browser console - no errors

### Verify in Database

- [ ] Open Supabase Dashboard
- [ ] Go to Table Editor → doctors
- [ ] Find your doctor record
- [ ] Location column contains: `{"lat": ##.####, "lng": ##.####}`
- [ ] verified_badge is `true`

## 🧪 Testing - Map Page

### Basic Map Display

- [ ] Navigate to `/map`
- [ ] Page loads without errors
- [ ] Map container visible
- [ ] OpenStreetMap tiles loading
- [ ] Stats cards show correct numbers
- [ ] "My Location" button visible

### Doctor Markers

- [ ] Red markers appear for doctors with locations
- [ ] Marker count matches "Doctors on Map" stat
- [ ] Click a doctor marker
- [ ] Popup appears with doctor info
- [ ] Popup shows: name, specialty, city, experience, languages
- [ ] "✓ Verified" badge visible
- [ ] "Show Route" button visible in popup

### User Location

- [ ] Click "My Location" button
- [ ] Browser requests location permission
- [ ] Grant permission
- [ ] Blue marker appears at your location
- [ ] Map centers on your location
- [ ] "Your Location" stat shows "Enabled"

### Route Display

- [ ] Ensure both user location and doctor marker visible
- [ ] Click doctor marker
- [ ] Click "Show Route" in popup
- [ ] Route appears on map (blue line)
- [ ] Route follows roads (if API key configured)
  - OR shows straight line (if no API key)
- [ ] Route indicator box appears top-right
- [ ] Click X to clear route
- [ ] Route disappears
- [ ] Map still functional

## 🧪 Testing - Navigation

- [ ] Navbar shows "Doctor Map" link
- [ ] MapPin icon visible next to link
- [ ] Click "Doctor Map" link
- [ ] Navigates to `/map` page
- [ ] Back button works correctly
- [ ] Can navigate to other pages and back to map

## 📱 Mobile Testing

- [ ] Open on mobile device or responsive mode
- [ ] Map displays correctly
- [ ] Touch zoom works
- [ ] Pinch zoom works
- [ ] Markers tappable
- [ ] Popups readable
- [ ] Buttons clickable
- [ ] Navigation drawer works (if applicable)

## 🔍 Browser Console Checks

### No Errors For:

- [ ] Leaflet loading
- [ ] React-Leaflet components
- [ ] Geolocation API
- [ ] Fetch requests to /api/doctors
- [ ] Geoapify API calls
- [ ] Map tile loading

### Expected Warnings (OK to ignore):

- [ ] Next.js workspace root warnings
- [ ] Development mode warnings

## 🔒 Security Checks

- [ ] `.env.local` not committed to git
- [ ] Geoapify API key not visible in client source
- [ ] Location permissions requested properly
- [ ] No sensitive data in browser console
- [ ] API endpoints secured (if needed)

## 🎨 UI/UX Checks

- [ ] Map fills container properly
- [ ] Zoom controls visible and working
- [ ] Attribution visible at bottom-right
- [ ] Markers have proper icons
- [ ] Popups styled correctly
- [ ] Buttons have hover states
- [ ] Loading states shown where appropriate
- [ ] Error messages user-friendly
- [ ] Responsive on different screen sizes

## 📊 Performance Checks

- [ ] Map loads in < 3 seconds
- [ ] Markers render smoothly
- [ ] Route calculation completes quickly
- [ ] No lag when panning map
- [ ] Zoom is smooth
- [ ] Memory usage reasonable
- [ ] No infinite re-renders

## 🐛 Error Scenarios

### Test these scenarios:

- [ ] Deny location permission
  - Error message shows
  - App still functional
  - Map shows default location
- [ ] No Geoapify API key
  - Route shows as straight line
  - Warning in console (expected)
  - App doesn't crash
- [ ] Doctor has no location
  - Doctor doesn't appear on map
  - Shows in regular doctors list
  - No console errors
- [ ] Slow internet connection
  - Loading spinners appear
  - Map tiles load progressively
  - No timeout errors
- [ ] Invalid coordinates
  - Handled gracefully
  - Default map view shown
  - Error logged to console

## 📝 Documentation Checks

- [ ] `MAP_FEATURE_README.md` is comprehensive
- [ ] `GEOAPIFY_SETUP.md` has clear steps
- [ ] `IMPLEMENTATION_SUMMARY.md` is accurate
- [ ] Code comments are clear
- [ ] API endpoints documented
- [ ] Environment variables documented

## 🚀 Deployment Readiness

- [ ] All tests passing
- [ ] No console errors in production mode
- [ ] Environment variables set on hosting platform
- [ ] Database migrations run on production
- [ ] API keys configured for production domain
- [ ] HTTPS enabled (required for geolocation)
- [ ] Performance optimized
- [ ] Error tracking configured (optional)

## ✨ Final Verification

Run through this complete user journey:

1. [ ] Sign in as doctor
2. [ ] Go to profile
3. [ ] Click "Use My Location"
4. [ ] Grant permission
5. [ ] See coordinates
6. [ ] Save profile
7. [ ] Navigate to map page
8. [ ] See yourself as marker
9. [ ] Sign out
10. [ ] Sign in as patient/citizen
11. [ ] Go to map page
12. [ ] Click "My Location"
13. [ ] See blue marker
14. [ ] Click doctor marker
15. [ ] View doctor details
16. [ ] Click "Show Route"
17. [ ] See route displayed
18. [ ] Clear route
19. [ ] Test on mobile
20. [ ] Everything works! 🎉

## 📞 Support

If any checklist item fails:

1. Check browser console for errors
2. Review relevant documentation file
3. Verify environment variables
4. Restart development server
5. Clear browser cache
6. Check database connection

---

**Status**: Use this checklist before marking feature as complete  
**Last Updated**: October 15, 2025  
**Version**: 1.0
