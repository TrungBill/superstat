"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setErrorMessage("Please choose a video file.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);

      const response = await fetch("/api/videos", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Upload failed.");
      }

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
        <h1>Upload basketball video</h1>
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
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Uploading..." : "Upload video"}
        </button>
        {errorMessage ? <p className="error">{errorMessage}</p> : null}
      </form>
    </div>
  );
}
