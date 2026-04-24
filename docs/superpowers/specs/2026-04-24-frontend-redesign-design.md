# Frontend Redesign: Modern Light Canvas

**Date:** 2026-04-24
**Status:** Approved

## Goal

Redesign the frontend to feel like a modern developer tool inspired by Miro:
light infinite canvas, floating UI chrome, no page borders, full-viewport graph.

## Design Decisions

- **Color scheme:** Light — off-white (#fafafa) canvas, white surfaces, gray-900 text
- **Layout:** True 100vw × 100vh canvas, no container padding
- **Header:** Floating frosted-glass badge top-left inside canvas
- **Entry point:** Title badge "Begin →" click pans/zooms to first node
- **Catalog:** Kept, redesigned to match new light aesthetic
- **Styling:** Tailwind CSS replaces all inline styles

## Design System

### Color Tokens (tailwind.config.ts)

| Token          | Value                   | Usage                      |
|----------------|-------------------------|----------------------------|
| canvas         | #fafafa                 | Canvas background          |
| canvas-grid    | rgba(0,0,0,0.07)        | Dot grid dots              |
| surface        | #ffffff                 | Node cards, panels         |
| surface-glass  | rgba(255,255,255,0.82)  | Frosted header badge       |
| border         | gray-200 (#e5e7eb)      | Default borders            |
| text-primary   | gray-900 (#111827)      | Primary text               |
| text-muted     | gray-500 (#6b7280)      | Secondary/helper text      |
| accent-blue    | blue-500 (#3b82f6)      | Prerequisite edges, active |
| accent-violet  | violet-500 (#8b5cf6)    | Related edges              |
| accent-emerald | emerald-500 (#10b981)   | Recommended edges          |

### Typography

- Font: Inter via `next/font/google`
- Sizes/weights: Tailwind scale only

### Dependencies Added

- `tailwindcss` + `postcss` + `autoprefixer`
- `@tailwindcss/typography` (prose classes for topic content)

## Pages

### Canvas Pages (`/roadmaps/[slug]` and `/roadmaps/[slug]/topics/[topicSlug]`)

- `<main>` wrapper: `w-screen h-screen overflow-hidden` — no max-width, no padding
- `RoadmapCanvas` fills `w-full h-full`
- Page fetches `getRoadmap()` and passes `roadmap` prop to `RoadmapCanvas`
- `next/layout.tsx` body background: `#fafafa` (no gradient)

### Catalog Page (`/roadmaps`)

- `max-w-5xl mx-auto px-6 py-16` centered layout, `bg-white`
- Thin top nav bar with app name
- Card grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`
- Cards: white, `border border-gray-200 rounded-2xl`, hover border-blue shadow

## Components

### RoadmapCanvas

- React Flow: background color `#fafafa`, `<Background variant="dots">`
  with `color="#0000001a"`, gap 28, size 1.2
- Accepts new `roadmap: { title: string; description: string }` prop
- Renders floating header overlay and legend as absolute-positioned children
- Side panel: overlay drawer (not a flex split), `absolute top-0 right-0`
- Canvas dimming overlay (`bg-black/10 absolute inset-0 z-10`) when panel open
  — clicking it closes the panel (replaces `onPaneClick` guard)

### Floating Header Overlay

- `absolute top-6 left-6 z-30 w-72`
- `bg-white/[.82] backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-sm px-5 py-4`
- Contents (top to bottom):
  1. Breadcrumb link: `← All Roadmaps` → `/roadmaps`
  2. Roadmap title: `text-xl font-semibold text-gray-900`
  3. Roadmap description: `text-sm text-gray-500 mt-1 max-w-xs`
  4. "Begin →" button: `mt-3 text-sm font-medium text-blue-600`
- "Begin →" calls React Flow's `fitView` scoped to the first node, then
  opens that node's topic side panel

### First Node Detection (heuristic, no backend change)

"First node" = node with no incoming prerequisite edges.
If multiple qualify, pick the one with the smallest `position.y`.

### Topic Node (custom React Flow node type: `"topic"`)

- Base: `bg-white border border-gray-200 rounded-2xl shadow-sm min-w-[160px] max-w-[200px] px-4 py-3`
- Hover: `border-blue-400 shadow-md`
- Selected (panel open): `border-blue-500 ring-2 ring-blue-500/20`
- Title: `text-sm font-semibold text-gray-900`
- Optional subtitle/type label: `text-xs text-gray-400 mt-0.5`
- React Flow handles: `w-2 h-2 bg-gray-300 rounded-full`

### Edges

| Type         | Style  | Color   | Width | Curve   |
|--------------|--------|---------|-------|---------|
| prerequisite | solid  | #3b82f6 | 2px   | bezier  |
| related      | dashed | #8b5cf6 | 1.5px | bezier  |
| recommended  | solid  | #10b981 | 2px   | bezier  |

All edges have an arrowhead at the target end.

### Edge Legend

- `absolute bottom-6 right-6 z-30`
- `bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl px-3 py-2 text-xs`
- Three rows: colored swatch + label for each edge type

### TopicPanel (overlay drawer)

- `absolute top-0 right-0 h-full z-20 w-[480px] max-w-full`
- `bg-white border-l border-gray-200 shadow-2xl`
- Animation: `transition-transform duration-300 ease-in-out`
  — `translate-x-full` when closed → `translate-x-0` when open
- Header (`px-6 py-4 border-b border-gray-100`):
  - Topic title: `text-base font-semibold text-gray-900`
  - Close `×` button: `text-gray-400 hover:text-gray-600`
- Content area: `flex-1 overflow-y-auto px-6 py-5 prose prose-gray`
  (rendered markdown via `@tailwindcss/typography`)

### Canvas Dimming Overlay

When panel is open, render `<div className="absolute inset-0 z-10 bg-black/10" onClick={closeTopic} />`
inside the React Flow wrapper. This replaces the `onPaneClick` approach.

## Files Changed

| File | Change |
|------|--------|
| `frontend/package.json` | Add tailwindcss, postcss, autoprefixer, @tailwindcss/typography |
| `frontend/tailwind.config.ts` | New — Tailwind config with custom color tokens |
| `frontend/postcss.config.js` | New — PostCSS config for Tailwind |
| `frontend/src/app/globals.css` | Simplified: CSS reset + Tailwind directives, remove gradient |
| `frontend/src/app/layout.tsx` | Load Inter via next/font/google, set body bg to #fafafa |
| `frontend/src/app/roadmaps/page.tsx` | Catalog redesign with Tailwind |
| `frontend/src/app/roadmaps/[roadmapSlug]/page.tsx` | Full-viewport wrapper, pass roadmap prop |
| `frontend/src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx` | Same |
| `frontend/src/features/roadmaps/components/RoadmapCanvas.tsx` | New layout, floating header, overlay panel, dimming overlay |
| `frontend/src/features/roadmaps/components/TopicNode.tsx` | New — custom React Flow node component |
| `frontend/src/features/topics/components/TopicPanel.tsx` | Overlay drawer, Tailwind classes, prose content |

## Out of Scope

- Mobile/responsive graph interactions (pinch-to-zoom etc.)
- Dark mode toggle
- Backend changes
- Authentication
- Animations beyond the panel slide transition
