-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'citizen')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  specialty TEXT NOT NULL,
  city TEXT NOT NULL,
  verified_badge BOOLEAN DEFAULT FALSE,
  license_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  jitsi_room_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert user profiles" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for doctors table
CREATE POLICY "Anyone can view verified doctors" ON public.doctors
  FOR SELECT USING (verified_badge = true);

CREATE POLICY "Doctors can view own profile" ON public.doctors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Doctors can update own profile" ON public.doctors
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Doctors can insert own profile" ON public.doctors
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create policies for appointments table
CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (
    citizen_id = auth.uid() OR 
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "Citizens can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "Doctors can update appointments" ON public.appointments
  FOR UPDATE USING (
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create storage bucket for license documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('licenses', 'licenses', false);

-- Create policy for license storage
CREATE POLICY "Doctors can upload their own licenses" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'licenses' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Doctors can view their own licenses" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'licenses' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_city ON public.doctors(city);
CREATE INDEX IF NOT EXISTS idx_doctors_verified ON public.doctors(verified_badge);
CREATE INDEX IF NOT EXISTS idx_appointments_citizen ON public.appointments(citizen_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON public.appointments(scheduled_at);