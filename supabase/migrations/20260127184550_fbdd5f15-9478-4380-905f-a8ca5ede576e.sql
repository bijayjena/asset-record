-- Add onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN full_name text,
ADD COLUMN age integer,
ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false,
ADD COLUMN wants_tutorial boolean DEFAULT false;