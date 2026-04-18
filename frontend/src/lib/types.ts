export type RoadmapSummary = {
  slug: string;
  title: string;
  description: string;
};

export type GraphNodeData = {
  topicSlug: string;
  label: string;
  groupKey: string | null;
  isEntrypoint: boolean;
  contentAvailable: boolean;
  contentTypes: string[];
  href: string;
};

export type GraphNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: GraphNodeData;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  data: { relationship: string };
};

export type RoadmapGraph = {
  roadmap: RoadmapSummary;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type TopicAsset = {
  id: string;
  type: string;
  title: string;
  sortOrder: number;
  body: string | null;
  url: string | null;
};

export type TopicContent = {
  roadmap: { slug: string; title: string };
  topic: { slug: string; title: string; summary: string };
  assets: TopicAsset[];
};

export type ApiErrorBody = {
  status: number;
  message: string;
};
