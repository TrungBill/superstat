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
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const file = formData.get("file");

    if (!title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A valid video file is required." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Only video uploads are supported." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filePath = `${Date.now()}-${crypto.randomUUID()}-${sanitizedName}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(VIDEOS_BUCKET)
      .upload(filePath, fileBuffer, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

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
      await supabase.storage.from(VIDEOS_BUCKET).remove([filePath]);
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
