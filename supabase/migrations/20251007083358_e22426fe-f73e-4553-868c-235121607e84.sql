-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create trainers table
CREATE TABLE public.trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  specialization TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;

-- Create membership_plans table
CREATE TABLE public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_months INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

-- Create member_memberships table
CREATE TABLE public.member_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.member_memberships ENABLE ROW LEVEL SECURITY;

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  max_capacity INTEGER NOT NULL,
  trainer_id UUID REFERENCES public.trainers(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Create class_schedules table
CREATE TABLE public.class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  current_bookings INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;

-- Create class_bookings table
CREATE TABLE public.class_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.class_schedules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, schedule_id)
);

ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.member_memberships(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trainers_updated_at BEFORE UPDATE ON public.trainers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER membership_plans_updated_at BEFORE UPDATE ON public.membership_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER member_memberships_updated_at BEFORE UPDATE ON public.member_memberships FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER class_schedules_updated_at BEFORE UPDATE ON public.class_schedules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER class_bookings_updated_at BEFORE UPDATE ON public.class_bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Anyone can view roles" ON public.user_roles FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for trainers
CREATE POLICY "Anyone can view active trainers" ON public.trainers FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can manage trainers" ON public.trainers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for membership_plans
CREATE POLICY "Anyone can view active plans" ON public.membership_plans FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can manage plans" ON public.membership_plans FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for member_memberships
CREATE POLICY "Users can view their own memberships" ON public.member_memberships FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can create memberships" ON public.member_memberships FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update memberships" ON public.member_memberships FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete memberships" ON public.member_memberships FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for classes
CREATE POLICY "Anyone can view active classes" ON public.classes FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can manage classes" ON public.classes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for class_schedules
CREATE POLICY "Anyone can view schedules" ON public.class_schedules FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can manage schedules" ON public.class_schedules FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for class_bookings
CREATE POLICY "Users can view their own bookings" ON public.class_bookings FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Members can create bookings" ON public.class_bookings FOR INSERT WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'member'));
CREATE POLICY "Members can cancel their bookings" ON public.class_bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any booking" ON public.class_bookings FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for attendance
CREATE POLICY "Users can view their own attendance" ON public.attendance FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Members can check in" ON public.attendance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can check out" ON public.attendance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all attendance" ON public.attendance FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can manage payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default membership plans
INSERT INTO public.membership_plans (name, description, duration_months, price, features) VALUES
  ('Monthly', 'Perfect for getting started', 1, 49.99, ARRAY['Access to gym equipment', 'Locker access', '1 guest pass per month']),
  ('Quarterly', 'Great value for regular members', 3, 129.99, ARRAY['Access to gym equipment', 'Locker access', 'Free group classes', '3 guest passes per quarter']),
  ('Yearly', 'Best value for committed members', 12, 449.99, ARRAY['Access to gym equipment', 'Locker access', 'Free group classes', 'Personal trainer consultation', '12 guest passes per year', '10% discount on merchandise']);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);