# Dark Mode Design Spec
**Date:** 2026-04-24  
**Status:** Approved

---

## Summary

Add dark mode to the skill-graph frontend. Uses Tailwind `dark:` variants with `next-themes` for theme management. Defaults to the user's OS preference, allows manual override via a toggle button, and persists the choice to `localStorage`. Dark palette direction: warm stone/brown tones to complement the existing earthy light theme.

---

## 1. Theme Infrastructure

### New packages
Install two new packages:
- `next-themes` — theme management
- `lucide-react` — icon library for the sun/moon toggle button

`next-themes` provides:
- A `ThemeProvider` component wrapping the app
- Reads `prefers-color-scheme` on first visit (OS preference)
- Manual override stored in `localStorage`
- Adds the `dark` class to `<html>` before first paint — no FOUC

### Tailwind configuration
Add `darkMode: "class"` to `tailwind.config.ts`.

Extend the existing three color tokens with dark counterparts:

| Token   | Light value | Dark value              |
|---------|-------------|-------------------------|
| canvas  | `#f0ede8`   | stone-950 `#0c0a09`     |
| panel   | `#faf9f7`   | stone-900 `#1c1917`     |
| surface | `#ffffff`   | stone-800 `#292524`     |

### Layout
- Wrap `<body>` content in `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>` in `src/app/layout.tsx`
- Add `suppressHydrationWarning` to `<html>` to suppress React hydration mismatch caused by `next-themes` injecting the class server-side vs client-side
- Remove hardcoded `bg-[#fafafa]` from `<body>`; let dark mode classes handle it

---

## 2. Color Palette Mapping

Every color in use across the codebase, with its dark-mode equivalent:

| Purpose                    | Light                          | Dark                             |
|----------------------------|--------------------------------|----------------------------------|
| Page background            | `bg-[#fafafa]`                 | `dark:bg-stone-950`              |
| Catalog/canvas background  | `bg-[#f0ede8]`                 | `dark:bg-stone-950`              |
| Panel / sidebar            | `bg-[#faf9f7]`                 | `dark:bg-stone-900`              |
| Cards / surfaces           | `bg-white`                     | `dark:bg-stone-800`              |
| Primary text               | `text-gray-950`                | `dark:text-stone-100`            |
| Secondary text             | `text-gray-600`                | `dark:text-stone-400`            |
| Muted text                 | `text-gray-500` / `text-gray-400` | `dark:text-stone-500`         |
| Borders (standard)         | `border-gray-200`              | `dark:border-stone-700`          |
| Borders (subtle)           | `border-gray-100`              | `dark:border-stone-800`          |
| Accent (blue links)        | `text-blue-600` / `text-blue-500` | `dark:text-blue-400`          |
| Nav bar background         | `bg-white border-gray-200`     | `dark:bg-stone-900 dark:border-stone-700` |
| Floating canvas header     | `bg-white/90`                  | `dark:bg-stone-900/90`           |
| ReactFlow edge: prerequisite | `#3b82f6`                   | `#60a5fa`                        |
| ReactFlow edge: optional   | `#8b5cf6`                      | `#a78bfa`                        |
| ReactFlow edge: related    | `#10b981`                      | `#34d399`                        |
| ReactFlow edge: default    | `#9ca3af`                      | `#6b7280`                        |
| ReactFlow dot background   | `#00000026`                    | `#ffffff18`                      |
| Error state                | `bg-red-50 border-red-200`     | `dark:bg-red-950/30 dark:border-red-800` |

---

## 3. Files Changed

### Modified files

| File | What changes |
|------|-------------|
| `tailwind.config.ts` | Add `darkMode: "class"`; add dark values to color tokens |
| `src/app/globals.css` | Add dark overrides for `body` bg; adjust shadow opacity for dark `.topic-node`/`.catalog-card` |
| `src/app/layout.tsx` | Add `ThemeProvider`; add `suppressHydrationWarning`; remove hardcoded body bg class |
| `src/app/roadmaps/page.tsx` | Add `dark:` variants to nav, card backgrounds, text, borders, page background |
| `src/features/roadmaps/components/RoadmapCanvas.tsx` | Add `dark:` to floating header/legend; use `useTheme()` to select dark-aware inline edge stroke colors; update `<Background>` color |
| `src/features/roadmaps/components/TopicNode.tsx` | Add `dark:` to card background, text colors, borders |
| `src/features/topics/components/TopicPanel.tsx` | Add `dark:` to panel background, header text, borders |
| `src/features/topics/components/TopicContent.tsx` | Add `dark:prose-invert` to `<article>`; add `dark:` to error states, accent link colors |

### New file

`src/components/ThemeToggle.tsx` — a button that:
- Uses `useTheme()` from `next-themes` to read/set the theme
- Renders a sun icon when in dark mode, moon icon when in light mode (from `lucide-react`)
- Is mounted client-side only (wraps with a `mounted` guard to avoid hydration mismatch)
- Placed in the nav bar of `roadmaps/page.tsx` and in the floating header of `RoadmapCanvas.tsx`

---

## 4. ReactFlow Special Handling

`RoadmapCanvas.tsx` currently passes edge stroke colors as inline `style` objects (plain hex strings), which Tailwind `dark:` variants cannot reach. Resolution:

- Import `useTheme` from `next-themes`
- Define a `edgeColors` object that returns light or dark hex values based on the resolved theme
- Pass these to the `markerEnd` and `style` props of edge definitions
- The `<Background>` component's `color` prop is handled the same way

---

## 5. Testing

No automated tests are added (no UI rendering test infrastructure exists). Manual verification checklist:

- [ ] Toggle button switches theme; `<html class="dark">` appears/disappears in DevTools
- [ ] Reload page; theme persists from `localStorage`
- [ ] Open with OS dark mode active; app defaults to dark without manual toggle
- [ ] Open with OS light mode active; app defaults to light
- [ ] Catalog page: nav, cards, backgrounds render correctly in both modes
- [ ] Roadmap canvas: floating header, edge legend, node cards render correctly in both modes
- [ ] Topic panel: slide-in panel and content render correctly in both modes
- [ ] Prose/markdown content uses `prose-invert` in dark mode
- [ ] Error state in TopicContent renders correctly in dark mode
- [ ] No flash of unstyled content (FOUC) on hard reload in either mode
- [ ] ReactFlow edge colors and dot background update with theme

---

## 6. Out of Scope

- No changes to the backend
- No PDF viewer dark mode (native browser rendering)
- No animated theme transition (could be added later)
- No per-roadmap or per-topic theme overrides
