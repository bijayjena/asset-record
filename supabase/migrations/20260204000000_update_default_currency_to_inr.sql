-- Update default currency from USD to INR
ALTER TABLE public.profiles 
ALTER COLUMN currency SET DEFAULT 'INR';

-- Update existing users who have USD as their currency to INR (optional)
-- Uncomment the line below if you want to update existing users
-- UPDATE public.profiles SET currency = 'INR' WHERE currency = 'USD';