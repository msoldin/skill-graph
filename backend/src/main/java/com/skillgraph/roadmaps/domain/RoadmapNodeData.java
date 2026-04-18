package com.skillgraph.roadmaps.domain;

import java.util.List;

public record RoadmapNodeData(
    String topicSlug,
    String label,
    String groupKey,
    boolean isEntrypoint,
    boolean contentAvailable,
    List<String> contentTypes,
    String href
) {
}
