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

## How to Use the Application

1. Open the app at `http://localhost:3000`.
2. Click **Upload Video**.
3. Enter a title and select a basketball video file.
4. Submit the form and wait for upload + metadata save to complete.
5. You will be redirected to the video review page.
6. Play the video and pause at the moment you want to tag.
7. Add players in the **Players** panel (optional but recommended first).
8. In **Tag event**, choose event type, optional notes, and select players.
9. Click **Save event** to store the tag at the current timestamp.
10. Review all saved tags in **Tagged events** below the player.

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
