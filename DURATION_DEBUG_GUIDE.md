# 🐛 Duration = 0 Debug Guide

## Problem

Route duration consistently shows "0 min" instead of actual travel time.

## Enhanced Debugging Added

I've added comprehensive logging throughout the route fetching and display process. Here's what to check:

---

## 🔍 Step-by-Step Debugging

### 1. **Open Browser Console** (F12)

### 2. **Click "Show Route" on any doctor**

### 3. **Check Console Logs in This Order:**

#### Step 1: API Response

```
📦 Full API Response: {features: [...]}
```

**What to check:**

- Does the response have `features` array?
- Is there at least one feature?

#### Step 2: Properties Object

```
📋 Properties object: {distance: 7000, time: 900000, ...}
```

**What to check:**

- Is `time` field present?
- What is the value? (should be in milliseconds)
- Alternative fields: `duration`, `time_ms`?

#### Step 3: Time Value

```
⏱️ Time value: 900000
📏 Distance value: 7000
```

**What to check:**

- Is time value a number?
- Is it greater than 0?

#### Step 4: Extracted Data

```
🔍 Extracted route data: {
  rawTime: 900000,
  timeValue: 900000,
  durationMs: 900000,
  durationSeconds: 900,
  durationMinutes: 15,
  distanceMeters: 7000,
  distanceKm: 7
}
```

**What to check:**

- Are all conversions correct?
- `durationSeconds` should be `durationMs / 1000`
- `durationMinutes` should be `durationSeconds / 60`

#### Step 5: Route Fetched

```
✅ Route fetched: {
  distance: "7.00 km",
  duration: "15 min (900s)",
  steps: 11
}
```

**What to check:**

- Duration should show actual minutes
- Should match durationMinutes from Step 4

#### Step 6: Rendering RouteInfo

```
📊 Rendering routeInfo: {
  distance: 7000,
  duration: 900,
  steps: [...]
}
```

**What to check:**

- `duration` should be in seconds
- Should be > 0

#### Step 7: Format Duration

```
🕐 formatDuration called with: 900 seconds
🕐 Formatted: {hours: 0, minutes: 15}
```

**What to check:**

- Is seconds parameter > 0?
- Are hours and minutes calculated correctly?

---

## 🎯 Common Issues & Solutions

### Issue 1: `properties.time` is undefined

**Symptoms:**

```
⏱️ Time value: undefined
🔍 Extracted route data: { durationSeconds: 0 }
```

**Solution:**
The API might use a different field name. Check the full properties object for:

- `duration`
- `time_ms`
- `travel_time`
- `route_duration`

**Fix:**

```typescript
const timeValue =
  properties.time ||
  properties.duration ||
  properties.time_ms ||
  properties.travel_time ||
  0;
```

### Issue 2: Time is in seconds, not milliseconds

**Symptoms:**

```
⏱️ Time value: 900
🔍 Extracted route data: { durationSeconds: 0.9 }
```

**Solution:**
API is returning seconds already, not milliseconds.

**Fix:**

```typescript
// Check if value is reasonable (< 86400 = 1 day in seconds)
const duration = timeValue < 86400 ? timeValue : timeValue / 1000;
```

### Issue 3: Time is nested in legs/steps

**Symptoms:**

```
📋 Properties object: { legs: [{...}] }
⏱️ Time value: undefined
```

**Solution:**
Time might be in `properties.legs[0].time`

**Fix:**

```typescript
const timeValue = properties.time || properties.legs?.[0]?.time || 0;
```

### Issue 4: API returns time in different unit

**Symptoms:**

```
⏱️ Time value: 15.5
🔍 Extracted route data: { durationSeconds: 0.0155 }
```

**Solution:**
API might return time in minutes or hours.

**Fix:**

```typescript
// If value seems like minutes (reasonable range 1-300)
if (timeValue > 0 && timeValue < 300) {
  duration = timeValue * 60; // Convert minutes to seconds
}
```

---

## 🧪 Test Scenarios

