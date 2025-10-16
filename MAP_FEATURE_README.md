# Map Feature Setup Guide

This guide explains how to set up and use the doctor location map feature in AYUSH ONE.

## Features Implemented

✅ **Location Column in Database**: Added `location` JSONB column to the `doctors` table  
✅ **GPS Location Capture**: Doctors can save their current GPS location from their profile  
✅ **Interactive Map**: Display all doctors with location data as markers on a map  
✅ **Doctor Information Popup**: Click markers to view doctor details  
✅ **Route Planning**: Show routes from user location to selected doctor using Geoapify API  
✅ **User Location**: Button to center map on user's current location

## Setup Instructions

### 1. Database Migration

Run the migration SQL in your Supabase SQL Editor:

```sql
-- Add location column to doctors table
ALTER TABLE public.doctors
ADD COLUMN IF NOT EXISTS location jsonb;

-- Add comment to describe the column format
COMMENT ON COLUMN public.doctors.location IS 'GPS coordinates stored as JSON: { "lat": number, "lng": number }';
```

The migration file is located at: `supabase/migration_add_location.sql`

### 2. Get Geoapify API Key

1. Go to [Geoapify.com](https://www.geoapify.com/)
2. Sign up for a free account
3. Create a new project and get your API key
4. The free tier includes:
   - 3,000 API calls per day
   - Routing API access
   - No credit card required

### 3. Configure Environment Variables

Add your Geoapify API key to `.env.local`:

```bash
NEXT_PUBLIC_GEOAPIFY_API_KEY=your_actual_geoapify_api_key_here
```

### 4. Install Dependencies

The following packages have been installed:

- `leaflet` - Open-source mapping library
- `react-leaflet` - React components for Leaflet
- `@types/leaflet` - TypeScript definitions

If you need to reinstall:

```bash
npm install leaflet react-leaflet @types/leaflet
```

## How to Use

### For Doctors

1. **Sign in** as a doctor
2. **Go to "My Profile"** from the navigation menu
3. **Complete your profile** information (specialty, city, etc.)
4. **Click "Use My Location"** button in the Location section
   - Allow browser to access your location when prompted
   - Your GPS coordinates will be captured
5. **Click "Save Profile"** to save your location to the database
6. Your location will now appear on the map for patients to see

### For Patients/Users

1. **Navigate to "Doctor Map"** from the main navigation
2. **View all doctors** displayed as red markers on the map
3. **Click "My Location"** button to:
   - Center the map on your current position (blue marker)
   - Enable location-based features
4. **Click on any doctor marker** to:
   - View their profile information in a popup
   - See their specialty, experience, languages, etc.
5. **Click "Show Route"** in the popup to:
   - Display the optimal route from your location to the doctor
   - View the path highlighted on the map
6. **Click the X** on the route indicator to clear the route

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── doctors/
│   │       └── route.ts                 # Updated to handle location data
│   ├── doctor/
│   │   └── profile/
│   │       └── page.tsx                 # Updated with "Use Location" button
│   └── map/
│       └── page.tsx                     # New map page
├── components/
│   ├── MapView.tsx                      # New map component
│   └── Navbar.tsx                       # Updated with map link
supabase/
├── schema.sql                           # Updated with location column
└── migration_add_location.sql           # Migration script
```

## API Updates

### GET /api/doctors

Now includes `location` field in the response:

```json
{
  "id": "...",
  "specialty": "Ayurveda",
  "city": "Mumbai",
  "location": {
    "lat": 19.0760,
    "lng": 72.8777
  },
  ...
}
```

### POST /api/doctors

Now accepts optional `location` field:

```json
{
  "user_id": "...",
  "specialty": "Ayurveda",
  "city": "Mumbai",
  "location": {
    "lat": 19.0760,
    "lng": 72.8777
  },
  ...
}
```

## Routing API

The map uses **Geoapify Routing API** for:

- Calculating optimal routes between two points
- Driving mode routing
- Fallback to straight lines if API fails

API endpoint used:

```
https://api.geoapify.com/v1/routing?waypoints=lat1,lng1|lat2,lng2&mode=drive&apiKey=YOUR_KEY
```

## Browser Permissions

Users need to grant location permissions in their browser:

- Chrome: Click the lock icon in the address bar → Site settings → Location → Allow
- Firefox: Click the shield icon → Permissions → Location → Allow
- Safari: Settings → Privacy → Location Services → Enable for the website

## Troubleshooting

### Map not loading

- Check that you're not in Safari with strict privacy settings
- Ensure JavaScript is enabled
- Check browser console for errors

### Location not working

- Verify browser has location permissions
- Check if HTTPS is enabled (required for geolocation API)
- Ensure GPS is enabled on the device

### Route not displaying

- Verify GEOAPIFY_API_KEY is set correctly in `.env.local`
- Check browser console for API errors
- Ensure you haven't exceeded the free tier limit (3,000 calls/day)
- Fallback: A straight line will be shown if API fails

### Markers not showing

- Verify doctors have saved their location data
- Check database: `SELECT id, location FROM doctors WHERE location IS NOT NULL;`
- Ensure the doctor's `verified_badge` is set to `true`

## Technical Details

### Map Library

- **Leaflet**: Industry-standard open-source mapping library
- **React-Leaflet**: React wrapper for Leaflet
- **OpenStreetMap**: Free tile provider for base maps

### Geolocation API

- Uses browser's native `navigator.geolocation` API
- Requires HTTPS (or localhost for development)
- Accuracy depends on device GPS capabilities

### Data Storage

- Location stored as JSONB in PostgreSQL
- Format: `{ "lat": number, "lng": number }`
- Allows efficient querying and indexing

## Future Enhancements

Potential improvements for the map feature:

- [ ] Distance calculation and sorting
- [ ] Clustering for many nearby doctors
- [ ] Search/filter doctors directly on the map
- [ ] Turn-by-turn directions
- [ ] Estimated travel time
- [ ] Multiple transportation modes (walking, transit)
- [ ] Save favorite doctors/locations
- [ ] Offline map caching

## Support

For issues or questions:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure database migrations have been run
4. Check that location permissions are granted

---

**Note**: Remember to replace `your_geoapify_api_key_here` in `.env.local` with your actual API key from Geoapify before testing the routing feature.
