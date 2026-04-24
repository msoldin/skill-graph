import { notFound } from "next/navigation";

import { RoadmapCanvas } from "@/features/roadmaps/components/RoadmapCanvas";
import { ApiError, getRoadmap } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function TopicPage({
  params,
}: {
  params: { roadmapSlug: string; topicSlug: string };
}) {
  const { roadmapSlug, topicSlug } = params;

  try {
    const roadmap = await getRoadmap(roadmapSlug);

    return (
      <main className="w-screen h-screen overflow-hidden">
        <RoadmapCanvas
          roadmapSlug={roadmapSlug}
          roadmap={roadmap}
          initialTopicSlug={topicSlug}
        />
      </main>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