### Test 1: Short Distance (< 5 km)

- Expected duration: 5-15 minutes
- Expected value: 300-900 seconds

### Test 2: Medium Distance (5-20 km)

- Expected duration: 15-45 minutes
- Expected value: 900-2700 seconds

### Test 3: Long Distance (> 20 km)

- Expected duration: 45+ minutes
- Expected value: 2700+ seconds

---

## 📋 Debugging Checklist

Run through this checklist:

- [ ] Browser console is open (F12)
- [ ] Cleared previous logs (console.clear())
- [ ] Clicked "Show Route" on a doctor
- [ ] "📦 Full API Response" appears in console
- [ ] Copy the full response and check structure
- [ ] "⏱️ Time value" shows a number > 0
- [ ] "🔍 Extracted route data" shows durationSeconds > 0
- [ ] "🕐 formatDuration called with" shows seconds > 0
- [ ] Duration card shows actual time (not 0 min)
- [ ] Debug "raw" text shows seconds value

---

## 🔧 Quick Fixes to Try

### Fix 1: Check if time is in seconds (not milliseconds)

```typescript
// In MapView.tsx, line ~280
const timeValue = properties.time || 0;
const duration =
  timeValue > 0 && timeValue < 86400 ? timeValue : timeValue / 1000;
```

### Fix 2: Sum up leg times

```typescript
const legs = properties.legs || [];
const totalTime = legs.reduce((sum, leg) => sum + (leg.time || 0), 0);
const duration = totalTime / 1000; // If in milliseconds
```

### Fix 3: Use different API parameter

The Geoapify routing API might need specific parameters:

```typescript
const url = `https://api.geoapify.com/v1/routing
  ?waypoints=${from.lat},${from.lng}|${to.lat},${to.lng}
  &mode=drive
  &details=instruction_details
  &apiKey=${GEOAPIFY_API_KEY}`;
```

---

## 📊 Expected Console Output (Working)

When everything works correctly, you should see:

```
🗺️ Fetching route from Geoapify...
📦 Full API Response: {features: Array(1), type: "FeatureCollection"}
📋 Properties object: {mode: "drive", waypoints: Array(2), distance: 7000, time: 900000, ...}
⏱️ Time value: 900000
📏 Distance value: 7000
🔍 Extracted route data: {
  rawTime: 900000,
  timeValue: 900000,
  durationMs: 900000,
  durationSeconds: 900,
  durationMinutes: 15,
  distanceMeters: 7000,
  distanceKm: 7
}
✅ Route fetched: {distance: "7.00 km", duration: "15 min (900s)", steps: 11}
📊 Rendering routeInfo: {distance: 7000, duration: 900, steps: Array(11)}
🕐 formatDuration called with: 900 seconds
🕐 Formatted: {hours: 0, minutes: 15}
```

And the UI should display: **"15 min"**

---

## 🆘 If Still Showing 0

### Copy & Paste This Info:

1. **Full API Response** (from "📦 Full API Response")
2. **Properties object** (from "📋 Properties object")
3. **Time value** (from "⏱️ Time value")
4. **RouteInfo state** (from "📊 Rendering routeInfo")

### Share:

- Browser & version
- Network tab screenshot of Geoapify API call
- Response tab showing the actual API response

---

## 🎯 Next Steps

1. **Run the app** with all the new logging
2. **Open console** before clicking route
3. **Copy all console output**
4. **Check which step fails**
5. **Apply corresponding fix**

The detailed logging will pinpoint exactly where the issue is!

---

## 📝 Temporary Workaround

If you need a quick fix while debugging, use estimated duration:

```typescript
// In fetchRoute function
if (!duration || duration === 0) {
  // Estimate: 30 km/h average speed in city
  const estimatedDuration = (distance / 1000 / 30) * 3600; // seconds
  console.warn("⚠️ Using estimated duration:", estimatedDuration);
  duration = estimatedDuration;
}
```

This will show approximate times until the API issue is resolved.
