package com.skillgraph.roadmaps.domain;

public record RoadmapEdgeRecord(long id, long sourceRoadmapTopicId, long targetRoadmapTopicId, String edgeType) {
}
