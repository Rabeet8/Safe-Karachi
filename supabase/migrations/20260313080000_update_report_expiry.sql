
-- Update report expiry to 30 days
ALTER TABLE public.reports 
ALTER COLUMN expires_at SET DEFAULT (now() + interval '30 days');

-- Update existing reports that haven't expired yet to the new duration
-- (Optional, but good for consistency)
UPDATE public.reports 
SET expires_at = created_at + interval '30 days'
WHERE status = 'pending' OR status = 'verified';
