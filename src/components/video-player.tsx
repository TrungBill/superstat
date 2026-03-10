"use client";

import { useRef } from "react";

type VideoPlayerProps = {
  src: string;
  onTimeChange: (seconds: number) => void;
};

export function VideoPlayer({ src, onTimeChange }: VideoPlayerProps) {
  const ref = useRef<HTMLVideoElement | null>(null);

  return (
    <video
      ref={ref}
      controls
      onTimeUpdate={(event) => onTimeChange(event.currentTarget.currentTime)}
      style={{ width: "100%", borderRadius: 8, background: "#000" }}
      src={src}
    />
  );
}
