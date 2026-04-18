import ReactMarkdown from "react-markdown";

import type { TopicAsset } from "@/lib/types";

export function TopicContent({ assets }: { assets: TopicAsset[] }) {
  const orderedAssets = [...assets].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    return left.title.localeCompare(right.title);
  });

  if (orderedAssets.length === 0) {
    return (
      <section style={{ border: "1px dashed rgba(148, 163, 184, 0.28)", borderRadius: 20, padding: 24, color: "#94a3b8" }}>
        No study assets are attached to this topic yet.
      </section>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {orderedAssets.map((asset) => {
        if (asset.type === "markdown" && asset.body) {
          return (
            <article key={asset.id} style={{ background: "rgba(15, 23, 42, 0.72)", border: "1px solid rgba(148, 163, 184, 0.18)", borderRadius: 24, padding: 24 }}>
              <div style={{ color: "#38bdf8", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 }}>{asset.title}</div>
              <div style={{ marginTop: 16, lineHeight: 1.7 }}>
                <ReactMarkdown>{asset.body}</ReactMarkdown>
              </div>
            </article>
          );
        }

        if (asset.type === "pdf" && asset.url) {
          return (
            <article key={asset.id} style={{ background: "rgba(15, 23, 42, 0.72)", border: "1px solid rgba(148, 163, 184, 0.18)", borderRadius: 24, padding: 24 }}>
              <div style={{ color: "#34d399", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 }}>PDF</div>
              <h2 style={{ marginBottom: 10 }}>{asset.title}</h2>
              <a href={asset.url} target="_blank" rel="noreferrer" style={{ color: "#e2e8f0", textDecoration: "underline" }}>
                Open PDF asset
              </a>
            </article>
          );
        }

        return (
          <article key={asset.id} style={{ background: "rgba(69, 10, 10, 0.4)", border: "1px solid rgba(248, 113, 113, 0.35)", borderRadius: 24, padding: 24, color: "#fecaca" }}>
            Unsupported or incomplete asset: {asset.title}
          </article>
        );
      })}
    </div>
  );
}
