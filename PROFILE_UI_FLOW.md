# User Profile - Visual UI Flow

## 🎨 Complete User Interface Journey

### 1️⃣ Navigation - Profile Access

```
┌─────────────────────────────────────────────────┐
│  AYUSH ONE        [Find Doctors] [Map] [Login]  │
└─────────────────────────────────────────────────┘
                                               ▲
                                               │
                                    When Logged In ▼

┌─────────────────────────────────────────────────┐
│  AYUSH ONE    [Doctors] [Map]   [JD ▼]         │
└─────────────────────────────────────────────────┘
                                     │
                          Click Opens ▼
                    ┌────────────────────────┐
                    │ John Doe               │
                    │ +1 234 567 8900        │
                    ├────────────────────────┤
                    │ 👤 My Profile     ◄────┼─── NEW!
                    │ ⚙️  Doctor Profile     │
                    │ 📅 My Appointments     │
                    │ 🚪 Sign Out            │
                    └────────────────────────┘
```

### 2️⃣ Google OAuth Flow

```
┌──────────────────┐
│ Sign in with     │
│    Google        │ ──► Google Auth Page
└──────────────────┘          │
                              ▼
                    User Authorizes App
                              │
                              ▼
                    ┌──────────────────┐
                    │ Check Profile    │
                    │ Exists?          │
                    └──────────────────┘
                         │           │
                 New User│           │Existing User
                         ▼           ▼
            /profile?new=true    /profile
                         │           │
                         ▼           ▼
                [Welcome Screen] [Edit Form]
```

### 3️⃣ Profile Page Layout

```
┌───────────────────────────────────────────────────────┐
│                   AYUSH ONE                           │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Complete Your Profile                                │
│  Welcome! Please complete your profile...             │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ ┌─────────────┐                                 │ │
│  │ │     👤      │  ◄─── Avatar                    │ │
│  │ │             │       (Click camera to upload)  │ │
│  │ └─────────────┘                                 │ │
│  │        📷                                        │ │
│  │                                                  │ │
│  │ ┌─────────────────┐  ┌─────────────────┐       │ │
│  │ │ Full Name *     │  │ Email (locked)  │       │ │
│  │ │ John Doe        │  │ john@gmail.com  │       │ │
│  │ └─────────────────┘  └─────────────────┘       │ │
│  │                                                  │ │
│  │ ┌─────────────────┐  ┌─────────────────┐       │ │
│  │ │ Phone Number    │  │ Date of Birth   │       │ │
│  │ │ +1 234 567 8900 │  │ 1990-01-01      │       │ │
│  │ └─────────────────┘  └─────────────────┘       │ │
│  │                                                  │ │
│  │ ┌─────────────────┐  ┌─────────────────┐       │ │
│  │ │ Gender ▼        │  │ City            │       │ │
│  │ │ Male            │  │ New York        │       │ │
│  │ └─────────────────┘  └─────────────────┘       │ │
│  │                                                  │ │
│  │ ┌───────────────────────────────────────┐       │ │
│  │ │ Address                               │       │ │
│  │ │ 123 Main Street                       │       │ │
│  │ └───────────────────────────────────────┘       │ │
│  │                                                  │ │
│  │ ┌───────────────────────────────────────┐       │ │
│  │ │ Country                               │       │ │
│  │ │ United States                         │       │ │
│  │ └───────────────────────────────────────┘       │ │
│  │                                                  │ │
│  │ ┌───────────────────────────────────────┐       │ │
│  │ │ Bio                                   │       │ │
│  │ │ Tell us about yourself...             │       │ │
│  │ │                                       │       │ │
│  │ └───────────────────────────────────────┘       │ │
│  │                                                  │ │
│  │ ┌─────────────────────────────────────┐         │ │
│  │ │ Account Type: Citizen               │         │ │
│  │ │ To change, contact support          │         │ │
│  │ └─────────────────────────────────────┘         │ │
│  │                                                  │ │
│  │ ┌──────────────────┐  ┌──────────────┐         │ │
│  │ │ 💾 Save Changes  │  │   Cancel     │         │ │
│  │ └──────────────────┘  └──────────────┘         │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### 4️⃣ Avatar Upload Process

```
Step 1: Initial State
┌──────────────┐
│      👤      │  ◄── Default icon or current avatar
│              │
└──────────────┘
      📷         ◄── Camera icon to upload


