"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { EventList } from "@/components/event-list";
import { EventTagForm } from "@/components/event-tag-form";
import { PlayerManager } from "@/components/player-manager";
import { VideoPlayer } from "@/components/video-player";
import { Player, TaggedEvent, Video } from "@/lib/types";

type VideoReviewClientProps = {
  videoId: string;
};

export function VideoReviewClient({ videoId }: VideoReviewClientProps) {
  const [video, setVideo] = useState<Video | null>(null);
  const [events, setEvents] = useState<TaggedEvent[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [videoRes, eventsRes, playersRes] = await Promise.all([
          fetch(`/api/videos/${videoId}`),
          fetch(`/api/videos/${videoId}/events`),
          fetch("/api/players"),
        ]);

        const [videoPayload, eventsPayload, playersPayload] = await Promise.all([
          videoRes.json(),
          eventsRes.json(),
          playersRes.json(),
        ]);

        if (!videoRes.ok) {
          throw new Error(videoPayload.error || "Failed to load video.");
        }
        if (!eventsRes.ok) {
          throw new Error(eventsPayload.error || "Failed to load events.");
        }
        if (!playersRes.ok) {
          throw new Error(playersPayload.error || "Failed to load players.");
        }

        setVideo(videoPayload.video);
        setEvents(eventsPayload.events);
        setPlayers(playersPayload.players);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load review data."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [videoId]);

  if (loading) {
    return <p className="muted">Loading video review page...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!video) {
    return <p className="error">Video not found.</p>;
  }

  return (
    <div className="container stack">
      <div className="top-bar">
        <h1>{video.title}</h1>
        <Link href="/">Back to library</Link>
      </div>

      <VideoPlayer src={video.public_url} onTimeChange={setCurrentTime} />

      <div className="grid-two">
        <EventTagForm
          videoId={video.id}
          currentTime={currentTime}
          players={players}
          onEventsUpdated={setEvents}
        />
        <PlayerManager players={players} onPlayersUpdated={setPlayers} />
      </div>

      <EventList events={events} />
    </div>
  );
}
