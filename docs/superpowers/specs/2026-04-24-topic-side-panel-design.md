# Topic Side Panel Design

**Date:** 2026-04-24  
**Status:** Approved

## Overview

When a user clicks a topic node in the roadmap graph, the topic content opens in a side panel instead of navigating to a new full page. The graph and panel are visible simultaneously in a split view. The browser URL updates to reflect the open topic, enabling shareable and bookmarkable links.

## Requirements

- Clicking a topic node opens a right-side panel showing topic content
- Graph remains visible and interactive on the left (~60% width)
- Panel occupies ~40% of the width on the right
- URL updates to `/roadmaps/[slug]/topics/[topicSlug]` when panel is open
- Navigating directly to a topic URL renders the roadmap graph with the panel pre-opened
- Panel closes via: close button (×) in panel header, or clicking anywhere on the graph pane
- Browser back/forward buttons work correctly
- Switching topics (clicking a different node while panel is open) updates panel content in place

## Architecture

### URL Management

`window.history.pushState` is used instead of `router.push` to update the URL when a topic is opened or closed. This avoids triggering a Next.js navigation, which would unmount and remount `RoadmapCanvas` (resetting React Flow pan/zoom state).

A `popstate` event listener in `RoadmapCanvas` syncs browser back/forward navigation back into React state.

For direct URL navigation (e.g. bookmarks), the topic page server route passes `topicSlug` as `initialTopicSlug` to `RoadmapCanvas`, which opens the panel immediately on first render.

### Components

**Modified: `src/features/roadmaps/components/RoadmapCanvas.tsx`**

- Add `initialTopicSlug?: string` prop
- Add `selectedTopicSlug: string | null` state (initialized from prop)
- Replace `router.push` in `onNodeClick` with `openTopic(slug)`: sets state + `pushState`
- Add `closeTopic()`: clears state + `pushState` back to roadmap URL
- Add `useEffect` with `popstate` listener to sync URL → state for back/forward
- When `selectedTopicSlug` is set: render flex row layout with graph pane (left, ~60%) and `<TopicPanel>` (right, ~40%)
- React Flow's `onPaneClick` callback (fires only on empty canvas, not on nodes) calls `closeTopic()`

**New: `src/features/topics/components/TopicPanel.tsx`**

Client component. Props: `roadmapSlug: string`, `topicSlug: string`, `onClose: () => void`.

- `useEffect` on `topicSlug`: fetches `getTopicContent(roadmapSlug, topicSlug)`, stores in local state
- Renders loading skeleton while fetching
- Renders: header (topic title + `×` close button), scrollable body (summary + `<TopicContent assets={...} />`)
- Renders inline error state with retry on API failure

**Modified: `src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx`**

Repurposed from standalone topic page to roadmap+panel page. Fetches roadmap metadata (same as the roadmap page) and renders the same header layout + `<RoadmapCanvas roadmapSlug={...} initialTopicSlug={topicSlug} />`. The existing `TopicContent` component is retained and used inside `TopicPanel`.

## Data Flow

### Opening via UI click
1. User clicks node → `openTopic(slug)` sets `selectedTopicSlug`, `pushState` updates URL
2. `TopicPanel` mounts/updates, calls `getTopicContent(roadmapSlug, topicSlug)` via existing API proxy
3. Panel shows loading state → renders content on success

### Opening via direct URL
1. Server renders repurposed topic page, passes `initialTopicSlug` to `RoadmapCanvas`
2. `RoadmapCanvas` initialises state from prop — panel visible on first render
3. `TopicPanel` fetches content client-side

### Closing
- Close button or graph pane click → `closeTopic()` → state null + `pushState` to roadmap URL
- Browser back/forward → `popstate` listener reads `window.location.pathname`, sets state

### Switching topics
- Clicking a different node while panel open calls `openTopic(newSlug)` directly
- `TopicPanel` receives new `topicSlug` prop, `useEffect` re-fires, fetches new content

## Error Handling

- API failure in `TopicPanel`: inline error message + retry button; graph remains fully interactive
- No full-page crash on topic content failure

## Files Changed

| File | Change |
|------|--------|
| `src/features/roadmaps/components/RoadmapCanvas.tsx` | Modified — panel state, layout, URL management |
| `src/features/topics/components/TopicPanel.tsx` | New — topic panel component |
| `src/app/roadmaps/[roadmapSlug]/topics/[topicSlug]/page.tsx` | Repurposed — renders roadmap+panel instead of standalone topic page |

**Total: 3 files (1 new, 2 modified)**
