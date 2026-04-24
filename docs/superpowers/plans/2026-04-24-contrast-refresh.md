# Contrast Refresh: Miro-Style Design — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve visual contrast across canvas, nodes, edges, and topic panel to achieve Miro-like depth and clarity.

**Architecture:** Pure CSS/Tailwind value changes across 6 files. No structural, behavioral, or API changes. A new `.topic-node` CSS class handles the hover shadow that inline styles can't express. Tasks are ordered so each builds on the last — color tokens first, then consumers.

**Tech Stack:** Next.js 14, Tailwind CSS 3, React Flow 11

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `frontend/src/app/globals.css` | Modify | Add `.topic-node` hover CSS rule; update `body` bg |
| `frontend/tailwind.config.ts` | Modify | Add `warm` and `panel` color tokens |
| `frontend/src/features/roadmaps/components/TopicNode.tsx` | Modify | Shadow class, typography, sizing |
| `frontend/src/features/roadmaps/components/RoadmapCanvas.tsx` | Modify | Edge weights, marker size, grid, header badge |
| `frontend/src/features/topics/components/TopicPanel.tsx` | Modify | Background, border weight, shadow, label color |
| `frontend/src/app/roadmaps/page.tsx` | Modify | Page bg, nav bg, card shadow |

---

### Task 1: Update globals.css and Tailwind color tokens

**Files:**
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/tailwind.config.ts`

- [ ] **Step 1: Add warm canvas bg and `.topic-node` hover rule to `globals.css`**

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

a {
  color: inherit;
  text-decoration: none;
}

.topic-node {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.10);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.topic-node:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}
```

- [ ] **Step 2: Add color tokens to `tailwind.config.ts`**

Replace the entire file with:

```ts
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f0ede8",
        surface: "#ffffff",
        panel: "#faf9f7",
      },
    },
  },
  plugins: [typography],
} satisfies Config;
```

- [ ] **Step 3: Verify TypeScript**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/globals.css frontend/tailwind.config.ts
git commit -m "style: warm canvas background and topic-node hover CSS"
```

---

### Task 2: Redesign TopicNode

**Files:**
- Modify: `frontend/src/features/roadmaps/components/TopicNode.tsx`

- [ ] **Step 1: Replace `TopicNode.tsx` in full**

```tsx
import { Handle, Position, type NodeProps } from "reactflow";

import type { GraphNodeData } from "@/lib/types";

export function TopicNode({ data }: NodeProps<GraphNodeData>) {
  return (
    <div className="topic-node bg-white rounded-2xl px-5 py-3 min-w-[172px] max-w-[220px] cursor-pointer transition-all">
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
        <strong className="text-sm font-semibold text-gray-950 leading-snug">
          {data.label}
        </strong>
        {data.isEntrypoint && (
          <span className="text-xs text-blue-500 border border-blue-200 rounded-full px-2 py-0.5 shrink-0 whitespace-nowrap">
            Entry
          </span>
        )}
      </div>
      {data.contentAvailable ? (
        <div className="mt-1.5 text-xs text-gray-500 leading-snug">
          {data.contentTypes.join(", ")}
        </div>
      ) : (
        <div className="mt-1.5 text-xs text-gray-400">No assets yet</div>
      )}
      {data.groupKey && (
        <div className="mt-1 text-[10px] tracking-wide uppercase text-gray-400 font-medium">
          {data.groupKey}
        </div>
      )}
    </div>
  );
}
```

Key changes from previous version:
- `border border-gray-200` removed — shadow-only depth
- `shadow-sm` removed — `.topic-node` CSS class provides shadow + hover
- `px-4` → `px-5`, `min-w-[160px] max-w-[200px]` → `min-w-[172px] max-w-[220px]`
- `text-gray-900` → `text-gray-950` on label
- `text-gray-400` → `text-gray-500` on content types
- `text-gray-300` → `text-gray-400` on "No assets yet"
- Group key: `text-gray-300` → `text-gray-400 font-medium`

- [ ] **Step 2: Verify TypeScript**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/roadmaps/components/TopicNode.tsx
git commit -m "style: node shadow-depth, warmer text hierarchy, wider card"
```

---

### Task 3: Update RoadmapCanvas (edges, grid, header badge)

**Files:**
- Modify: `frontend/src/features/roadmaps/components/RoadmapCanvas.tsx`

Three independent changes in this file: `edgeStyle`, `<Background>`, and `CanvasHeader` JSX.

- [ ] **Step 1: Update `edgeStyle` function**

Find and replace the `edgeStyle` function:

```tsx
function edgeStyle(relationship: string): React.CSSProperties {
  switch (relationship) {
    case "prerequisite":
      return { stroke: "#3b82f6", strokeWidth: 2.5 };
    case "related":
      return { stroke: "#8b5cf6", strokeWidth: 2, strokeDasharray: "5 3" };
    case "recommended":
      return { stroke: "#10b981", strokeWidth: 2.5 };
    default:
      return { stroke: "#9ca3af", strokeWidth: 2 };
  }
}
```

