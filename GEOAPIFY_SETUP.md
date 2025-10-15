# 🔑 Quick Start: Get Your Geoapify API Key

## Why Geoapify?

- ✅ **Free Tier**: 3,000 API calls per day
- ✅ **No Credit Card**: Required for sign up
- ✅ **Routing API**: Included in free tier
- ✅ **Easy Setup**: Get key in 2 minutes

## Step-by-Step Guide

### 1. Sign Up

1. Go to: **https://www.geoapify.com/**
2. Click **"Get Started Free"** or **"Sign Up"**
3. Enter your email and create a password
4. Verify your email address

### 2. Create a Project

1. After logging in, you'll see the dashboard
2. Click **"Create a new project"** or use the default project
3. Give it a name like "AYUSH ONE Map Feature"

### 3. Get Your API Key

1. In your project, you'll see an **API Key** section
2. Your key will look like: `abcd1234efgh5678ijkl9012mnop3456`
3. Click the **Copy** button to copy your key

### 4. Add to Your Project

1. Open `.env.local` in your project
2. Find the line:
   ```bash
   NEXT_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_api_key_here
   ```
3. Replace `your_geoapify_api_key_here` with your actual key:
   ```bash
   NEXT_PUBLIC_GEOAPIFY_API_KEY=abcd1234efgh5678ijkl9012mnop3456
   ```
4. Save the file

### 5. Restart Your Server

```bash
# Stop the dev server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ Verify It's Working

1. Go to **http://localhost:3000/map**
2. Click on a doctor marker
3. Click **"Show Route"**
4. If you see a route drawn on the map → **Success!** ✅
5. If you see a straight line → Check API key and console errors

## 🆓 Free Tier Limits

| Feature          | Limit         |
| ---------------- | ------------- |
| API Calls        | 3,000 per day |
| Routing Requests | Included      |
| Maps API         | Included      |
| Geocoding        | Included      |
| Cost             | $0            |

**Note**: For hackathon/demo purposes, 3,000 calls per day is more than enough!

## 🔒 Security Note

⚠️ **Important**: The API key in `.env.local` should NOT be committed to public GitHub repositories.

- ✅ `.env.local` is already in `.gitignore`
- ✅ The `NEXT_PUBLIC_` prefix makes it available in the browser
- ✅ This is safe for client-side usage
- ✅ Geoapify keys are domain-restricted for security

## 🐛 Troubleshooting

### "Invalid API key" error

- Double-check you copied the entire key
- Make sure there are no spaces before/after the key
- Verify the environment variable name is correct

### Route not showing

- Check browser console for errors
- Verify API key is active in Geoapify dashboard
- Check you haven't exceeded the daily limit

### Server not picking up new key

- Restart the development server
- Clear the `.next` cache folder
- Check the key is on the correct line in `.env.local`

## 📱 Alternative: Use Demo Mode

If you don't want to set up Geoapify, the map will still work with a fallback:

- Routes will be shown as straight lines instead of actual roads
- All other features work normally
- Good for testing the basic functionality

## 🎯 Quick Test

Run this in your browser console on the map page:

```javascript
console.log(process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY);
```

- If it shows your key → ✅ Configured correctly
- If it shows `undefined` → ❌ Restart server or check .env.local

---

**Time to complete**: 2-5 minutes  
**Difficulty**: Easy ⭐  
**Cost**: Free 💰
