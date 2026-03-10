import Link from "next/link";

import { listVideos } from "@/lib/server/data";

export default async function Home() {
  const videos = await listVideos().catch(() => []);

  return (
    <div className="container stack">
      <div className="top-bar">
        <h1>Basketball Video Library</h1>
        <Link className="button-link" href="/upload">
          Upload new video
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="card">
          <p className="muted">No videos uploaded yet.</p>
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
              <Link href={`/videos/${video.id}`}>Review</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
