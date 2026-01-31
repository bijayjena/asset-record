-- Add currency preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN currency text NOT NULL DEFAULT 'USD';

-- Add a check constraint for valid currencies
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_currency CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW'));