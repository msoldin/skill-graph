package com.skillgraph.roadmaps.domain;

import java.util.List;

public record RoadmapGraphData(RoadmapMetadata roadmap, List<RoadmapTopicRecord> topics, List<RoadmapEdgeRecord> edges) {
}
