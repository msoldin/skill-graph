# Frontend Contrast Refresh: Miro-Style Design — Spec

**Date:** 2026-04-24
**Status:** Approved

## Goal

Improve visual contrast across all four surface areas — canvas, nodes, edges, and topic panel — to achieve a Miro-like depth and clarity. The current design uses white-on-near-white with thin borders, making the graph hard to read and the panel feel weightless.

## Approach

Approach B (Full Miro Refresh): fix all four contrast problems plus align the floating header badge and catalog page to the new surface language. Changes are confined to CSS/Tailwind values and inline styles — no structural or behavioral changes.

---

## 1. Color System

| Token | Old value | New value | Notes |
|-------|-----------|-----------|-------|
| Canvas background | `#fafafa` | `#f0ede8` | Warm off-white — nodes and cards now pop |
| Node surface | `#ffffff` | `#ffffff` | Unchanged |
| Panel surface | `#ffffff` | `#faf9f7` | Warm near-white — distinct layer from canvas |
| Node border | `border border-gray-200` | _(removed)_ | Replaced entirely by shadow |
| Node shadow | `shadow-sm` | `0 4px 16px rgba(0,0,0,0.10)` | Miro sticky-note depth |
| Node hover shadow | `hover:shadow-md` | `0 6px 24px rgba(0,0,0,0.15)` + `translateY(-1px)` | Lifts on hover |
| Panel left border | `border-l border-gray-200` | `border-l-2 border-gray-200` | Heavier edge |
| Panel shadow | `shadow-2xl` | `shadow-2xl` + `-4px 0 24px rgba(0,0,0,0.10)` inline | Left-casting shadow added |

---

## 2. Nodes (`TopicNode.tsx`)

### Shadow + surface
- Remove `border border-gray-200` from the outer `div`
- Replace `shadow-sm` with inline `style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}`
- Hover: inline style doesn't support `hover:` — use a `useState` hover flag or a CSS class in `globals.css` named `.topic-node` with `:hover` rule applying the deeper shadow and `transform: translateY(-1px)`
- Keep `transition-all`

### Typography hierarchy

| Element | Old classes | New classes |
|---------|-------------|-------------|
| Label (`<strong>`) | `text-sm font-semibold text-gray-900` | `text-sm font-semibold text-gray-950` |
| Entry badge | `text-xs text-blue-500 border border-blue-200 rounded-full px-2 py-0.5` | unchanged |
| Content types | `text-xs text-gray-400` | `text-xs text-gray-500` |
| "No assets yet" | `text-xs text-gray-300` | `text-xs text-gray-400` |
| Group key | `text-[10px] tracking-wide uppercase text-gray-300` | `text-[10px] tracking-wide uppercase text-gray-400 font-medium` |

### Sizing
- `min-w-[160px] max-w-[200px]` → `min-w-[172px] max-w-[220px]`
- `px-4` → `px-5`

---

## 3. Edges (`RoadmapCanvas.tsx` — `edgeStyle` function)

| Relationship | Old stroke | New stroke | Width change |
|---|---|---|---|
| prerequisite | `#3b82f6`, 2px | `#3b82f6`, 2.5px | +0.5px |
| related | `#8b5cf6`, 1.5px dashed | `#8b5cf6`, 2px dashed | +0.5px |
| recommended | `#10b981`, 2px | `#10b981`, 2.5px | +0.5px |
| fallback | `#9ca3af`, 1.5px | `#9ca3af`, 2px | +0.5px |

Arrow markers: increase `markerWidth` and `markerHeight` from `8` to `10` on the `MarkerType.ArrowClosed` objects (passed via `markerEnd` on each edge — set `markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10 }`).

### Dot grid
- `color` prop: `"#0000001a"` → `"#00000026"` (15% opacity vs 10%)
- `size` prop: `1.2` → `1.4`

---

## 4. Topic Panel (`TopicPanel.tsx`)

- Outer `<aside>` background: add `bg-[#faf9f7]` (remove implicit white)
- Left border: `border-l border-gray-200` → `border-l-2 border-gray-200`
- Shadow: keep `shadow-2xl` class; add inline `style={{ boxShadow: "-4px 0 24px rgba(0,0,0,0.10)" }}` for leftward cast
- "Topic" label: `text-blue-500` → `text-blue-600`

---

## 5. Floating Header Badge (`CanvasHeader` in `RoadmapCanvas.tsx`)

- Background: `bg-white/[.82]` → `bg-white/90`
- Border: `border-gray-200/60` → `border-gray-300/70`
- "← All Roadmaps" link: `text-gray-400` → `text-gray-500`

---

## 6. Catalog Page (`src/app/roadmaps/page.tsx`)

- Page wrapper: `bg-white` → `bg-[#f0ede8]`
- Nav bar: add `bg-white` so it stays white against the warm page background (currently inherits page bg)
- Cards: remove `border border-gray-200`; add inline `style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}`
- Card hover: keep `hover:shadow-md`; remove `hover:border-blue-300` (no border to color)

---

## 7. globals.css

Add a `.topic-node:hover` rule for the shadow + lift that can't be expressed with Tailwind `hover:` on an inline style:

```css
.topic-node {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.10);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}
.topic-node:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}
```

Remove the inline `style` shadow from `TopicNode.tsx` and use the `.topic-node` class instead.

---

## Out of Scope

- No structural or behavioral changes
- No node color-coding by `groupKey` (deferred — Approach C)
- No backend changes
- No new dependencies

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/app/globals.css` | Add `.topic-node` hover rule; update `body` background |
| `frontend/tailwind.config.ts` | Add `#f0ede8` and `#faf9f7` to color tokens |
| `frontend/src/features/roadmaps/components/TopicNode.tsx` | Shadow class, typography, sizing |
| `frontend/src/features/roadmaps/components/RoadmapCanvas.tsx` | Edge weights, marker size, grid opacity, header badge styles |
| `frontend/src/features/topics/components/TopicPanel.tsx` | Panel background, border weight, shadow, label color |
| `frontend/src/app/roadmaps/page.tsx` | Page background, nav bg, card shadow/border |
