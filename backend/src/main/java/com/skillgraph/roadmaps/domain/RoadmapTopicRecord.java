package com.skillgraph.roadmaps.domain;

import java.util.List;

public record RoadmapTopicRecord(
    long roadmapTopicId,
    String topicSlug,
    String topicName,
    String label,
    Double x,
    Double y,
    String groupKey,
    boolean isEntrypoint,
    List<String> contentTypes
) {
    public boolean contentAvailable() {
        return !contentTypes.isEmpty();
    }
}