Step 2: Click Camera Icon
┌──────────────┐
│   File       │
│   Picker     │  ◄── Browser file selection opens
│   Dialog     │
└──────────────┘


Step 3: Select Image
┌──────────────┐
│   [Image     │
│   Preview]   │  ◄── Real-time preview appears
│              │
└──────────────┘
      📷
Preview before save!


Step 4: Save Form
┌──────────────┐
│   [Saved     │
│   Avatar]    │  ◄── Image uploaded to Supabase Storage
│              │      URL saved to database
└──────────────┘
```

### 5️⃣ Success & Error States

**Success Message:**

```
┌─────────────────────────────────────────────┐
│ ✅ Profile updated successfully!            │
│    Redirecting to homepage...               │
└─────────────────────────────────────────────┘
```

**Error Message:**

```
┌─────────────────────────────────────────────┐
│ ❌ Failed to update profile                 │
│    Please try again later                   │
└─────────────────────────────────────────────┘
```

**Loading State:**

```
┌──────────────────┐
│ 🔄 Saving...     │  ◄── Button disabled, spinner visible
└──────────────────┘
```

### 6️⃣ Welcome Screen (New Users)

```
┌───────────────────────────────────────────────────────┐
│  [Profile Form Above]                                 │
├───────────────────────────────────────────────────────┤
│  Welcome to Our Platform! 🎉                          │
│                                                       │
│  ✓ Your email has been verified via Google           │
│  ✓ Complete your profile to access all features      │
│  ✓ You can update your information anytime           │
└───────────────────────────────────────────────────────┘
```

### 7️⃣ Mobile View

```
┌─────────────────────┐
│  ≡  AYUSH ONE   [JD]│
├─────────────────────┤
│                     │
│ Complete Your       │
│ Profile             │
│                     │
│  ┌────────────┐     │
│  │    👤      │     │
│  └────────────┘     │
│      📷            │
│                     │
│ ┌─────────────────┐ │
│ │ Full Name *     │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Email (locked)  │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Phone           │ │
│ └─────────────────┘ │
│                     │
│ [More fields...]    │
│                     │
│ ┌─────────────────┐ │
│ │ Save Changes    │ │
│ └─────────────────┘ │
└─────────────────────┘
```

### 8️⃣ Dark Mode

```
┌───────────────────────────────────────────────────────┐
│            🌙 AYUSH ONE (Dark Mode)                   │
├───────────────────────────────────────────────────────┤
│  [Dark background with light text]                    │
│                                                       │
│  Edit Your Profile                                    │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Dark slate background, white/gray text          │ │
│  │                                                  │ │
│  │ Form fields with dark styling                   │ │
│  │ Blue accent colors remain vibrant               │ │
│  │                                                  │ │
│  │ ┌──────────────────┐                            │ │
│  │ │ Blue Button      │  ◄── Gradient maintained   │ │
│  │ └──────────────────┘                            │ │
│  └─────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Light Mode

- **Background:** Blue-purple gradient (from-blue-50 to-purple-50)
- **Cards:** White with subtle shadow
- **Text:** Slate-900 (dark)
- **Accents:** Blue-600, Purple-600
- **Success:** Green-600
- **Error:** Red-600

### Dark Mode

- **Background:** Slate gradient (from-slate-900 to-slate-900)
- **Cards:** Slate-800 with border
- **Text:** White/Slate-300
- **Accents:** Blue-500, Purple-500
- **Success:** Green-400
- **Error:** Red-400

