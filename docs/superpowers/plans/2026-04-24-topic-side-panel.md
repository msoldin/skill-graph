# Topic Side Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace full-page topic navigation with an in-page side panel that opens alongside the roadmap graph when a topic node is clicked.

**Architecture:** `RoadmapCanvas` gains a `selectedTopicSlug` state and manages URL via `window.history.pushState` (avoiding Next.js remount). A new `TopicPanel` client component renders topic content fetched client-side. The existing topic page route is repurposed to render the roadmap+panel, enabling direct URL navigation.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript (strict), React Flow, existing `getTopicContent` API call from `src/lib/api.ts`.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/src/features/topics/components/TopicPanel.tsx` | **Create** | Fetches and renders topic content in the panel |
| `frontend/src/features/roadmaps/components/RoadmapCanvas.tsx` | **Modify** | Adds panel state, split layout, URL management |
| `frontend/src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx` | **Modify** | Repurposed to render roadmap+panel for direct URL navigation |

---

## Task 1: Create `TopicPanel` component

**Files:**
- Create: `frontend/src/features/topics/components/TopicPanel.tsx`

The project has no React component test infrastructure (no jsdom, no testing-library). Manual verification steps are provided.

- [ ] **Step 1: Create `TopicPanel.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors related to `TopicPanel.tsx`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/topics/components/TopicPanel.tsx
git commit -m "feat: add TopicPanel component for side panel topic view"
```

---

## Task 2: Update `RoadmapCanvas` for split layout and URL management

**Files:**
- Modify: `frontend/src/features/roadmaps/components/RoadmapCanvas.tsx`

- [ ] **Step 1: Replace the entire file contents**

Replace `frontend/src/features/roadmaps/components/RoadmapCanvas.tsx` with:

```tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";

import { TopicPanel } from "@/features/topics/components/TopicPanel";
import { getRoadmapGraph } from "@/lib/api";
import type { GraphEdge, GraphNode, GraphNodeData } from "@/lib/types";

type CanvasState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; nodes: Node<GraphNodeData>[]; edges: Edge[] };

function TopicNode({ data }: NodeProps<GraphNodeData>) {
  return (
    <div
      style={{
        minWidth: 190,
        border: "1px solid rgba(148, 163, 184, 0.35)",
        borderRadius: 18,
        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.9))",
        boxShadow: "0 14px 40px rgba(15, 23, 42, 0.35)",
        padding: "14px 16px",
        color: "#e2e8f0",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#64748b", border: "none", width: 6, height: 6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#64748b", border: "none", width: 6, height: 6 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <strong style={{ fontSize: 15, lineHeight: 1.3 }}>{data.label}</strong>
        {data.isEntrypoint ? (
          <span
            style={{
              fontSize: 11,
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              borderRadius: 999,
              padding: "3px 8px",
            }}
          >
            Entry
          </span>
        ) : null}
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
        {data.contentAvailable ? `Assets: ${data.contentTypes.join(", ")}` : "No study assets yet"}
      </div>
      {data.groupKey ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          {data.groupKey}
        </div>
      ) : null}
    </div>
  );
}

const nodeTypes = {
  topic: TopicNode,
};

const edgePalette: Record<string, string> = {
  prerequisite: "#38bdf8",
  related: "#a78bfa",
  recommended: "#34d399",
};

function toNode(node: GraphNode): Node<GraphNodeData> {
  return {
    ...node,
    draggable: false,
    selectable: true,
    data: node.data,
  };
}

function toEdge(edge: GraphEdge): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "default",
    data: edge.data,
    animated: edge.data.relationship === "recommended",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: {
      stroke: edgePalette[edge.data.relationship] ?? "#94a3b8",
      strokeWidth: edge.data.relationship === "prerequisite" ? 2.5 : 2,
    },
  };
}

