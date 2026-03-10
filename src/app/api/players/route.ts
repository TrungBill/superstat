import { NextResponse } from "next/server";

import { listPlayers } from "@/lib/server/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const players = await listPlayers();
    return NextResponse.json({ players });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch players.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      jersey_number?: number | null;
    };

    const name = body.name?.trim() ?? "";
    if (!name) {
      return NextResponse.json(
        { error: "Player name is required." },
        { status: 400 }
      );
    }

    const jerseyNumber =
      typeof body.jersey_number === "number" ? Math.floor(body.jersey_number) : null;

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("players").insert({
      name,
      jersey_number: jerseyNumber,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const players = await listPlayers();
    return NextResponse.json({ players }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create player.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
