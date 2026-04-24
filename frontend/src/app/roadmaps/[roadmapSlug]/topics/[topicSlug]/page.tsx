import Link from "next/link";
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
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 72px" }}>
        <Link href="/roadmaps" style={{ color: "#94a3b8" }}>
          Back to catalog
        </Link>

        <section style={{ marginTop: 18, maxWidth: 760 }}>
          <div
            style={{
              color: "#38bdf8",
              textTransform: "uppercase",
              fontSize: 12,
              letterSpacing: 1,
            }}
          >
            Roadmap
          </div>
          <h1
            style={{
              fontSize: "clamp(2.25rem, 5vw, 4rem)",
              lineHeight: 1.05,
              marginBottom: 16,
            }}
          >
            {roadmap.title}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 18, lineHeight: 1.6 }}>
            {roadmap.description}
          </p>
        </section>

        <RoadmapCanvas roadmapSlug={roadmapSlug} initialTopicSlug={topicSlug} />
      </main>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
