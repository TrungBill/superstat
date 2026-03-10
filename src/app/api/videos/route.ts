import { NextResponse } from "next/server";

import { VIDEOS_BUCKET } from "@/lib/constants";
import { listVideos } from "@/lib/server/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const videos = await listVideos();
    return NextResponse.json({ videos });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch videos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      filePath?: string;
    };
    const title = body.title?.trim() ?? "";
    const filePath = body.filePath?.trim() ?? "";

    if (!title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    if (!filePath) {
      return NextResponse.json(
        { error: "filePath is required." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const {
      data: { publicUrl },
    } = supabase.storage.from(VIDEOS_BUCKET).getPublicUrl(filePath);

    const { data: insertedVideo, error: insertError } = await supabase
      .from("videos")
      .insert({
        title,
        file_path: filePath,
        public_url: publicUrl,
      })
      .select("id,title,file_path,public_url,created_at")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ video: insertedVideo }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