export function RoadmapCanvas({
  roadmapSlug,
  initialTopicSlug,
}: {
  roadmapSlug: string;
  initialTopicSlug?: string;
}) {
  const [state, setState] = useState<CanvasState>({ status: "loading" });
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(
    initialTopicSlug ?? null
  );

  const openTopic = useCallback(
    (topicSlug: string) => {
      setSelectedTopicSlug(topicSlug);
      window.history.pushState(null, "", `/roadmaps/${roadmapSlug}/topics/${topicSlug}`);
    },
    [roadmapSlug]
  );

  const closeTopic = useCallback(() => {
    setSelectedTopicSlug(null);
    window.history.pushState(null, "", `/roadmaps/${roadmapSlug}`);
  }, [roadmapSlug]);

  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/\/topics\/([^/]+)$/);
      setSelectedTopicSlug(match ? match[1] : null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    let cancelled = false;

    getRoadmapGraph(roadmapSlug)
      .then((graph) => {
        if (cancelled) return;
        setState({
          status: "ready",
          nodes: graph.nodes.map(toNode),
          edges: graph.edges.map(toEdge),
        });
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setState({ status: "error", message: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [roadmapSlug]);

  const graphContent = useMemo(() => {
    if (state.status === "loading") {
      return <div style={{ padding: 32, color: "#94a3b8" }}>Loading roadmap graph...</div>;
    }

    if (state.status === "error") {
      return <div style={{ padding: 32, color: "#fca5a5" }}>{state.message}</div>;
    }

    return (
      <ReactFlow
        fitView
        nodes={state.nodes}
        edges={state.edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => openTopic(node.data.topicSlug)}
        onPaneClick={closeTopic}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(148, 163, 184, 0.18)" gap={28} />
        <Controls showInteractive={false} />
      </ReactFlow>
    );
  }, [state, openTopic, closeTopic]);

  return (
    <section
      style={{
        marginTop: 24,
        border: "1px solid rgba(148, 163, 184, 0.2)",
        borderRadius: 28,
        overflow: "hidden",
        background: "rgba(2, 6, 23, 0.72)",
        height: "70vh",
        minHeight: 620,
        display: "flex",
      }}
    >
      <div style={{ flex: selectedTopicSlug ? "0 0 60%" : "1 1 100%" }}>{graphContent}</div>
      {selectedTopicSlug && (
        <TopicPanel
          roadmapSlug={roadmapSlug}
          topicSlug={selectedTopicSlug}
          onClose={closeTopic}
        />
      )}
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Start the dev server (`npm run dev` in `frontend/`) with the backend running. Navigate to any roadmap page. Click a topic node. Verify:
- Panel appears on the right (~40% width)
- Graph is still visible and interactive on the left
- URL in address bar changes to `/roadmaps/[slug]/topics/[topicSlug]`
- Topic title, summary, and assets render in the panel
- Clicking empty canvas space closes the panel
- Clicking the × button closes the panel
- URL returns to `/roadmaps/[slug]` after close
- Browser back button re-opens the panel (URL goes back, popstate fires)
- Clicking a different node while panel is open updates the panel content and URL

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/roadmaps/components/RoadmapCanvas.tsx
git commit -m "feat: open topic content in side panel instead of navigating to new page"
```

---

## Task 3: Repurpose topic page route for direct URL navigation

**Files:**
- Modify: `frontend/src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx`

- [ ] **Step 1: Replace file contents**

Replace `frontend/src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx` with:

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Manual smoke test for direct URL navigation**

With the dev server running, navigate directly to a topic URL, e.g. `http://localhost:3000/roadmaps/[slug]/topics/[topicSlug]`. Verify:
- Roadmap graph loads with the topic panel already open
- Panel shows the correct topic content
- Closing the panel (× or pane click) updates URL to `/roadmaps/[slug]`
- Panel stays open and functional (back button works to re-open)

- [ ] **Step 4: Run the frontend test suite**

Run from `frontend/`:
```bash
npm run test
```
Expected: both existing tests pass (`api.test.ts`, `proxy-route.test.ts`).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx
git commit -m "feat: repurpose topic route to render roadmap graph with panel pre-opened"
```
