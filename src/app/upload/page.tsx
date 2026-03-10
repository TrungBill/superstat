"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { VIDEOS_BUCKET } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setErrorMessage("Please choose a video file.");
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      setStatusMessage("Preparing secure upload...");
      const signedUrlResponse = await fetch("/api/videos/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name }),
      });
      const signedUrlPayload = await signedUrlResponse.json();
      if (!signedUrlResponse.ok) {
        throw new Error(signedUrlPayload.error || "Failed to start upload.");
      }

      setStatusMessage("Uploading video to storage...");
      const supabase = createSupabaseBrowserClient();
      const { error: storageError } = await supabase.storage
        .from(VIDEOS_BUCKET)
        .uploadToSignedUrl(signedUrlPayload.filePath, signedUrlPayload.token, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        if (storageError.message.includes("maximum allowed size")) {
          throw new Error(
            "Upload failed: bucket file-size limit was exceeded. Increase the Supabase Storage bucket max file size and try again."
          );
        }
        throw new Error(storageError.message);
      }

      setStatusMessage("Saving metadata...");
      const response = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          filePath: signedUrlPayload.filePath,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Upload failed.");
      }

      setStatusMessage("Upload complete.");
      router.push(`/videos/${payload.video.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container stack">
      <div className="top-bar">
        <div className="stack-tight">
          <h1>Upload Basketball Video</h1>
          <p className="muted">Large videos are uploaded directly to Supabase Storage.</p>
        </div>
        <Link href="/">Back to library</Link>
      </div>
      <form className="card stack-form" onSubmit={handleSubmit}>
        <label>
          Video title
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: Lakers vs Celtics - Q4"
          />
        </label>
        <label>
          Video file
          <input
            required
            accept="video/*"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        {file ? (
          <p className="muted">
            Selected: {file.name} ({formatFileSize(file.size)})
          </p>
        ) : (
          <p className="muted">Choose an MP4/MOV file to start upload.</p>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Uploading..." : "Upload video"}
        </button>
        {statusMessage ? <p className="muted">{statusMessage}</p> : null}
        {errorMessage ? <p className="error">{errorMessage}</p> : null}
      </form>
    </div>
  );
}
