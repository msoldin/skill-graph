# Dark Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dark mode (warm stone palette) to the skill-graph frontend with OS preference detection, manual toggle, and localStorage persistence.

**Architecture:** Install `next-themes` to manage the `dark` class on `<html>` and persist user preference. Add `darkMode: "class"` to Tailwind config. Systematically add `dark:` variant classes to all 5 components. Handle the 4 inline ReactFlow edge stroke colors via `useTheme()` in `RoadmapCanvas`.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS v3, `next-themes`, `lucide-react`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `frontend/package.json` | Add `next-themes`, `lucide-react` |
| Modify | `frontend/tailwind.config.ts` | Add `darkMode: "class"`, dark color tokens |
| Modify | `frontend/src/app/globals.css` | Dark `body` background override |
| Modify | `frontend/src/app/layout.tsx` | Wrap with `ThemeProvider`, `suppressHydrationWarning` |
| **Create** | `frontend/src/components/ThemeToggle.tsx` | Sun/moon toggle button |
| Modify | `frontend/src/app/roadmaps/page.tsx` | Dark variants on nav/cards/background, add `ThemeToggle` |
| Modify | `frontend/src/features/roadmaps/components/TopicNode.tsx` | Dark variants on card/text/borders |
| Modify | `frontend/src/features/topics/components/TopicPanel.tsx` | Dark variants on panel/header/text/borders |
| Modify | `frontend/src/features/topics/components/TopicContent.tsx` | `dark:prose-invert`, dark error state |
| Modify | `frontend/src/features/roadmaps/components/RoadmapCanvas.tsx` | `useTheme` for edge colors, dark header/legend, add `ThemeToggle` |

---

## Task 1: Install packages

**Files:**
- Modify: `frontend/package.json` (via npm install)

- [ ] **Step 1: Install `next-themes` and `lucide-react`**

Run from `frontend/`:
```bash
npm install next-themes lucide-react
```
Expected: Both packages added to `node_modules` and `package.json` `dependencies`.

- [ ] **Step 2: Verify packages are in `package.json`**

Run:
```bash
grep -E '"next-themes"|"lucide-react"' frontend/package.json
```
Expected output (versions may differ):
```
"lucide-react": "^0.x.x",
"next-themes": "^0.x.x",
```

- [ ] **Step 3: Commit**

```bash
cd frontend && git add package.json package-lock.json && cd .. && git commit -m "chore: install next-themes and lucide-react for dark mode"
```

---

## Task 2: Configure Tailwind for dark mode

**Files:**
- Modify: `frontend/tailwind.config.ts`

- [ ] **Step 1: Replace `tailwind.config.ts` with dark mode config**

Replace the entire file contents with:
```ts
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#f0ede8",
          dark: "#0c0a09",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#292524",
        },
        panel: {
          DEFAULT: "#faf9f7",
          dark: "#1c1917",
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
```

- [ ] **Step 2: Verify build still compiles**

Run from `frontend/`:
```bash
npm run build 2>&1 | tail -5
```
Expected: ends with `✓ Compiled successfully` or similar — no type errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/tailwind.config.ts && git commit -m "feat: add darkMode class config and dark color tokens to Tailwind"
```

---

## Task 3: Update globals.css for dark body background

**Files:**
- Modify: `frontend/src/app/globals.css`

- [ ] **Step 1: Add dark mode overrides to `globals.css`**

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
  background: #f0ede8;
  min-height: 100%;
}

.dark body {
  background: #0c0a09;
}

a {
  color: inherit;
  text-decoration: none;
}

.topic-node,
.catalog-card {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.10);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.topic-node:hover,
.catalog-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.dark .topic-node,
.dark .catalog-card {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.40);
}

.dark .topic-node:hover,
.dark .catalog-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.55);
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/globals.css && git commit -m "feat: add dark mode body background and shadow overrides in globals.css"
```

---

## Task 4: Wrap app with ThemeProvider

**Files:**
- Modify: `frontend/src/app/layout.tsx`

- [ ] **Step 1: Update `layout.tsx`**

