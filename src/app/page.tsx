import Link from "next/link";

import { listVideos } from "@/lib/server/data";

export default async function Home() {
  const videos = await listVideos().catch(() => []);

  return (
    <div className="container stack">
      <div className="top-bar">
        <div className="stack-tight">
          <h1>Basketball Video Library</h1>
          <p className="muted">
            {videos.length} {videos.length === 1 ? "video" : "videos"} available
          </p>
        </div>
        <Link className="button-link" href="/upload">
          Upload Video
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="card">
          <p className="muted">No videos uploaded yet.</p>
          <p className="muted">
            Start by uploading a game clip, then open it to tag events and players.
          </p>
        </div>
      ) : (
        <ul className="video-list">
          {videos.map((video) => (
            <li key={video.id} className="video-list-item">
              <div>
                <h3>{video.title}</h3>
                <p className="muted">
                  Uploaded {new Date(video.created_at).toLocaleString()}
                </p>
              </div>
              <Link className="button-link subtle" href={`/videos/${video.id}`}>
                Open Review
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
