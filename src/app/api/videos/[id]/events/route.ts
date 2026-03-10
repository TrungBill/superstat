import { NextResponse } from "next/server";

import { EVENT_TYPES } from "@/lib/constants";
import { listEventsByVideoId } from "@/lib/server/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function isEventType(value: string): value is (typeof EVENT_TYPES)[number] {
  return EVENT_TYPES.includes(value as (typeof EVENT_TYPES)[number]);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const events = await listEventsByVideoId(id);
    return NextResponse.json({ events });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch events.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      timestamp_seconds?: number;
      event_type?: string;
      notes?: string;
      player_ids?: string[];
    };

    if (typeof body.timestamp_seconds !== "number" || body.timestamp_seconds < 0) {
      return NextResponse.json(
        { error: "timestamp_seconds must be a non-negative number." },
        { status: 400 }
      );
    }

    if (!body.event_type || !isEventType(body.event_type)) {
      return NextResponse.json({ error: "Invalid event_type." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: insertedEvent, error: insertError } = await supabase
      .from("events")
      .insert({
        video_id: id,
        timestamp_seconds: Math.floor(body.timestamp_seconds),
        event_type: body.event_type,
        notes: body.notes?.trim() || null,
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    const playerIds = Array.isArray(body.player_ids)
      ? Array.from(new Set(body.player_ids.filter(Boolean)))
      : [];

    if (playerIds.length > 0) {
      const rows = playerIds.map((playerId) => ({
        event_id: insertedEvent.id,
        player_id: playerId,
      }));

      const { error: joinError } = await supabase.from("event_players").insert(rows);
      if (joinError) {
        return NextResponse.json({ error: joinError.message }, { status: 500 });
      }
    }

    const events = await listEventsByVideoId(id);
    return NextResponse.json({ events }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to tag event.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
