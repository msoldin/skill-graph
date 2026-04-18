package com.skillgraph.roadmaps.application;

import com.skillgraph.roadmaps.domain.Position;
import com.skillgraph.roadmaps.domain.RoadmapEdge;
import com.skillgraph.roadmaps.domain.RoadmapEdgeData;
import com.skillgraph.roadmaps.domain.RoadmapGraphData;
import com.skillgraph.roadmaps.domain.RoadmapGraphResponse;
import com.skillgraph.roadmaps.domain.RoadmapMetadata;
import com.skillgraph.roadmaps.domain.RoadmapNode;
import com.skillgraph.roadmaps.domain.RoadmapNodeData;
import com.skillgraph.roadmaps.domain.RoadmapSummary;
import com.skillgraph.roadmaps.domain.RoadmapTopicRecord;
import com.skillgraph.roadmaps.infrastructure.RoadmapRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Map;

@ApplicationScoped
public class GetRoadmapGraphService {
    @Inject
    RoadmapRepository roadmapRepository;

    @Inject
    LayoutResolver layoutResolver;

    public RoadmapGraphResponse get(String roadmapSlug) {
        RoadmapGraphData graphData = roadmapRepository.loadGraph(roadmapSlug);
        Map<Long, Position> positions = layoutResolver.resolve(graphData.topics(), graphData.edges());

        RoadmapMetadata roadmap = graphData.roadmap();
        List<RoadmapNode> nodes = graphData.topics().stream()
            .map(topic -> new RoadmapNode(
                Long.toString(topic.roadmapTopicId()),
                "topic",
                positions.get(topic.roadmapTopicId()),
                toNodeData(roadmap.slug(), topic)
            ))
            .toList();

        List<RoadmapEdge> edges = graphData.edges().stream()
            .map(edge -> new RoadmapEdge(
                Long.toString(edge.id()),
                Long.toString(edge.sourceRoadmapTopicId()),
                Long.toString(edge.targetRoadmapTopicId()),
                edge.edgeType(),
                new RoadmapEdgeData(edge.edgeType())
            ))
            .toList();

        return new RoadmapGraphResponse(
            new RoadmapSummary(roadmap.slug(), roadmap.title(), roadmap.description()),
            nodes,
            edges
        );
    }

    private RoadmapNodeData toNodeData(String roadmapSlug, RoadmapTopicRecord topic) {
        return new RoadmapNodeData(
            topic.topicSlug(),
            topic.label(),
            topic.groupKey(),
            topic.isEntrypoint(),
            topic.contentAvailable(),
            topic.contentTypes(),
            "/roadmaps/" + roadmapSlug + "/topics/" + topic.topicSlug()
        );
    }
}
