# 🚀 FêteFlow AI — Deployment & Database Integration Guide

This guide provides end-to-end instructions for:
1. **Connecting Supabase** (PostgreSQL Database + Authentication + Row-Level Security data isolation).
2. **Deploying to Firebase Hosting** (Global CDN, free HTTPS, instant SPA routing).
3. **Multi-User Isolation** (How user accounts, sign-in, and celebration persistence work).

---

## 📋 Architecture Overview

```
                                 ┌────────────────────────┐
                                 │   Firebase Hosting     │
                                 │  (Global CDN / HTTPS)  │
                                 └───────────┬────────────┘
                                             │ Serves SPA
                                             ▼
                                ┌───────────────────────────┐
                                │   Client Web Application  │
                                │    (React 18 + Vite 6)    │
                                └───┬───────────────────┬───┘
                                    │                   │
                  Supabase Auth & DB│                   │ Gemini GenAI
                                    ▼                   ▼
                     ┌───────────────────────┐   ┌───────────────┐
                     │    Supabase Cloud     │   │ Google Gemini │
                     │ • PostgreSQL Database │   │ Flash 2.5 API │
                     │ • Row Level Security  │   └───────────────┘
                     │ • User Authentication │
                     └───────────────────────┘
```

- **Authentication**: Users sign in or register with email and password via the integrated modal.
- **Data Isolation**: Supabase Row-Level Security (`RLS`) ensures each user can ONLY query, create, edit, or delete their own celebrations (`auth.uid() = user_id`).
- **Zero-Setup Fallback**: If cloud keys are not yet configured in `.env`, FêteFlow seamlessly operates in isolated local multi-user mode (`feteflow_events_user_${userId}`) with 1-click demo accounts.

---

## Part 1: Supabase Database & Auth Setup

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com/](https://supabase.com/) and click **Sign Up** or **Sign In**.
2. Click **New Project** and choose an organization.
3. Fill in the project details:
   - **Name**: `feteflow-ai` (or your choice)
   - **Database Password**: Choose a strong password and save it securely.
   - **Region**: Choose the region closest to you or your users (e.g., `South Asia (Mumbai)`).
   - **Pricing Plan**: Free tier ($0/month).
4. Click **Create new project** and wait ~1-2 minutes for the database to provision.

---

### Step 2: Execute the Database Schema
FêteFlow includes a pre-built SQL migration script with the complete table structure, Row-Level Security (RLS) policies, and performance indexes.

1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar (icon with `>_`).
2. Click **New query** (or `+`).
3. Open [`supabase/schema.sql`](supabase/schema.sql) from this project, copy its entire contents, and paste it into the SQL Editor.
4. Click **Run** (or press `Ctrl+Enter`).

> **What this script configures:**
> - `celebrations` table matching FêteFlow's data structure (id, user_id, title, event_type, date, venue, guest_count, budget, milestones, guests, vendors, inspiration, etc.).
> - Row-Level Security (RLS) enabled on `celebrations`.
> - 4 RLS policies enforcing that users can only **SELECT**, **INSERT**, **UPDATE**, and **DELETE** rows where `auth.uid() = user_id`.
> - Performance indexes on `user_id` and `event_date`.
> - Automated `updated_at` trigger.

---

### Step 3: Configure Authentication Settings
1. In the Supabase Dashboard, go to **Authentication** -> **Providers** -> **Email**.
2. Ensure **Enable Email provider** is turned **ON**.
3. (Optional for local development / testing without email verification):
   - Turn **Confirm email** **OFF** if you want users to be able to sign in immediately without clicking a verification link in their email inbox.
4. Click **Save**.

---

### Step 4: Add Supabase Credentials to `.env`
1. In your Supabase Dashboard, go to **Project Settings** (gear icon) -> **API**.
2. Find:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **Project API keys** -> `anon` / `public` (starts with `eyJ...`)
3. In your project root, open or create `.env` (copy from `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key-here...
   ```
4. Save the file. That's it! FêteFlow AI will now automatically use your live Supabase cloud database and authentication service.

---

## Part 2: Deploying to Firebase Hosting

Firebase Hosting provides fast, secure global CDN hosting with free SSL certificates and automatic SPA routing.

### Step 1: Install Firebase CLI
If you haven't already installed the Firebase CLI tools, install them globally:
```bash
npm install -g firebase-tools
```

---

### Step 2: Log In to Firebase
Log into your Google account associated with Firebase:
```bash
firebase login
```
*(A browser window will open asking you to sign in with your Google account. Select your account and grant permissions).*

---

### Step 3: Link Your Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add project** (or use an existing one). Name it `feteflow-ai`.
2. In your terminal in the project directory:
   ```bash
   firebase use --add
   ```
   Select your newly created Firebase project from the list and give it an alias (e.g., `default`).
   
   *(Alternatively, you can edit `.firebaserc` directly and replace `"feteflow-ai"` with your Firebase project ID).*

---

### Step 4: Build the Production Application
Run the Vite production build:
```bash
npm run build
```
This generates the optimized production bundle inside the `dist/` directory.

---

### Step 5: Deploy to Firebase Hosting
Run:
```bash
firebase deploy --only hosting
```

You will see output similar to:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/feteflow-ai/overview
Hosting URL: https://feteflow-ai.web.app
```

Open the `Hosting URL` in your browser. Your FêteFlow AI application is live!

---

## Part 3: Testing User Accounts & Data Isolation

FêteFlow AI guarantees that every user has a completely isolated celebration workspace.

### How to Test:
1. **Open the Live App or Local Dev Server** (`npm run dev`).
2. Click **Sign In** or **Get Started** in the top navigation bar.
3. **Register User 1**:
   - Click "Need an account? Sign up".
   - Enter `host1@example.com` and password `password123`.
   - Click **Create Account**.
   - You will see the user avatar with "host1" in the navbar and sidebar.
   - Click **+ Plan Celebration** or **Start Planning** and complete the AI creation wizard (e.g., "Priya & Rohan's Sangeet Night").
   - Notice that this event is saved directly under User 1.
4. **Sign Out**:
   - Click the user pill in the top navbar or sidebar -> **Sign Out**.
5. **Register User 2**:
   - Click **Sign In** -> "Sign up".
   - Enter `host2@example.com` and password `password123`.
   - Click **Create Account**.
   - Notice that User 2's workspace is **completely empty** (`✨ Your Celebration Workspace is Ready`). User 2 **cannot** see User 1's celebration!
   - Create a different event for User 2 (e.g., "Aarav's 10th Birthday").
6. **Sign Back In as User 1**:
   - Sign out of User 2.
   - Click **Sign In**, enter `host1@example.com` and `password123`.
   - Notice that User 1's celebration ("Priya & Rohan's Sangeet Night") appears instantly, with all tasks, budget numbers, and milestones preserved.

---

## ⚡ Useful Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Start local Vite development server on `http://localhost:5173` |
| `npm run build` | Compile TypeScript and bundle production assets to `dist/` |
| `npm test` | Run Vitest unit tests |
| `firebase deploy --only hosting` | Deploy the contents of `dist/` directly to Firebase Hosting |
