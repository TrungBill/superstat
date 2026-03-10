import { NextResponse } from "next/server";

import { VIDEOS_BUCKET } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fileName?: string;
    };
    const fileName = body.fileName?.trim();

    if (!fileName) {
      return NextResponse.json(
        { error: "fileName is required." },
        { status: 400 }
      );
    }

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filePath = `${Date.now()}-${crypto.randomUUID()}-${sanitizedName}`;
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase.storage
      .from(VIDEOS_BUCKET)
      .createSignedUploadUrl(filePath);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      filePath,
      token: data.token,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create upload URL.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
