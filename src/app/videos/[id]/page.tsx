import { VideoReviewClient } from "@/app/videos/[id]/video-review-client";

export default async function VideoReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VideoReviewClient videoId={id} />;
}
