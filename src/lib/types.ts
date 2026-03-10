import { EVENT_TYPES } from "@/lib/constants";

export type EventType = (typeof EVENT_TYPES)[number];

export type Video = {
  id: string;
  title: string;
  file_path: string;
  public_url: string;
  created_at: string;
};

export type Player = {
  id: string;
  name: string;
  jersey_number: number | null;
  created_at: string;
};

export type TaggedEvent = {
  id: string;
  video_id: string;
  timestamp_seconds: number;
  event_type: EventType;
  notes: string | null;
  created_at: string;
  players: Player[];
};
