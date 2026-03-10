# Basketball Video Tagging Prototype

Prototype web application for uploading basketball game footage and tagging timestamped events with associated players.

## Stack

- Next.js (App Router) + React + TypeScript
- Supabase Postgres + Supabase Storage
- Supabase JavaScript client

## Features

- Upload basketball video files to Supabase Storage
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
3. In SQL Editor, run:
   - `supabase/schema.sql`
4. In **Project Settings -> API**, copy:
   - Project URL
   - `anon` key
   - `service_role` key
5. Add them to `.env.local`.

## Environment Variables

Defined in `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Database Schema

Schema file: `supabase/schema.sql`

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
