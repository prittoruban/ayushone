-- Drop existing tables safely (optional for reset)
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ======================
-- 1️⃣ USERS TABLE
-- ======================
CREATE TABLE public.users (
  id uuid NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('doctor', 'citizen')),
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- ======================
-- 2️⃣ DOCTORS TABLE
-- ======================
CREATE TABLE public.doctors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  specialty text NOT NULL,
  city text NOT NULL,
  license_number text,
  license_url text,
  experience_years integer DEFAULT 0,
  languages text[],
  location jsonb, -- { lat: number, lng: number }
  verified_badge boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT doctors_pkey PRIMARY KEY (id),
  CONSTRAINT doctors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- ======================
-- 3️⃣ APPOINTMENTS TABLE
-- ======================
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  citizen_id uuid,
  doctor_id uuid,
  scheduled_at timestamp with time zone NOT NULL,
  mode text DEFAULT 'online' CHECK (mode IN ('online', 'offline')),
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  jitsi_room_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_citizen_id_fkey FOREIGN KEY (citizen_id) REFERENCES public.users(id),
  CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id)
);

-- ======================
-- 4️⃣ NOTIFICATIONS TABLE
-- ======================
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'appointment')),
  is_read boolean DEFAULT false,
  appointment_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT notifications_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id)
);

-- ======================
-- 5️⃣ REVIEWS TABLE
-- ======================
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  appointment_id uuid UNIQUE,
  citizen_id uuid,
  doctor_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
  CONSTRAINT reviews_citizen_id_fkey FOREIGN KEY (citizen_id) REFERENCES public.users(id),
  CONSTRAINT reviews_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id)
);
