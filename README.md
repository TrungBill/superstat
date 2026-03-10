# Basketball Video Tagging Prototype

Prototype web application for uploading basketball game footage and tagging timestamped events with associated players.

## Stack

- Next.js (App Router) + React + TypeScript
- Supabase Postgres + Supabase Storage
- Supabase JavaScript client

## Features

- Upload basketball video files to Supabase Storage (direct browser upload for large files)
- Persist video metadata in Postgres
- Browse uploaded videos in a library view
- Open a dedicated review page for each video
- Tag events at specific timestamps
- Create players and attach players to events

## Event Types

- 2pt made
- 2pt missed
- 3pt made
- turnover
- rebound
- foul
- assist
- steal

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env.local
```

3. Fill `.env.local` with your Supabase credentials.

4. Start dev server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

1. Create a new Supabase project in the dashboard.
2. Create a public storage bucket named `videos`.
   - Set bucket max file size high enough for your expected footage (for example `500MB` or `1GB`).
3. In **Project Settings -> API**, copy:
   - Project URL
   - `anon` key
   - `service_role` key
4. Add them to `.env.local`.

## Git + Supabase Workflow (Seamless Setup)

This repository is configured to use Supabase migrations, so database changes are versioned in git and can be pushed consistently to your Supabase project.

### 1) Link local repo to your Supabase project

```bash
npm run supabase:login
npx supabase link --project-ref <your-project-ref>
```

Get the project ref from your Supabase project URL:

- `https://supabase.com/dashboard/project/<project-ref>/...`

### 2) Apply current schema from migrations

```bash
npm run supabase:db:push
```

Current initial migration is stored at:

- `supabase/migrations/20260310195800_init_schema.sql`

### 3) Create future schema changes through migrations

```bash
npm run supabase:migration:new add_shot_chart_table
```

Then edit the new SQL file under `supabase/migrations/` and run:

```bash
npm run supabase:db:push
```

Commit the migration file with your feature code so app + database stay in sync.

### 4) Optional automatic migration deploys via GitHub Actions

Workflow file:

- `.github/workflows/supabase-db-push.yml`

Add these GitHub repository secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

After that, pushes to `main` that modify `supabase/migrations/**` will automatically run `supabase db push`.

## Environment Variables

Defined in `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Database Schema

Primary migration source:

- `supabase/migrations/`

Legacy schema snapshot:

- `supabase/schema.sql`

Tables:

- `videos`
- `players`
- `events`
- `event_players`

## Application Routes

- `/` - video library
- `/upload` - upload flow
- `/videos/[id]` - review and tagging page

## Notes

- This is an MVP intended for rapid iteration.
- The app currently uses server-side privileged access for write operations.
- For production hardening, add authentication and stricter user-scoped RLS policies.
- Never commit credentials (database passwords, service tokens, API keys) to git.
