
-- Add relationship between reports and profiles to enable joining
ALTER TABLE public.reports 
ADD CONSTRAINT reports_user_id_profiles_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;
