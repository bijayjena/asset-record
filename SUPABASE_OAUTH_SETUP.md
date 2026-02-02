# Setting up OAuth with Supabase

To make the Google and GitHub login buttons work, you need to configure the OAuth providers in your Supabase dashboard.

## 1. Enable Providers

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Go to **Authentication** -> **Providers**.

### Google
1. Click on **Google** and toggle it **Enable**.
2. You will need a `Client ID` and `Client Secret` from the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project or select an existing one.
   - Go to **APIs & Services** -> **Credentials**.
   - Create Credentials -> OAuth Client ID.
   - Application Type: **Web application**.
   - **Authorized JavaScript origins**: `https://<your-project-ref>.supabase.co` (find this in Supabase Auth settings).
   - **Authorized redirect URIs**: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
3. Copy the Client ID and Secret to Supabase.

### GitHub
1. Click on **GitHub** and toggle it **Enable**.
2. You will need a `Client ID` and `Client Secret` from [GitHub Developer Settings](https://github.com/settings/developers).
   - Go to **OAuth Apps** -> **New OAuth App**.
   - Application Name: Any name (e.g., "AssetRecord").
   - Homepage URL: Your app's URL (e.g., `http://localhost:5173` for dev).
   - **Authorization callback URL**: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
3. Copy the Client ID and Secret to Supabase.

## 2. URL Configuration

1. Go to **Authentication** -> **URL Configuration**.
2. Ensure your Site URL is set (e.g., `http://localhost:5173` for local development).
3. If deploying, add your production URL to **Redirect URLs**.
4. The code is set to redirect to `${window.location.origin}/dashboard` after login.

## 3. Testing

Once configured, restart your dev server if needed (though not usually required for this change) and try generating a login via the new buttons.
