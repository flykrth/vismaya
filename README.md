# Vismaya — Camp Workshop Registration System

> **Archived.** This repository is preserved as a public reference. The event it served has concluded and the Supabase backend has been paused. The system is no longer active.

Vismaya was the official online registration platform for a summer camp's workshop selection system. Parents could register their children (campers), browse available workshops across time slots, and manage enrollments — all through a real-time, authenticated web interface.

---

## What this project does

- **Parent authentication** — register and sign in via email + password using Supabase Auth
- **Camper profiles** — add multiple children under one parent account with age-based categorisation (Sub-Junior / Junior / Senior)
- **Workshop catalog** — browse workshops with live slot availability, descriptions, and speaker details
- **Workshop registration** — enroll campers into available time slots with duplicate-prevention and capacity enforcement
- **Live dashboard** — real-time updates for enrollment counts and registration status using Supabase Realtime
- **Auto-generated registration numbers** — campers receive unique IDs (`S101`, `J101`, `A101`) on registration

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Auth & Database | Supabase (Auth + PostgreSQL + Realtime) |
| Architecture | MVC — controllers / models / views |
| Styling | Custom CSS |

## Project structure

```
src/
├── app/              # Next.js pages (register, login, dashboard, status)
├── controllers/      # Server Actions — auth, registration, catalog, dashboard
├── models/           # Supabase client initialisation (client + server)
├── views/            # React components (auth, catalog, dashboard, layout)
└── proxy.ts          # Next.js middleware (session management)
supabase/
└── migrations/       # Full PostgreSQL schema, RLS policies, triggers, seed data
```

## Running locally

> **Note:** The Supabase project backing the production instance has been paused due to inactivity. You will need to provision your own Supabase project to run this locally.

1. Clone the repository
2. Create a Supabase project at [supabase.com](https://supabase.com)
3. Run the migrations in `supabase/migrations/` in order against your project
4. Create a `.env.local` file with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

---

## Security & data notice

> **No sensitive or personal data is included in this repository.**

This repository has been audited before being made public. The following was verified:

- ✅ **No API keys or secrets** — all credentials are loaded exclusively from environment variables (`process.env`). No `.env` files were ever committed to this repository.
- ✅ **No real user data** — the seed file (`20260423000101_final_seed_test.sql`) contains only fictional workshop and schedule data used for development testing. No real camper names, emails, phone numbers, or personal records are present in any file or commit.
- ✅ **No hardcoded passwords or tokens** — authentication is handled entirely through Supabase Auth using user-supplied credentials.
- ✅ **Git history is clean** — the full commit history was scanned and contains no committed secrets, keys, or personal information.
- ℹ️ **Supabase is paused** — the production database has been paused by Supabase due to inactivity. No live data is accessible.

---

*Built for Vismaya Summer Camp · Karthik Krishna*
