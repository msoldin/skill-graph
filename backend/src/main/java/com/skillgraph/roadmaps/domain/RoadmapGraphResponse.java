package com.skillgraph.roadmaps.domain;

import java.util.List;

public record RoadmapGraphResponse(RoadmapSummary roadmap, List<RoadmapNode> nodes, List<RoadmapEdge> edges) {
}
