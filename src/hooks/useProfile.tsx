import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Currency } from '@/lib/currency';
import { detectCurrencyFromLocation } from '@/lib/location-currency';
import { useQuery } from '@tanstack/react-query';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  full_name: string | null;
  age: number | null;
  onboarding_completed: boolean;
  wants_tutorial: boolean;
  currency: Currency;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();

  const { data: profile, isLoading: loading, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const detectedCurrency = await detectCurrencyFromLocation();
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({ 
              user_id: user.id,
              currency: detectedCurrency,
            })
            .select()
            .single();

          if (createError) throw createError;
          return newProfile as Profile;
        }
        throw error;
      }
      return data as Profile;
    },
    enabled: !!user,
  });

  return { profile: profile || null, loading, refreshProfile: refetch };
};