## 📱 Responsive Breakpoints

```
Mobile (< 640px)
├── Single column layout
├── Stacked form fields
├── Full-width buttons
└── Hamburger menu

Tablet (640px - 1024px)
├── Two-column form grid
├── Side-by-side fields
├── Larger avatar
└── Expanded navbar

Desktop (> 1024px)
├── Max-width container (4xl)
├── Optimal form spacing
├── Dropdown menus
└── Full navigation visible
```

## 🔤 Typography

```
Headers (Profile Title)
├── Size: 4xl (36px)
├── Weight: Bold
└── Gradient text effect

Subheaders (Section titles)
├── Size: lg (18px)
├── Weight: Semibold
└── Slate color

Body (Form labels)
├── Size: sm (14px)
├── Weight: Medium
└── Slate-700

Helper Text
├── Size: xs (12px)
├── Weight: Normal
└── Slate-500
```

## 🎭 Interactive Elements

### Buttons

```
Primary (Save)
┌──────────────────┐
│ 💾 Save Changes  │  ◄── Blue gradient, white text
└──────────────────┘     Shadow on hover

Secondary (Cancel)
┌──────────────────┐
│    Cancel        │  ◄── Outlined, slate color
└──────────────────┘     Filled on hover
```

### Form Fields

```
Active State
┌─────────────────────────┐
│ 👤 John Doe            │  ◄── Blue ring on focus
└─────────────────────────┘

Disabled State
┌─────────────────────────┐
│ 📧 email@example.com   │  ◄── Gray background
└─────────────────────────┘     Cursor not-allowed
```

### Dropdown Menu

```
Closed
┌────────────┐
│ JD ▼       │
└────────────┘

Opened (with animation)
┌────────────┐
│ JD ▼       │
└────────────┘
    │
    └──────────────────┐
    ┌──────────────────▼─┐
    │ 👤 My Profile      │  ◄── Slide down animation
    │ ⚙️  Doctor Profile │      Fade in effect
    │ 📅 Appointments    │
    │ 🚪 Sign Out        │
    └────────────────────┘
```

## 🔄 State Transitions

### Page Load

```
Loading
↓
┌──────────────┐
│   Spinner    │  ◄── 2 seconds max
└──────────────┘
↓
Profile Form Appears
```

### Form Submission

```
Idle → Click Save → Validating → Uploading Avatar → Updating DB → Success/Error
  │        │            │              │                │              │
  ▼        ▼            ▼              ▼                ▼              ▼
Normal   Disabled   Spinner      Progress Bar      Check DB      Message
Button   Button    Visible                                        Shown
```

### Avatar Upload

```
No Avatar → Select File → Preview → Save → Uploaded
    │            │           │        │         │
    👤      File Picker   [Image]   API    ✅ Saved
                                   Call
```

## 🎯 User Feedback Points

1. **On Page Load:** Spinner if auth loading
2. **Email Field:** Tooltip explaining it's locked
3. **Avatar Upload:** Preview before save
4. **Form Validation:** Red borders on invalid fields
5. **Submit Button:** Loading spinner + disabled state
6. **Success:** Green alert + auto-dismiss
7. **Error:** Red alert with helpful message
8. **New Users:** Welcome banner with checkmarks

## 📊 Visual Hierarchy

```
Level 1 (Most Important)
├── Page Title: "Complete Your Profile"
├── Avatar Upload Area
└── Save Button

Level 2 (Secondary)
├── Form Field Labels
├── Success/Error Messages
└── Account Type Badge

Level 3 (Tertiary)
├── Helper Text
├── Field Icons
└── Welcome Banner (new users)

Level 4 (Least Important)
├── Cancel Button
└── Footer Text
```

---

**Design System:** Tailwind CSS + Custom Gradients
**Accessibility:** WCAG 2.1 AA Compliant
**Animation:** Subtle transitions (200-300ms)
**Icons:** Lucide React (consistent 5x5 size)