Replace the entire file with:
```tsx
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";

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
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Note: `suppressHydrationWarning` on `<html>` is required because `next-themes` injects the `dark` class before hydration, causing a mismatch without it. The hardcoded `bg-[#fafafa]` is removed from `<body>` — `globals.css` now controls background color for both themes.

- [ ] **Step 2: Verify build**

Run from `frontend/`:
```bash
npm run build 2>&1 | tail -5
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/layout.tsx && git commit -m "feat: wrap app in ThemeProvider for dark mode support"
```

---

## Task 5: Create ThemeToggle component

**Files:**
- Create: `frontend/src/components/ThemeToggle.tsx`

- [ ] **Step 1: Create `src/components/ThemeToggle.tsx`**

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: only render icon after client mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a same-size invisible placeholder to avoid layout shift
    return <div className="w-8 h-8" aria-hidden />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
    >
      {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
```

- [ ] **Step 2: Verify build**

Run from `frontend/`:
```bash
npm run build 2>&1 | tail -5
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ThemeToggle.tsx && git commit -m "feat: add ThemeToggle component (sun/moon button)"
```

---

## Task 6: Update catalog page with dark mode

**Files:**
- Modify: `frontend/src/app/roadmaps/page.tsx`

- [ ] **Step 1: Replace `roadmaps/page.tsx`**

```tsx
import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";
import { getRoadmaps } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function RoadmapsPage() {
  const roadmaps = await getRoadmaps();

  return (
    <div className="min-h-screen bg-[#f0ede8] dark:bg-stone-950">
      {/* Top nav */}
      <nav className="bg-white dark:bg-stone-900 border-b border-gray-200 dark:border-stone-700 px-6 py-3 shadow-sm flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-stone-100">Skill Graph</span>
        <ThemeToggle />
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-950 dark:text-stone-100 mb-2">
            Learning Roadmaps
          </h1>
          <p className="text-gray-600 dark:text-stone-400 text-base leading-relaxed max-w-xl">
            Browse curated learning paths, inspect the dependency graph, and jump
            straight into roadmap-scoped notes and references.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {roadmaps.map((roadmap) => (
            <Link
              key={roadmap.slug}
              href={`/roadmaps/${roadmap.slug}`}
              className="group block bg-white dark:bg-stone-800 rounded-2xl p-6 catalog-card"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold text-gray-950 dark:text-stone-100 leading-snug">
                  {roadmap.title}
                </h2>
                <span className="text-gray-300 dark:text-stone-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors text-lg shrink-0 mt-0.5">
                  →
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-stone-400 leading-relaxed line-clamp-2">
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

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -5
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/roadmaps/page.tsx && git commit -m "feat: add dark mode to catalog page"
```

---

## Task 7: Update TopicNode with dark mode

**Files:**
- Modify: `frontend/src/features/roadmaps/components/TopicNode.tsx`

- [ ] **Step 1: Replace `TopicNode.tsx`**

```tsx
import { Handle, Position, type NodeProps } from "reactflow";

import type { GraphNodeData } from "@/lib/types";

export function TopicNode({ data }: NodeProps<GraphNodeData>) {
  return (
    <div className="topic-node bg-white dark:bg-stone-800 rounded-2xl px-5 py-3 min-w-[172px] max-w-[220px] cursor-pointer transition-all">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-gray-300 dark:!bg-stone-600 !border-none"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-gray-300 dark:!bg-stone-600 !border-none"
      />
      <div className="flex items-center justify-between gap-2">
        <strong className="text-sm font-semibold text-gray-950 dark:text-stone-100 leading-snug">
          {data.label}
        </strong>
        {data.isEntrypoint && (
          <span className="text-xs text-blue-500 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5 shrink-0 whitespace-nowrap">
            Entry
          </span>
        )}
      </div>
      {data.contentAvailable ? (
        <div className="mt-1.5 text-xs text-gray-500 dark:text-stone-400 leading-snug">
          {data.contentTypes.join(", ")}
        </div>
      ) : (
        <div className="mt-1.5 text-xs text-gray-400 dark:text-stone-500">No assets yet</div>
      )}
      {data.groupKey && (
        <div className="mt-1 text-[10px] tracking-wide uppercase text-gray-400 dark:text-stone-500 font-medium">
          {data.groupKey}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -5
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/roadmaps/components/TopicNode.tsx && git commit -m "feat: add dark mode to TopicNode"
```

---

## Task 8: Update TopicPanel with dark mode

**Files:**
- Modify: `frontend/src/features/topics/components/TopicPanel.tsx`

- [ ] **Step 1: Replace `TopicPanel.tsx`**

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
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -5
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/topics/components/TopicPanel.tsx && git commit -m "feat: add dark mode to TopicPanel"
```

---

## Task 9: Update TopicContent with dark mode

**Files:**
- Modify: `frontend/src/features/topics/components/TopicContent.tsx`

- [ ] **Step 1: Replace `TopicContent.tsx`**

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
      <section className="border border-dashed border-gray-200 dark:border-stone-700 rounded-2xl p-6 text-gray-400 dark:text-stone-500 text-sm">
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
              className="border border-gray-100 dark:border-stone-800 rounded-2xl p-5"
            >
              <div className="text-xs font-medium uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-3">
                {asset.title}
              </div>
              <div className="prose prose-gray prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{asset.body}</ReactMarkdown>
              </div>
            </article>
          );
        }

        if (asset.type === "pdf" && asset.url) {
          return (
            <article
              key={asset.id}
              className="border border-gray-100 dark:border-stone-800 rounded-2xl p-5"
            >
              <div className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                PDF
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-stone-100 mb-2">
                {asset.title}
              </h2>
              <a
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Open PDF asset →
              </a>
            </article>
          );
        }

        return (
          <article
            key={asset.id}
            className="border border-red-200 dark:border-red-800 rounded-2xl p-5 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 text-sm"
          >
            Unsupported or incomplete asset: {asset.title}
          </article>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -5
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/topics/components/TopicContent.tsx && git commit -m "feat: add dark mode to TopicContent (prose-invert, dark borders, dark error state)"
```

---

## Task 10: Update RoadmapCanvas with dark mode and ThemeToggle

This is the most complex task. `edgeStyle` uses hardcoded inline hex colors that Tailwind can't reach — we solve this by making `edgeStyle` accept an `isDark` boolean and wiring `useTheme()` into the component.

**Files:**
- Modify: `frontend/src/features/roadmaps/components/RoadmapCanvas.tsx`

- [ ] **Step 1: Replace `RoadmapCanvas.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
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

import { ThemeToggle } from "@/components/ThemeToggle";
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

function edgeStyle(relationship: string, isDark: boolean): React.CSSProperties {
  const colors = isDark
    ? { prerequisite: "#60a5fa", related: "#a78bfa", recommended: "#34d399", fallback: "#6b7280" }
    : { prerequisite: "#3b82f6", related: "#8b5cf6", recommended: "#10b981", fallback: "#9ca3af" };

  switch (relationship) {
    case "prerequisite":
      return { stroke: colors.prerequisite, strokeWidth: 2.5 };
    case "related":
      return { stroke: colors.related, strokeWidth: 2, strokeDasharray: "5 3" };
    case "recommended":
      return { stroke: colors.recommended, strokeWidth: 2.5 };
    default:
      return { stroke: colors.fallback, strokeWidth: 2 };
  }
}

function toNode(node: GraphNode): Node<GraphNodeData> {
  return { ...node, draggable: false, selectable: true, data: node.data };
}

function toEdge(edge: GraphEdge, isDark: boolean): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "default",
    data: edge.data,
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10 },
    style: edgeStyle(edge.data.relationship, isDark),
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
    <div className="absolute top-6 left-6 z-30 w-72 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-gray-300/70 dark:border-stone-700/70 rounded-2xl shadow-sm px-5 py-4 pointer-events-auto">
      <div className="flex items-center justify-between mb-1">
        <Link
          href="/roadmaps"
          className="text-xs text-gray-500 dark:text-stone-400 hover:text-gray-700 dark:hover:text-stone-200 transition-colors"
        >
          ← All Roadmaps
        </Link>
        <ThemeToggle />
      </div>
      <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-stone-100 leading-tight">
        {roadmap.title}
      </div>
      <p className="mt-1 text-sm text-gray-500 dark:text-stone-400 leading-relaxed line-clamp-3">
        {roadmap.description}
      </p>
      {firstNode && (
        <button
          onClick={handleBegin}
          className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          Begin <span aria-hidden>→</span>
        </button>
      )}
    </div>
  );
}

// ─── EdgeLegend ───────────────────────────────────────────────────────────────

interface EdgeLegendProps {
  isDark: boolean;
}

function EdgeLegend({ isDark }: EdgeLegendProps) {
  const legendItems = isDark
    ? [
        { color: "#60a5fa", label: "Prerequisite", dashed: false },
        { color: "#a78bfa", label: "Related", dashed: true },
        { color: "#34d399", label: "Recommended", dashed: false },
      ]
    : [
        { color: "#3b82f6", label: "Prerequisite", dashed: false },
        { color: "#8b5cf6", label: "Related", dashed: true },
        { color: "#10b981", label: "Recommended", dashed: false },
      ];

  return (
    <div className="absolute bottom-6 right-6 z-30 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-gray-200/60 dark:border-stone-700/60 rounded-xl px-3 py-2 flex flex-col gap-1.5 pointer-events-none">
      {legendItems.map(({ color, label, dashed }) => (
        <div key={label} className="flex items-center gap-2 text-xs text-gray-600 dark:text-stone-400">
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [rawGraph, setRawGraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
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
        if (!cancelled) setRawGraph(graph);
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, [roadmapSlug]);

  // Recompute edges when theme changes so inline stroke colors update
  const state = useMemo<CanvasState>(() => {
    if (loadError) return { status: "error", message: loadError };
    if (!rawGraph) return { status: "loading" };
    return {
      status: "ready",
      nodes: rawGraph.nodes.map(toNode),
      edges: rawGraph.edges.map((e) => toEdge(e, isDark)),
    };
  }, [rawGraph, loadError, isDark]);

  const firstNode = useMemo(() => {
    if (state.status !== "ready") return null;
    return findFirstNode(state.nodes, state.edges);
  }, [state]);

  return (
    <ReactFlowProvider>
      <div className="w-full h-full relative">
        {/* Loading state */}
        {state.status === "loading" && (
          <div className="flex items-center justify-center w-full h-full text-gray-400 dark:text-stone-500 text-sm">
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
            <Background color={isDark ? "#ffffff18" : "#00000026"} gap={28} size={1.4} />
            <Controls showInteractive={false} />
          </ReactFlow>
        )}

        {/* Floating header overlay */}
        {state.status === "ready" && (
          <CanvasHeader
            roadmap={roadmap}
            firstNode={firstNode}
            onOpenTopic={openTopic}
          />
        )}

        {/* Edge legend */}
        {state.status === "ready" && <EdgeLegend isDark={isDark} />}

        {/* Dimming overlay */}
        {selectedTopicSlug && (
          <div
            className="absolute inset-0 z-10 bg-black/10 dark:bg-black/30"
            onClick={closeTopic}
          />
        )}

        {/* Topic panel */}
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

Note: The original `CanvasState` union type was used to track loading/error/ready. In this refactor, `rawGraph` and `loadError` are stored separately so edges can be recomputed from the raw data when the theme changes (without re-fetching). The `state` `useMemo` now depends on both `rawGraph` and `isDark`.

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -5
```
Expected: no errors.

- [ ] **Step 3: Run existing tests**

```bash
cd frontend && npm run test
```
Expected: all tests pass (tests cover `api.ts` and proxy route — unaffected by this change).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/roadmaps/components/RoadmapCanvas.tsx && git commit -m "feat: add dark mode to RoadmapCanvas with theme-aware edge colors"
```

---

## Manual Verification Checklist

After all tasks are complete, run `npm run dev` from `frontend/` and verify:

- [ ] Toggle button (sun/moon) appears in the catalog page nav bar and canvas floating header
- [ ] Clicking the toggle switches theme; `<html class="dark">` appears/disappears in browser DevTools
- [ ] Hard reload preserves the chosen theme (check `localStorage` key `theme`)
- [ ] Opening in a browser with OS dark mode active defaults to dark without manual toggle
- [ ] Opening in a browser with OS light mode active defaults to light
- [ ] **Catalog page:** nav bar, cards, heading, body background all render correctly in both modes
- [ ] **Roadmap canvas:** floating header, edge legend, node cards, dot background update with theme
- [ ] **ReactFlow edge colors:** prerequisite (blue), related (purple), recommended (green) are visible in both modes
- [ ] **Topic panel:** slide-in panel background, header, text, borders all render correctly
- [ ] **Topic content (markdown):** `prose-invert` makes markdown readable in dark mode
- [ ] **Topic content (PDF):** PDF link and header render correctly in dark mode
- [ ] **Error state:** unsupported asset card renders dark-red in dark mode
- [ ] No flash of unstyled content (FOUC) on hard reload in either mode
- [ ] ThemeToggle placeholder renders at correct size before client mount (no layout shift)
