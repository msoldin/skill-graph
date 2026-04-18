package com.skillgraph.roadmaps.application;

import com.skillgraph.roadmaps.domain.Position;
import com.skillgraph.roadmaps.domain.RoadmapEdgeRecord;
import com.skillgraph.roadmaps.domain.RoadmapTopicRecord;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LayoutResolverTest {
    private final LayoutResolver layoutResolver = new LayoutResolver();

    @Test
    void keepsManualCoordinatesAndAppliesDeterministicFallbacks() {
        List<RoadmapTopicRecord> topics = List.of(
            new RoadmapTopicRecord(101, "http-basics", "HTTP Basics", "HTTP Basics", 140.0, 120.0, "foundations", true, List.of("markdown")),
            new RoadmapTopicRecord(102, "rest-api-design", "REST API Design", "REST API Design", null, null, "design", false, List.of("markdown")),
            new RoadmapTopicRecord(103, "quarkus-basics", "Quarkus Basics", "Quarkus Basics", null, null, "framework", false, List.of("markdown"))
        );

        List<RoadmapEdgeRecord> edges = List.of(
            new RoadmapEdgeRecord(1, 101, 102, "prerequisite"),
            new RoadmapEdgeRecord(2, 102, 103, "prerequisite")
        );

        Map<Long, Position> positions = layoutResolver.resolve(topics, edges);

        assertEquals(new Position(140.0, 120.0), positions.get(101L));
        assertEquals(new Position(460.0, 120.0), positions.get(102L));
        assertEquals(new Position(780.0, 120.0), positions.get(103L));
    }
}
