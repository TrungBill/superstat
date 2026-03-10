# Basketball Video Tagging Prototype

Prototype web application for uploading basketball game footage and tagging timestamped events with associated players.

## Quick Start (Local)

```bash
git clone https://github.com/TrungBill/superstat.git
cd superstat
npm install
cp .env.example .env.local
# fill .env.local with keys from email
npm run dev
```

Open `http://localhost:3000`.

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

## Evaluation Criteria Mapping

### Next.js / React Knowledge

- **Component structure:** UI is split into focused components (`video-player`, `event-tag-form`, `event-list`, `player-manager`) and page-level containers for upload, library, and review flows.
- **State management:** React local state handles current playback time, form inputs, selected players, loading states, and error feedback.
- **Routing:** Next.js App Router is used with clear routes: `/` (library), `/upload` (upload), and `/videos/[id]` (review).
- **Clean code:** Shared constants/types/helpers are centralized in `src/lib`, API responsibilities are separated under `src/app/api`, and UI components remain presentation-focused.

### Supabase Understanding

- **Schema design:** Normalized relational schema uses `videos`, `players`, `events`, and `event_players` with UUID PKs, constraints, and indexes.
- **Queries:** Data access helpers encapsulate list/get flows and event joins, then map DB rows to UI-facing typed models.
- **Storage usage:** Videos are uploaded to Supabase Storage using signed direct browser upload URLs for better reliability with large files.
- **Data relationships:** Many-to-many event/player association is implemented through `event_players`, with retrieval that resolves linked players per event.

### Product Thinking

- **Sensible UI flow:** Users go from upload -> library -> review/tagging in a straightforward sequence with minimal clicks.
- **Good feature decisions:** Event types are constrained to relevant basketball actions; timestamps are captured from live playback to speed tagging.
- **Usability for tagging workflows:** The review page surfaces current time, existing tags, player creation, and quick multi-select player association in one workspace.
