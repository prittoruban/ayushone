# AYUSH ONE - Hackathon MVP

A Next.js application connecting patients with verified AYUSH doctors for online consultations.

## 🎯 Features

### Doctor Flow
- ✅ Sign up with doctor role
- ✅ Create/update profile with specialty & city
- ✅ Upload license document
- ✅ Auto-verification (demo mode)
- ✅ Appear in search with verified badge

### Citizen Flow
- ✅ Sign up with citizen role
- ✅ Search doctors by specialty & city
- ✅ View verified doctors
- ✅ Book appointments
- ✅ Video consultation with Jitsi

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Video**: Jitsi Meet
- **Deployment**: Ready for Vercel

## 🚀 Quick Setup

### 1. Clone and Install
```bash
npm install
```

### 2. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si
```

### 3. Set up Database
1. Go to Supabase SQL Editor
2. Run the schema from `supabase/schema.sql`
3. Optionally run seed data from `supabase/seed.sql`

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Database Schema

### Users Table
- Extends Supabase auth.users
- Stores name, email, role (doctor/citizen)

### Doctors Table
- Doctor profiles with specialty, city
- License URL and verification status
- Links to users table

### Appointments Table
- Appointment bookings between citizens and doctors
- Includes Jitsi room ID for video calls
- Status tracking (pending, confirmed, completed, cancelled)

## 🔐 Authentication

Using Supabase Auth with Row Level Security (RLS) policies:
- Users can only view/edit their own data
- Doctors appear in public search when verified
- Appointment access restricted to participants

## 📱 Key Pages

- `/` - Landing page with features overview
- `/auth/signup` - User registration with role selection
- `/auth/signin` - User login
- `/doctors` - Search and browse verified doctors
- `/doctor/profile` - Doctor profile management & license upload
- `/appointments/book` - Appointment booking form
- `/appointments/[id]` - Appointment details with Jitsi integration
- `/appointments` - User's appointments list

## 🎥 Video Consultation

Integrated with Jitsi Meet for secure video consultations:
- Unique room ID generated for each appointment
- Join link available 15 minutes before appointment
- No additional setup required - works in browser

## 🚀 Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si
```

## 🔧 API Endpoints

- `GET /api/doctors` - Search doctors with filters
- `POST /api/doctors` - Create/update doctor profile
- `POST /api/doctors/upload` - Upload license & verify
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Book new appointment
- `GET /api/appointments/[id]` - Get appointment details

## 🎮 Demo Features

- Auto-verification for uploaded licenses (production would have manual review)
- Pre-seeded specialties and cities
- Immediate appointment confirmation
- Test video rooms work without registration

## 📝 Next Steps

For production deployment:
- Implement manual license verification workflow
- Add payment integration
- Email notifications for appointments
- Advanced search filters
- Doctor availability calendar
- Prescription management
- Medical records integration

## 👥 Team

Built for AYUSH ONE Hackathon - connecting traditional medicine practitioners with patients through technology.

---

**Note**: This is a hackathon MVP focused on core functionality. Some features are simplified for demo purposes.
