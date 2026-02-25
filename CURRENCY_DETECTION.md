# Location-Based Currency Detection

## Overview
The application now automatically detects the user's currency based on their geographic location during signup. If location detection fails or the country is not supported, it defaults to INR (Indian Rupee).

## How It Works

### 1. Location Detection
- Uses the free `ipapi.co` API to detect user's country based on IP address
- Has a 3-second timeout to prevent blocking the signup flow
- Maps country codes to appropriate currencies

### 2. Supported Currencies
The following currencies are automatically assigned based on location:
- USD - United States
- GBP - United Kingdom
- EUR - European Union countries (Germany, France, Italy, Spain, etc.)
- INR - India (also the default fallback)
- JPY - Japan
- AUD - Australia
- CAD - Canada
- CHF - Switzerland
- CNY - China
- KRW - South Korea

### 3. Implementation Points

#### Email/Password Signup (`src/pages/Auth.tsx`)
- Currency is auto-detected when user switches to signup form
- User can still manually change the currency before submitting
- Detected currency is saved to the profile during account creation

#### OAuth Signup (`src/hooks/useAuth.tsx`)
- Currency is detected when profile is created after OAuth sign-in
- Applies to Google and GitHub authentication

#### Profile Creation (`src/hooks/useProfile.tsx`)
- If a profile doesn't exist, currency is detected during creation
- Ensures all users have a currency preference

### 4. Database Default
- Database default is set to INR in the profiles table
- This serves as the ultimate fallback if all detection methods fail

## Files Modified

1. `src/lib/location-currency.ts` - New file with detection logic
2. `src/pages/Auth.tsx` - Auto-detect currency on signup form
3. `src/hooks/useAuth.tsx` - Detect currency for OAuth users
4. `src/hooks/useProfile.tsx` - Detect currency when creating profiles
5. `supabase/migrations/20260225000000_location_based_currency.sql` - Database migration

## Testing

To test the implementation:

1. Sign up with email/password - currency should auto-detect based on your location
2. Sign up with Google/GitHub - currency should be set automatically
3. If detection fails, currency should default to INR
4. Users can still manually change their currency in the signup form

## Privacy & Performance

- Location detection only happens during signup
- Uses IP-based geolocation (no GPS or precise location required)
- Has a timeout to prevent blocking the user experience
- Falls back gracefully if the API is unavailable
- No personal location data is stored
