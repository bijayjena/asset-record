-- Update default currency to INR (location-based detection will override this in the application)
-- This ensures INR is the fallback if location detection fails
ALTER TABLE public.profiles 
ALTER COLUMN currency SET DEFAULT 'INR';

-- Add comment explaining the currency assignment logic
COMMENT ON COLUMN public.profiles.currency IS 'User preferred currency. Defaults to INR, but application detects location-based currency on signup.';
