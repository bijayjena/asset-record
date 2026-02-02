# Supabase Project Migration Guide

Since you have switched your Supabase project ID, you need to perform the following steps to ensure everything works correctly.

## 1. Update Environment Variables

You have already updated the Project ID and URL in `.env`, but the **Publishable Key** is still from the old project.

1.  Go to your **New** Supabase Project Dashboard.
2.  Navigate to **Settings** -> **API**.
3.  Copy the `anon` / `public` key.
4.  Open `.env` and replace the value of `VITE_SUPABASE_PUBLISHABLE_KEY` with the new key.
5.  Save the file.

## 2. Deploy Database Schema

Your code has database migrations in `supabase/migrations`. You need to apply these to the new project.

1.  Open a new terminal.
2.  Login to Supabase CLI (if not already logged in):
    ```bash
    npx supabase login
    ```
3.  Link your local project to the new remote project:
    ```bash
    npx supabase link --project-ref hxobyvwwiygvddqjwsyz
    ```
    *(You will be asked for the database password you set when creating the project)*
4.  Push the migrations:
    ```bash
    npx supabase db push
    ```

## 3. Configure Authentication

Your OAuth settings (Google, GitHub) do not transfer between projects.

1.  Follow the instructions in `SUPABASE_OAUTH_SETUP.md` using the **New** project dashboard.
2.  Ensure you have enabled Google and GitHub providers again.
3.  Update the **Redirect URLs** in the new project's Authentication settings.

## 4. Verify Storage

The migrations should automatically create the `gadget-attachments` storage bucket.
- Go to **Storage** in your Supabase Dashboard to confirm `gadget-attachments` exists.
- If not, you may need to create it manually or check if the migration applied successfully.
