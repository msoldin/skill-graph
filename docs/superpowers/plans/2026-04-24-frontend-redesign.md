# Frontend Redesign: Modern Light Canvas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the frontend to a Miro-style light canvas: full-viewport graph, frosted-glass floating header, overlay topic panel, Tailwind CSS throughout.

**Architecture:** Tailwind replaces all inline styles. `RoadmapCanvas` becomes a full-viewport component wrapping `ReactFlowProvider` + `ReactFlow`, with floating `CanvasHeader` and `EdgeLegend` as absolute-positioned overlays. `TopicPanel` becomes a fixed-width overlay drawer that slides over the canvas (no layout split). Pages become minimal `w-screen h-screen` wrappers.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript strict, React Flow 11, Tailwind CSS 3, `@tailwindcss/typography`, `next/font/google`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/package.json` | Modify | Add Tailwind + typography deps |
| `frontend/tailwind.config.ts` | Create | Tailwind config + custom tokens |
| `frontend/postcss.config.js` | Create | PostCSS config for Tailwind |
| `frontend/src/app/globals.css` | Modify | Tailwind directives + bare reset |
| `frontend/src/app/layout.tsx` | Modify | Inter via next/font, bg-[#fafafa] body |
| `frontend/src/features/roadmaps/components/TopicNode.tsx` | Create | Custom React Flow node component (light) |
| `frontend/src/features/roadmaps/components/RoadmapCanvas.tsx` | Modify | Full-viewport canvas, floating header + legend, overlay panel |
| `frontend/src/features/topics/components/TopicPanel.tsx` | Modify | Overlay drawer with slide animation |
| `frontend/src/features/topics/components/TopicContent.tsx` | Modify | Light card styles, prose markdown |
| `frontend/src/app/roadmaps/page.tsx` | Modify | Catalog redesign with Tailwind |
| `frontend/src/app/roadmaps/[roadmapSlug]/page.tsx` | Modify | Full-viewport wrapper, pass roadmap prop |
| `frontend/src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx` | Modify | Same as above + initialTopicSlug |

---

### Task 1: Install and configure Tailwind CSS

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.js`

- [ ] **Step 1: Install Tailwind and typography plugin**

Run from `frontend/`:
```bash
npm install -D tailwindcss@^3 postcss autoprefixer @tailwindcss/typography
```
Expected: packages added to `node_modules`, versions recorded in `package-lock.json`.

- [ ] **Step 2: Create `frontend/tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#fafafa",
        surface: "#ffffff",
      },
    },
  },
  plugins: [typography],
} satisfies Config;
```

- [ ] **Step 3: Create `frontend/postcss.config.js`**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 4: Verify TypeScript is satisfied**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/tailwind.config.ts frontend/postcss.config.js
git commit -m "chore: add Tailwind CSS and typography plugin"
```

---

### Task 2: Update globals.css and layout.tsx

**Files:**
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/app/layout.tsx`

- [ ] **Step 1: Replace `globals.css` with Tailwind directives and bare reset**

Replace the entire file with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: #fafafa;
  min-height: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 2: Update `layout.tsx` to load Inter via `next/font` and apply it**

Replace the entire file with:
```tsx
import { Inter } from "next/font/google";

import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Skill Graph",
  description: "Roadmaps and study content for backend learning",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-[#fafafa]">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Run existing tests**

Run from `frontend/`:
```bash
npm run test
```
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/globals.css frontend/src/app/layout.tsx
git commit -m "style: add Tailwind directives, load Inter via next/font, light bg"
```

---

### Task 3: Create TopicNode component

**Files:**
- Create: `frontend/src/features/roadmaps/components/TopicNode.tsx`

- [ ] **Step 1: Create `TopicNode.tsx`**

