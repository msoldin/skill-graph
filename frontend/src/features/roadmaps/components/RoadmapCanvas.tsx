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
      return { stroke: "#3b82f6", strokeWidth: 2.5 };
    case "related":
      return { stroke: "#8b5cf6", strokeWidth: 2, strokeDasharray: "5 3" };
    case "recommended":
      return { stroke: "#10b981", strokeWidth: 2.5 };
    default:
      return { stroke: "#9ca3af", strokeWidth: 2 };
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
    markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10 },
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
    <div className="absolute top-6 left-6 z-30 w-72 bg-white/90 backdrop-blur-md border border-gray-300/70 rounded-2xl shadow-sm px-5 py-4 pointer-events-auto">
      <Link
        href="/roadmaps"
        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
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
            <Background color="#00000026" gap={28} size={1.4} />
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
