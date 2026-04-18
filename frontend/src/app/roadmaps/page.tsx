import Link from "next/link";

import { getRoadmaps } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function RoadmapsPage() {
  const roadmaps = await getRoadmaps();

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px 96px" }}>
      <header style={{ maxWidth: 720 }}>
        <div style={{ color: "#38bdf8", fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase" }}>Skill Graph MVP</div>
        <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4.25rem)", lineHeight: 1.05, marginBottom: 16 }}>Roadmaps that connect concepts to actual study assets.</h1>
        <p style={{ color: "#94a3b8", fontSize: 18, lineHeight: 1.6 }}>
          Browse curated learning paths, inspect the dependency graph, and jump straight into roadmap-scoped notes and references.
        </p>
      </header>

      <section style={{ marginTop: 40, display: "grid", gap: 20 }}>
        {roadmaps.map((roadmap) => (
          <Link
            key={roadmap.slug}
            href={`/roadmaps/${roadmap.slug}`}
            style={{
              display: "block",
              padding: 24,
              borderRadius: 26,
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "rgba(15, 23, 42, 0.75)",
              boxShadow: "0 20px 60px rgba(2, 6, 23, 0.24)"
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700 }}>{roadmap.title}</div>
            <p style={{ margin: "10px 0 0", color: "#94a3b8", lineHeight: 1.6 }}>{roadmap.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
