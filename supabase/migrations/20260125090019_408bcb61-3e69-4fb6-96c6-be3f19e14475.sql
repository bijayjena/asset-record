-- Create enum for gadget categories
CREATE TYPE public.gadget_category AS ENUM (
  'phone', 'laptop', 'tablet', 'watch', 'headphones', 'tv', 
  'gaming', 'camera', 'speaker', 'wearable', 'other'
);

-- Create enum for gadget condition
CREATE TYPE public.gadget_condition AS ENUM (
  'excellent', 'good', 'okay', 'bad'
);

-- Create enum for attachment types
CREATE TYPE public.attachment_type AS ENUM (
  'bill', 'warranty', 'photo', 'other'
);

-- Create gadgets table
CREATE TABLE public.gadgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category gadget_category NOT NULL DEFAULT 'other',
  brand TEXT NOT NULL,
  model TEXT,
  purchase_date DATE NOT NULL,
  price_paid DECIMAL(10,2),
  vendor_name TEXT,
  order_id TEXT,
  warranty_expiry DATE,
  condition gadget_condition NOT NULL DEFAULT 'good',
  serial_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create attachments table
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gadget_id UUID NOT NULL REFERENCES public.gadgets(id) ON DELETE CASCADE,
  type attachment_type NOT NULL DEFAULT 'other',
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create AI suggestions table
CREATE TABLE public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gadget_id UUID NOT NULL REFERENCES public.gadgets(id) ON DELETE CASCADE,
  response_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_gadgets_updated_at
  BEFORE UPDATE ON public.gadgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.gadgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Gadgets RLS policies
CREATE POLICY "Users can view their own gadgets"
  ON public.gadgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gadgets"
  ON public.gadgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gadgets"
  ON public.gadgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gadgets"
  ON public.gadgets FOR DELETE
  USING (auth.uid() = user_id);

-- Attachments RLS policies (access via gadget ownership)
CREATE POLICY "Users can view attachments of their gadgets"
  ON public.attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gadgets 
      WHERE gadgets.id = attachments.gadget_id 
      AND gadgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attachments for their gadgets"
  ON public.attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gadgets 
      WHERE gadgets.id = attachments.gadget_id 
      AND gadgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments of their gadgets"
  ON public.attachments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.gadgets 
      WHERE gadgets.id = attachments.gadget_id 
      AND gadgets.user_id = auth.uid()
    )
  );

-- AI Suggestions RLS policies
CREATE POLICY "Users can view AI suggestions for their gadgets"
  ON public.ai_suggestions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gadgets 
      WHERE gadgets.id = ai_suggestions.gadget_id 
      AND gadgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create AI suggestions for their gadgets"
  ON public.ai_suggestions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gadgets 
      WHERE gadgets.id = ai_suggestions.gadget_id 
      AND gadgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete AI suggestions for their gadgets"
  ON public.ai_suggestions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.gadgets 
      WHERE gadgets.id = ai_suggestions.gadget_id 
      AND gadgets.user_id = auth.uid()
    )
  );

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create storage bucket for gadget attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gadget-attachments', 
  'gadget-attachments', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
);

-- Storage RLS policies for gadget-attachments bucket
CREATE POLICY "Users can view their own attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gadget-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gadget-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gadget-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for better performance
CREATE INDEX idx_gadgets_user_id ON public.gadgets(user_id);
CREATE INDEX idx_gadgets_category ON public.gadgets(category);
CREATE INDEX idx_gadgets_purchase_date ON public.gadgets(purchase_date);
CREATE INDEX idx_attachments_gadget_id ON public.attachments(gadget_id);
CREATE INDEX idx_ai_suggestions_gadget_id ON public.ai_suggestions(gadget_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);