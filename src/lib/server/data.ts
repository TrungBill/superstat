import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { EventType, Player, TaggedEvent, Video } from "@/lib/types";

type EventRow = {
  id: string;
  video_id: string;
  timestamp_seconds: number;
  event_type: EventType;
  notes: string | null;
  created_at: string;
  event_players: {
    players: Player[] | null;
  }[];
};

export async function listVideos(): Promise<Video[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id,title,file_path,public_url,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getVideoById(videoId: string): Promise<Video | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id,title,file_path,public_url,created_at")
    .eq("id", videoId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listPlayers(): Promise<Player[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("players")
    .select("id,name,jersey_number,created_at")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listEventsByVideoId(videoId: string): Promise<TaggedEvent[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id,video_id,timestamp_seconds,event_type,notes,created_at,event_players(players(id,name,jersey_number,created_at))"
    )
    .eq("video_id", videoId)
    .order("timestamp_seconds", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as EventRow[]).map((event) => ({
    ...event,
    players: event.event_players
      .flatMap((entry) => entry.players ?? [])
      .filter((player): player is Player => Boolean(player)),
  }));
}
