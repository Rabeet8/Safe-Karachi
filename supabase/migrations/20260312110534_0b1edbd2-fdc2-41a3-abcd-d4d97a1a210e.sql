
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  trust_score INTEGER NOT NULL DEFAULT 50,
  reports_today INTEGER NOT NULL DEFAULT 0,
  last_report_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Incident type enum
CREATE TYPE public.incident_type AS ENUM (
  'mobile_snatching',
  'robbery',
  'vehicle_theft',
  'street_harassment',
  'assault',
  'theft',
  'carjacking',
  'other'
);

-- Report status enum
CREATE TYPE public.report_status AS ENUM ('pending', 'verified', 'hidden', 'expired');

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  incident_type public.incident_type NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location_name TEXT,
  description TEXT,
  weapon TEXT,
  image_url TEXT,
  status public.report_status NOT NULL DEFAULT 'pending',
  confirmations INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports viewable by everyone" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Auth users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON public.reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON public.reports FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_reports_location ON public.reports (latitude, longitude);
CREATE INDEX idx_reports_created_at ON public.reports (created_at DESC);
CREATE INDEX idx_reports_status ON public.reports (status);
CREATE INDEX idx_reports_user_id ON public.reports (user_id);

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Confirmations table
CREATE TABLE public.confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('confirm', 'reject')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(report_id, user_id)
);

ALTER TABLE public.confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Confirmations viewable by everyone" ON public.confirmations FOR SELECT USING (true);
CREATE POLICY "Auth users can vote" ON public.confirmations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_confirmations_report_id ON public.confirmations (report_id);

-- Function to update report confirmation counts and trust scores
CREATE OR REPLACE FUNCTION public.update_report_votes()
RETURNS TRIGGER AS $$
DECLARE
  confirm_count INTEGER;
  reject_count INTEGER;
  new_status public.report_status;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE vote_type = 'confirm'),
    COUNT(*) FILTER (WHERE vote_type = 'reject')
  INTO confirm_count, reject_count
  FROM public.confirmations 
  WHERE report_id = NEW.report_id;

  IF confirm_count >= 3 THEN
    new_status := 'verified';
  ELSIF reject_count >= 5 THEN
    new_status := 'hidden';
  ELSE
    new_status := 'pending';
  END IF;

  UPDATE public.reports 
  SET confirmations = confirm_count, 
      downvotes = reject_count,
      status = new_status
  WHERE id = NEW.report_id;

  IF NEW.vote_type = 'confirm' THEN
    UPDATE public.profiles 
    SET trust_score = LEAST(trust_score + 5, 100)
    WHERE user_id = (SELECT user_id FROM public.reports WHERE id = NEW.report_id);
  ELSIF NEW.vote_type = 'reject' THEN
    UPDATE public.profiles 
    SET trust_score = GREATEST(trust_score - 3, 0)
    WHERE user_id = (SELECT user_id FROM public.reports WHERE id = NEW.report_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_confirmation_added
  AFTER INSERT ON public.confirmations
  FOR EACH ROW EXECUTE FUNCTION public.update_report_votes();

-- Storage bucket for evidence images
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', true);

CREATE POLICY "Evidence images publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'evidence');
CREATE POLICY "Auth users can upload evidence" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'evidence' AND auth.uid() IS NOT NULL);