- [ ] **Step 2: Update `toEdge` to use larger arrow markers**

Find and replace the `toEdge` function:

```tsx
function toEdge(edge: GraphEdge): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "default",
    data: edge.data,
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10 },
    style: edgeStyle(edge.data.relationship),
  };
}
```

- [ ] **Step 3: Update `<Background>` dot grid**

Find:
```tsx
<Background color="#0000001a" gap={28} size={1.2} />
```
Replace with:
```tsx
<Background color="#00000026" gap={28} size={1.4} />
```

- [ ] **Step 4: Update `CanvasHeader` JSX**

Find the outer `div` in `CanvasHeader`:
```tsx
<div className="absolute top-6 left-6 z-30 w-72 bg-white/[.82] backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-sm px-5 py-4 pointer-events-auto">
```
Replace with:
```tsx
<div className="absolute top-6 left-6 z-30 w-72 bg-white/90 backdrop-blur-md border border-gray-300/70 rounded-2xl shadow-sm px-5 py-4 pointer-events-auto">
```

Find the back-link:
```tsx
className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
```
Replace with:
```tsx
className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
```

- [ ] **Step 5: Verify TypeScript**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/roadmaps/components/RoadmapCanvas.tsx
git commit -m "style: thicker edges, larger markers, warmer dot grid, opaque header badge"
```

---

### Task 4: Redesign TopicPanel

**Files:**
- Modify: `frontend/src/features/topics/components/TopicPanel.tsx`

- [ ] **Step 1: Update the `<aside>` element**

Find:
```tsx
<aside
  className={`absolute top-0 right-0 h-full z-20 w-[480px] max-w-full bg-white border-l border-gray-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
    isOpen ? "translate-x-0" : "translate-x-full"
  }`}
>
```
Replace with:
```tsx
<aside
  className={`absolute top-0 right-0 h-full z-20 w-[480px] max-w-full bg-[#faf9f7] border-l-2 border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${
    isOpen ? "translate-x-0" : "translate-x-full"
  }`}
  style={{ boxShadow: "-4px 0 24px rgba(0,0,0,0.10)" }}
>
```

Changes: `bg-white` → `bg-[#faf9f7]`, `border-l` → `border-l-2`, `shadow-2xl` removed (replaced by inline left-casting shadow).

- [ ] **Step 2: Update the "Topic" label color**

Find:
```tsx
<span className="text-xs font-medium uppercase tracking-wider text-blue-500">
```
Replace with:
```tsx
<span className="text-xs font-medium uppercase tracking-wider text-blue-600">
```

- [ ] **Step 3: Verify TypeScript**

Run from `frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Run tests**

```bash
npm run test
```
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/topics/components/TopicPanel.tsx
git commit -m "style: panel warm background, stronger border and shadow, blue-600 label"
```

---

### Task 5: Redesign catalog page

**Files:**
- Modify: `frontend/src/app/roadmaps/page.tsx`

- [ ] **Step 1: Replace `frontend/src/app/roadmaps/page.tsx` in full**

```tsx
import Link from "next/link";

import { getRoadmaps } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function RoadmapsPage() {
  const roadmaps = await getRoadmaps();

  return (
    <div className="min-h-screen bg-[#f0ede8]">
      {/* Top nav — white strip anchors the top */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
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
              className="group block bg-white rounded-2xl p-6 hover:shadow-md transition-all"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
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

Key changes from previous:
- `bg-white` → `bg-[#f0ede8]` on page wrapper
- `nav` gains explicit `bg-white border-b border-gray-200`
- Cards: `border border-gray-200` removed, inline `boxShadow` added, `hover:border-blue-300` removed

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
git commit -m "style: warm canvas bg on catalog, shadow-depth cards, white nav bar"
```

---

## Manual Smoke Tests (after all tasks)

Run `docker compose up` and verify:

1. `/roadmaps` — warm `#f0ede8` background, white nav bar at top, cards float with shadow (no border), hover deepens shadow
2. `/roadmaps/[slug]` — canvas background is warm `#f0ede8`, dot grid visible, nodes are white floating cards with no border
3. Node hover — node lifts slightly (`translateY(-1px)`) and shadow deepens
4. Edges — prerequisite and recommended lines visibly thicker than before; arrows slightly larger
5. Floating header badge — more opaque white, back-link text legible
6. Click a node — panel slides in; panel background is warm near-white (`#faf9f7`), clearly distinct from canvas; strong left shadow
7. "Topic" label in panel header reads as `blue-600` (slightly deeper than before)
8. Canvas zoom out — nodes remain clearly readable as distinct white cards against warm bg at all zoom levels