```tsx
import { Handle, Position, type NodeProps } from "reactflow";

import type { GraphNodeData } from "@/lib/types";

export function TopicNode({ data }: NodeProps<GraphNodeData>) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 min-w-[160px] max-w-[200px] cursor-pointer hover:border-blue-400 hover:shadow-md transition-all">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-gray-300 !border-none"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-gray-300 !border-none"
      />
      <div className="flex items-center justify-between gap-2">
        <strong className="text-sm font-semibold text-gray-900 leading-snug">
          {data.label}
        </strong>
        {data.isEntrypoint && (
          <span className="text-xs text-blue-500 border border-blue-200 rounded-full px-2 py-0.5 shrink-0 whitespace-nowrap">
            Entry
          </span>
        )}
      </div>
      {data.contentAvailable ? (
        <div className="mt-1.5 text-xs text-gray-400 leading-snug">
          {data.contentTypes.join(", ")}
        </div>
      ) : (
        <div className="mt-1.5 text-xs text-gray-300">No assets yet</div>
      )}
      {data.groupKey && (
        <div className="mt-1 text-[10px] tracking-wide uppercase text-gray-300">
          {data.groupKey}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/roadmaps/components/TopicNode.tsx
git commit -m "feat: add light-theme TopicNode component for React Flow"
```

---

### Task 4: Redesign RoadmapCanvas

**Files:**
- Modify: `frontend/src/features/roadmaps/components/RoadmapCanvas.tsx`

Key structural changes:
- Wrap with `ReactFlowProvider` so `CanvasHeader` can call `useReactFlow()` from outside `<ReactFlow>`
- `<ReactFlow>` background becomes `#fafafa` with light dot grid
- `CanvasHeader` + `EdgeLegend` are absolute overlays (z-30) outside `<ReactFlow>` but inside provider
- Dimming overlay (z-10) replaces `onPaneClick`
- `TopicPanel` becomes overlay drawer (always rendered, `isOpen` prop controls transform)
- New `roadmap` prop carries title + description for the header badge

- [ ] **Step 1: Replace `RoadmapCanvas.tsx` in full**

```tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

import { TopicNode } from "@/features/roadmaps/components/TopicNode";
import { TopicPanel } from "@/features/topics/components/TopicPanel";
import { getRoadmapGraph } from "@/lib/api";
import type { GraphEdge, GraphNode, GraphNodeData } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type CanvasState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; nodes: Node<GraphNodeData>[]; edges: Edge[] };

const nodeTypes = { topic: TopicNode };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function edgeStyle(relationship: string): React.CSSProperties {
  switch (relationship) {
    case "prerequisite":
      return { stroke: "#3b82f6", strokeWidth: 2 };
    case "related":
      return { stroke: "#8b5cf6", strokeWidth: 1.5, strokeDasharray: "5 3" };
    case "recommended":
      return { stroke: "#10b981", strokeWidth: 2 };
    default:
      return { stroke: "#9ca3af", strokeWidth: 1.5 };
  }
}

function toNode(node: GraphNode): Node<GraphNodeData> {
  return { ...node, draggable: false, selectable: true, data: node.data };
}

function toEdge(edge: GraphEdge): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "default",
    data: edge.data,
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: edgeStyle(edge.data.relationship),
  };
}

function findFirstNode(
  nodes: Node<GraphNodeData>[],
  edges: Edge[]
): Node<GraphNodeData> | null {
  const entrypoint = nodes.find((n) => n.data.isEntrypoint);
  if (entrypoint) return entrypoint;

  const prerequisiteTargets = new Set(
    edges
      .filter(
        (e) =>
          (e.data as { relationship: string }).relationship === "prerequisite"
      )
      .map((e) => e.target)
  );
  const candidates = nodes.filter((n) => !prerequisiteTargets.has(n.id));
  const pool = candidates.length > 0 ? candidates : nodes;
  return pool.reduce<Node<GraphNodeData> | null>((best, n) => {
    if (!best || n.position.y < best.position.y) return n;
    return best;
  }, null);
}

// ─── CanvasHeader ─────────────────────────────────────────────────────────────
// Rendered outside <ReactFlow> but inside <ReactFlowProvider> so useReactFlow works.

interface CanvasHeaderProps {
  roadmap: { title: string; description: string };
  firstNode: Node<GraphNodeData> | null;
  onOpenTopic: (slug: string) => void;
}

function CanvasHeader({ roadmap, firstNode, onOpenTopic }: CanvasHeaderProps) {
  const { fitView } = useReactFlow();

  const handleBegin = useCallback(() => {
    if (!firstNode) return;
    fitView({ nodes: [{ id: firstNode.id }], duration: 600, padding: 0.5 });
    onOpenTopic(firstNode.data.topicSlug);
  }, [firstNode, fitView, onOpenTopic]);

  return (
    <div className="absolute top-6 left-6 z-30 w-72 bg-white/[.82] backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-sm px-5 py-4 pointer-events-auto">
      <Link
        href="/roadmaps"
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        ← All Roadmaps
      </Link>
      <div className="mt-2 text-xl font-semibold text-gray-900 leading-tight">
        {roadmap.title}
      </div>
      <p className="mt-1 text-sm text-gray-500 leading-relaxed line-clamp-3">
        {roadmap.description}
      </p>
      {firstNode && (
        <button
          onClick={handleBegin}
          className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          Begin <span aria-hidden>→</span>
        </button>
      )}
    </div>
  );
}

// ─── EdgeLegend ───────────────────────────────────────────────────────────────

function EdgeLegend() {
  const legendItems = [
    { color: "#3b82f6", label: "Prerequisite", dashed: false },
    { color: "#8b5cf6", label: "Related", dashed: true },
    { color: "#10b981", label: "Recommended", dashed: false },
  ];

  return (
    <div className="absolute bottom-6 right-6 z-30 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl px-3 py-2 flex flex-col gap-1.5 pointer-events-none">
      {legendItems.map(({ color, label, dashed }) => (
        <div key={label} className="flex items-center gap-2 text-xs text-gray-600">
          <span
            style={{
              display: "inline-block",
              width: 20,
              height: 2,
              background: dashed ? "none" : color,
              borderTop: dashed ? `2px dashed ${color}` : "none",
            }}
          />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RoadmapCanvas({
  roadmapSlug,
  roadmap,
  initialTopicSlug,
}: {
  roadmapSlug: string;
  roadmap: { title: string; description: string };
  initialTopicSlug?: string;
}) {
  const [state, setState] = useState<CanvasState>({ status: "loading" });
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(
    initialTopicSlug ?? null
  );

  const openTopic = useCallback(
    (topicSlug: string) => {
      setSelectedTopicSlug(topicSlug);
      window.history.pushState(
        null,
        "",
        `/roadmaps/${roadmapSlug}/topics/${topicSlug}`
      );
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

  const firstNode = useMemo(() => {
    if (state.status !== "ready") return null;
    return findFirstNode(state.nodes, state.edges);
  }, [state]);

  return (
    <ReactFlowProvider>
      <div className="w-full h-full relative">
        {/* Loading state */}
        {state.status === "loading" && (
          <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
            Loading roadmap…
          </div>
        )}

        {/* Error state */}
        {state.status === "error" && (
          <div className="flex items-center justify-center w-full h-full text-red-400 text-sm">
            {state.message}
          </div>
        )}

        {/* Graph */}
        {state.status === "ready" && (
          <ReactFlow
            fitView
            nodes={state.nodes}
            edges={state.edges}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => openTopic(node.data.topicSlug)}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#0000001a" gap={28} size={1.2} />
            <Controls showInteractive={false} />
          </ReactFlow>
        )}

        {/* Floating header overlay — uses useReactFlow, must be inside ReactFlowProvider */}
        {state.status === "ready" && (
          <CanvasHeader
            roadmap={roadmap}
            firstNode={firstNode}
            onOpenTopic={openTopic}
          />
        )}

        {/* Edge legend */}
        {state.status === "ready" && <EdgeLegend />}

        {/* Dimming overlay — shown when panel is open, click to close */}
        {selectedTopicSlug && (
          <div
            className="absolute inset-0 z-10 bg-black/10"
            onClick={closeTopic}
          />
        )}

        {/* Topic panel — always rendered for slide animation */}
        <TopicPanel
          roadmapSlug={roadmapSlug}
          topicSlug={selectedTopicSlug}
          onClose={closeTopic}
          isOpen={!!selectedTopicSlug}
        />
      </div>
    </ReactFlowProvider>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors. If `TopicPanel` props mismatch (it still has the old interface), that will show here — fix in Task 5 first if needed, then re-run.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/roadmaps/components/RoadmapCanvas.tsx
git commit -m "feat: redesign RoadmapCanvas as full-viewport light canvas with floating header"
```

