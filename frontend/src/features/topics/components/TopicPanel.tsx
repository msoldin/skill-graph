"use client";

import { useEffect, useState } from "react";

import { TopicContent } from "@/features/topics/components/TopicContent";
import { getTopicContent } from "@/lib/api";
import type { TopicContent as TopicContentType } from "@/lib/types";

type PanelState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; content: TopicContentType };

interface TopicPanelProps {
  roadmapSlug: string;
  /** null when panel is closed */
  topicSlug: string | null;
  onClose: () => void;
  isOpen: boolean;
}

export function TopicPanel({
  roadmapSlug,
  topicSlug,
  onClose,
  isOpen,
}: TopicPanelProps) {
  const [state, setState] = useState<PanelState>({ status: "idle" });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!topicSlug || !isOpen) return;

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
  }, [roadmapSlug, topicSlug, isOpen, retryCount]);

  return (
    <aside
      className={`absolute top-0 right-0 h-full z-20 w-[480px] max-w-full bg-[#faf9f7] dark:bg-stone-900 border-l-2 border-gray-200 dark:border-stone-700 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ boxShadow: "-4px 0 24px rgba(0,0,0,0.10)" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-stone-800 shrink-0">
        <span className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Topic
        </span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-300 transition-colors text-xl leading-none cursor-pointer bg-transparent border-none p-1"
        >
          ×
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {state.status === "idle" && null}

        {state.status === "loading" && (
          <div className="text-gray-400 dark:text-stone-500 text-sm">Loading…</div>
        )}

        {state.status === "error" && (
          <div>
            <p className="text-red-400 text-sm mb-3">{state.message}</p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="text-sm text-gray-500 dark:text-stone-400 border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-1.5 hover:border-gray-300 dark:hover:border-stone-600 transition-colors cursor-pointer bg-transparent"
            >
              Retry
            </button>
          </div>
        )}

        {state.status === "ready" && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100 leading-snug mb-2">
              {state.content.topic.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-stone-400 leading-relaxed mb-5">
              {state.content.topic.summary}
            </p>
            <TopicContent assets={state.content.assets} />
          </>
        )}
      </div>
    </aside>
  );
}
