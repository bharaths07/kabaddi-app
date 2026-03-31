# Play Legends - Deployment Guide

This guide details how to deploy the Play Legends application to a production environment.

## 1. Prerequisites

Before deploying, ensure you have:
- A Supabase project created.
- Node.js (v18+) and npm/yarn installed.
- Access to a hosting provider (Vercel, Netlify, or AWS Amplify).

## 2. Environment Configuration

Create a `.env.production` file in the root directory with the following variables:

```bash
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_CRICHEROES_API_KEY=<optional-api-key>
VITE_APP_NAME="Play Legends"
```

> **Note:** Do NOT commit `.env.production` to version control. Use your hosting provider's environment variable management system.

## 3. Database Setup (Supabase)

1.  **Run Migrations:** Execute the SQL scripts in `scripts/` via the Supabase Dashboard SQL Editor.
    - `scripts/setup_rls.sql`: Enables Row Level Security policies.
    - `scripts/schema.sql` (if exists): Creates tables.

2.  **Enable Auth Providers:**
    - Go to **Authentication > Providers**.
    - Enable **Phone** (Twilio or Supabase built-in SMS).
    - (Optional) Enable **Email** with SMTP settings.

3.  **Configure Redirect URLs:**
    - Add your production URL (e.g., `https://playlegends.app/auth/callback`) to **Authentication > URL Configuration > Site URL**.

## 4. Build Process

Run the build command to generate static assets:

```bash
npm install
npm run build
```

The output will be in the `dist/` directory.

## 5. Deployment (Vercel Example)

1.  Push your code to GitHub/GitLab.
2.  Import the repository in Vercel.
3.  Set the **Root Directory** to `./`.
4.  Add the Environment Variables from Step 2.
5.  Click **Deploy**.

## 6. Post-Deployment Verification

1.  Visit the live URL.
2.  Test **Phone Login** with a real number.
3.  Verify that **Guest Access** works.
4.  Check that **Teams** and **Matches** can be created by authenticated users.
5.  Confirm that **RLS Policies** prevent unauthorized edits (e.g., try editing another user's profile).

## 7. Monitoring & Maintenance

- Use **Sentry** or **LogRocket** for frontend error tracking.
- Monitor **Supabase Logs** for database performance and auth issues.
- Regularly update dependencies with `npm update`.