---

### Task 5: Redesign TopicPanel

**Files:**
- Modify: `frontend/src/features/topics/components/TopicPanel.tsx`

Changes: overlay drawer (not flex sibling), `isOpen` + `topicSlug: string | null` props, slide animation via Tailwind `translate-x`, prose content area.

- [ ] **Step 1: Replace `TopicPanel.tsx` in full**

```tsx
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
      className={`absolute top-0 right-0 h-full z-20 w-[480px] max-w-full bg-white border-l border-gray-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <span className="text-xs font-medium uppercase tracking-wider text-blue-500">
          Topic
        </span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none cursor-pointer bg-transparent border-none p-1"
        >
          ×
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {state.status === "idle" && null}

        {state.status === "loading" && (
          <div className="text-gray-400 text-sm">Loading…</div>
        )}

        {state.status === "error" && (
          <div>
            <p className="text-red-400 text-sm mb-3">{state.message}</p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors cursor-pointer bg-transparent"
            >
              Retry
            </button>
          </div>
        )}

        {state.status === "ready" && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 leading-snug mb-2">
              {state.content.topic.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
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

- [ ] **Step 2: Verify TypeScript**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Run tests**

```bash
npm run test
```
Expected: 4 tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/topics/components/TopicPanel.tsx
git commit -m "feat: redesign TopicPanel as overlay drawer with slide animation"
```

---

### Task 6: Redesign TopicContent

**Files:**
- Modify: `frontend/src/features/topics/components/TopicContent.tsx`

Changes: dark card styles → light card styles, `prose prose-gray prose-sm` for markdown.

- [ ] **Step 1: Replace `TopicContent.tsx` in full**

```tsx
import ReactMarkdown from "react-markdown";

import type { TopicAsset } from "@/lib/types";

export function TopicContent({ assets }: { assets: TopicAsset[] }) {
  const orderedAssets = [...assets].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.title.localeCompare(b.title);
  });

  if (orderedAssets.length === 0) {
    return (
      <section className="border border-dashed border-gray-200 rounded-2xl p-6 text-gray-400 text-sm">
        No study assets are attached to this topic yet.
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {orderedAssets.map((asset) => {
        if (asset.type === "markdown" && asset.body) {
          return (
            <article
              key={asset.id}
              className="border border-gray-100 rounded-2xl p-5"
            >
              <div className="text-xs font-medium uppercase tracking-wider text-blue-500 mb-3">
                {asset.title}
              </div>
              <div className="prose prose-gray prose-sm max-w-none">
                <ReactMarkdown>{asset.body}</ReactMarkdown>
              </div>
            </article>
          );
        }

        if (asset.type === "pdf" && asset.url) {
          return (
            <article
              key={asset.id}
              className="border border-gray-100 rounded-2xl p-5"
            >
              <div className="text-xs font-medium uppercase tracking-wider text-emerald-600 mb-2">
                PDF
              </div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                {asset.title}
              </h2>
              <a
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Open PDF asset →
              </a>
            </article>
          );
        }

        return (
          <article
            key={asset.id}
            className="border border-red-200 rounded-2xl p-5 bg-red-50 text-red-500 text-sm"
          >
            Unsupported or incomplete asset: {asset.title}
          </article>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/topics/components/TopicContent.tsx
git commit -m "style: redesign TopicContent with light card styles and prose markdown"
```

---

### Task 7: Redesign catalog page

**Files:**
- Modify: `frontend/src/app/roadmaps/page.tsx`

Changes: light background, centered layout, grid of white cards with hover effects, small top nav bar.

- [ ] **Step 1: Replace `frontend/src/app/roadmaps/page.tsx` in full**

```tsx
import Link from "next/link";

import { getRoadmaps } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function RoadmapsPage() {
  const roadmaps = await getRoadmaps();

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <nav className="border-b border-gray-100 px-6 py-3">
        <span className="text-sm font-semibold text-gray-900">Skill Graph</span>
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Learning Roadmaps
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl">
            Browse curated learning paths, inspect the dependency graph, and jump
            straight into roadmap-scoped notes and references.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {roadmaps.map((roadmap) => (
            <Link
              key={roadmap.slug}
              href={`/roadmaps/${roadmap.slug}`}
              className="group block bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold text-gray-900 leading-snug">
                  {roadmap.title}
                </h2>
                <span className="text-gray-300 group-hover:text-blue-400 transition-colors text-lg shrink-0 mt-0.5">
                  →
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">
                {roadmap.description}
              </p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Run tests**

```bash
npm run test
```
Expected: 4 tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/roadmaps/page.tsx
git commit -m "style: redesign catalog page with light theme and card grid"
```

---

### Task 8: Update roadmap and topic page routes

**Files:**
- Modify: `frontend/src/app/roadmaps/[roadmapSlug]/page.tsx`
- Modify: `frontend/src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx`

Changes: remove old page header (title/description moved into canvas floating badge), make `<main>` full-viewport, pass `roadmap` object to `RoadmapCanvas`.

- [ ] **Step 1: Replace `frontend/src/app/roadmaps/[roadmapSlug]/page.tsx` in full**

```tsx
import { notFound } from "next/navigation";

import { RoadmapCanvas } from "@/features/roadmaps/components/RoadmapCanvas";
import { ApiError, getRoadmap } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function RoadmapPage({
  params,
}: {
  params: { roadmapSlug: string };
}) {
  const { roadmapSlug } = params;

  try {
    const roadmap = await getRoadmap(roadmapSlug);

    return (
      <main className="w-screen h-screen overflow-hidden">
        <RoadmapCanvas roadmapSlug={roadmapSlug} roadmap={roadmap} />
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

- [ ] **Step 2: Replace `frontend/src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx` in full**

```tsx
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
```

- [ ] **Step 3: Verify TypeScript**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Run tests**

Run from `frontend/`:
```bash
npm run test
```
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/roadmaps/[roadmapSlug]/page.tsx \
        frontend/src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx
git commit -m "feat: make roadmap and topic pages full-viewport, pass roadmap prop to canvas"
```

---

## Manual Smoke Tests (after all tasks complete)

Run `docker compose up` and verify:

1. `/roadmaps` — catalog page: white background, card grid, hover effects work, clicking a card navigates to canvas
2. `/roadmaps/[slug]` — full-viewport canvas: off-white background, dot grid, floating header badge top-left shows title + description + "Begin →", edge legend bottom-right
3. "Begin →" click — graph pans/zooms to first/entrypoint node and opens topic panel
4. Click any node — panel slides in from right, canvas dims slightly
5. Click dimming overlay or `×` — panel slides out
6. Browser back/forward — panel opens/closes correctly
7. Navigate directly to `/roadmaps/[slug]/topics/[topicSlug]` — panel pre-opened on load
8. "← All Roadmaps" link in header badge — navigates to catalog
