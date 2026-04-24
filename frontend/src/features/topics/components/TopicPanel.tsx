"use client";

import { useEffect, useState } from "react";

import { TopicContent } from "@/features/topics/components/TopicContent";
import { getTopicContent } from "@/lib/api";
import type { TopicContent as TopicContentType } from "@/lib/types";

type PanelState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; content: TopicContentType };

interface TopicPanelProps {
  roadmapSlug: string;
  topicSlug: string;
  onClose: () => void;
}

export function TopicPanel({ roadmapSlug, topicSlug, onClose }: TopicPanelProps) {
  const [state, setState] = useState<PanelState>({ status: "loading" });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    getTopicContent(roadmapSlug, topicSlug)
      .then((content) => {
        if (!cancelled) setState({ status: "ready", content });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: "error", message: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [roadmapSlug, topicSlug, retryCount]);

  return (
    <aside
      style={{
        width: "40%",
        borderLeft: "1px solid rgba(148, 163, 184, 0.2)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "rgba(2, 6, 23, 0.95)",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
          flexShrink: 0,
        }}
      >
        <span
          style={{ color: "#38bdf8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}
        >
          Topic
        </span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: 20,
            lineHeight: 1,
            padding: "2px 6px",
          }}
        >
          ×
        </button>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {state.status === "loading" && (
          <div style={{ color: "#94a3b8" }}>Loading...</div>
        )}

        {state.status === "error" && (
          <div>
            <p style={{ color: "#fca5a5", marginBottom: 12 }}>{state.message}</p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              style={{
                background: "none",
                border: "1px solid rgba(148, 163, 184, 0.35)",
                borderRadius: 8,
                color: "#94a3b8",
                cursor: "pointer",
                padding: "6px 14px",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {state.status === "ready" && (
          <>
            <h2
              style={{
                fontSize: "clamp(1.25rem, 2vw, 1.75rem)",
                lineHeight: 1.2,
                marginBottom: 10,
              }}
            >
              {state.content.topic.title}
            </h2>
            <p
              style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}
            >
              {state.content.topic.summary}
            </p>
            <TopicContent assets={state.content.assets} />
          </>
        )}
      </div>
    </aside>
  );
}
