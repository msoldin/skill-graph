import Link from "next/link";
import { notFound } from "next/navigation";

import { TopicContent } from "@/features/topics/components/TopicContent";
import { ApiError, getTopicContent } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: { params: { roadmapSlug: string; topicSlug: string } }) {
  const { roadmapSlug, topicSlug } = params;

  try {
    const content = await getTopicContent(roadmapSlug, topicSlug);

    return (
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>
        <Link href={`/roadmaps/${roadmapSlug}`} style={{ color: "#94a3b8" }}>
          Back to roadmap
        </Link>

        <header style={{ marginTop: 18, marginBottom: 28 }}>
          <div style={{ color: "#38bdf8", textTransform: "uppercase", fontSize: 12, letterSpacing: 1 }}>{content.roadmap.title}</div>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.05, marginBottom: 12 }}>{content.topic.title}</h1>
          <p style={{ color: "#94a3b8", fontSize: 18, lineHeight: 1.6 }}>{content.topic.summary}</p>
        </header>

        <TopicContent assets={content.assets} />
      </main>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
