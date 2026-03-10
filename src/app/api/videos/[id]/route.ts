import { NextResponse } from "next/server";

import { getVideoById } from "@/lib/server/data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const video = await getVideoById(id);

    if (!video) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    return NextResponse.json({ video });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch video.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
