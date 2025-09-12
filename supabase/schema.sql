-- ========================================
-- USERS (extends auth.users)
-- ========================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'citizen')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- DOCTORS
-- ========================================
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  city TEXT NOT NULL,
  license_number TEXT,
  license_url TEXT,
  experience_years INT DEFAULT 0,
  languages TEXT[],
  verified_badge BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- APPOINTMENTS
-- ========================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  mode TEXT DEFAULT 'online' CHECK (mode IN ('online', 'offline')),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  jitsi_room_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Enable Row Level Security (RLS)
-- ========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Policies for USERS
-- ========================================
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view doctor user info"
  ON public.users FOR SELECT
  USING (
    role = 'doctor' AND 
    id IN (SELECT user_id FROM public.doctors WHERE verified_badge = true)
  );

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can insert user profiles"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ========================================
-- Policies for DOCTORS
-- ========================================
CREATE POLICY "Anyone can view verified doctors"
  ON public.doctors FOR SELECT
  USING (verified_badge = true);

CREATE POLICY "Doctor manages own profile"
  ON public.doctors FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ========================================
-- Policies for APPOINTMENTS
-- ========================================
CREATE POLICY "Users can view own appointments"
  ON public.appointments FOR SELECT
  USING (
    citizen_id = auth.uid() OR
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "Citizens can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "Doctors can update appointments"
  ON public.appointments FOR UPDATE
  USING (
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
  );

-- ========================================
-- Trigger for new user registration
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- ========================================
-- Storage bucket for licenses
-- ========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('licenses', 'licenses', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage
CREATE POLICY "Doctors can upload own licenses"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'licenses' AND auth.uid()::text = split_part(name, '/', 1));

CREATE POLICY "Doctors can view own licenses"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'licenses' AND auth.uid()::text = split_part(name, '/', 1));

-- ========================================
-- Indexes
-- ========================================
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_city ON public.doctors(city);
CREATE INDEX IF NOT EXISTS idx_doctors_verified ON public.doctors(verified_badge);
CREATE INDEX IF NOT EXISTS idx_doctors_search ON public.doctors(city, specialty, verified_badge);
CREATE INDEX IF NOT EXISTS idx_appointments_citizen ON public.appointments(citizen_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON public.appointments(scheduled_at);
