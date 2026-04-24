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
        onPaneClick={selectedTopicSlug ? closeTopic : undefined}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(148, 163, 184, 0.18)" gap={28} />
        <Controls showInteractive={false} />
      </ReactFlow>
    );
  }, [state, openTopic, closeTopic, selectedTopicSlug]);

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
