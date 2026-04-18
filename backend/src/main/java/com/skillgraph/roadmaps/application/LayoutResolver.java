package com.skillgraph.roadmaps.application;

import com.skillgraph.roadmaps.domain.Position;
import com.skillgraph.roadmaps.domain.RoadmapEdgeRecord;
import com.skillgraph.roadmaps.domain.RoadmapTopicRecord;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

@ApplicationScoped
public class LayoutResolver {
    private static final double START_X = 140;
    private static final double START_Y = 120;
    private static final double LAYER_SPACING = 320;
    private static final double ROW_SPACING = 160;

    public Map<Long, Position> resolve(List<RoadmapTopicRecord> topics, List<RoadmapEdgeRecord> edges) {
        Map<Long, RoadmapTopicRecord> topicsById = topics.stream().collect(java.util.stream.Collectors.toMap(RoadmapTopicRecord::roadmapTopicId, topic -> topic));
        Map<Long, Integer> indegree = new HashMap<>();
        Map<Long, Integer> layers = new HashMap<>();
        Map<Long, List<Long>> adjacency = new HashMap<>();

        for (RoadmapTopicRecord topic : topics) {
            indegree.put(topic.roadmapTopicId(), 0);
            layers.put(topic.roadmapTopicId(), 0);
            adjacency.put(topic.roadmapTopicId(), new ArrayList<>());
        }

        for (RoadmapEdgeRecord edge : edges) {
            if (!topicsById.containsKey(edge.sourceRoadmapTopicId()) || !topicsById.containsKey(edge.targetRoadmapTopicId())) {
                continue;
            }
            adjacency.get(edge.sourceRoadmapTopicId()).add(edge.targetRoadmapTopicId());
            indegree.computeIfPresent(edge.targetRoadmapTopicId(), (key, value) -> value + 1);
        }

        Comparator<Long> byLabel = Comparator
            .comparing((Long id) -> topicsById.get(id).label(), String.CASE_INSENSITIVE_ORDER)
            .thenComparingLong(Long::longValue);

        ArrayDeque<Long> ready = indegree.entrySet().stream()
            .filter(entry -> entry.getValue() == 0)
            .map(Map.Entry::getKey)
            .sorted(byLabel)
            .collect(java.util.stream.Collectors.toCollection(ArrayDeque::new));

        Set<Long> visited = new HashSet<>();
        while (!ready.isEmpty()) {
            Long current = ready.removeFirst();
            if (!visited.add(current)) {
                continue;
            }
            adjacency.getOrDefault(current, List.of()).stream().sorted(byLabel).forEach(target -> {
                layers.compute(target, (key, value) -> Math.max(value == null ? 0 : value, layers.get(current) + 1));
                indegree.computeIfPresent(target, (key, value) -> value - 1);
                if (indegree.get(target) == 0) {
                    ready.add(target);
                }
            });
        }

        topics.stream()
            .map(RoadmapTopicRecord::roadmapTopicId)
            .filter(id -> !visited.contains(id))
            .sorted(byLabel)
            .forEach(id -> layers.putIfAbsent(id, 0));

        Map<Integer, List<RoadmapTopicRecord>> byLayer = new TreeMap<>();
        for (RoadmapTopicRecord topic : topics) {
            byLayer.computeIfAbsent(layers.getOrDefault(topic.roadmapTopicId(), 0), ignored -> new ArrayList<>()).add(topic);
        }

        Map<Long, Position> positions = new HashMap<>();
        for (Map.Entry<Integer, List<RoadmapTopicRecord>> entry : byLayer.entrySet()) {
            List<RoadmapTopicRecord> layerTopics = entry.getValue().stream()
                .sorted(Comparator.comparing(RoadmapTopicRecord::label, String.CASE_INSENSITIVE_ORDER).thenComparingLong(RoadmapTopicRecord::roadmapTopicId))
                .toList();
            for (int index = 0; index < layerTopics.size(); index++) {
                RoadmapTopicRecord topic = layerTopics.get(index);
                if (topic.x() != null && topic.y() != null) {
                    positions.put(topic.roadmapTopicId(), new Position(topic.x(), topic.y()));
                    continue;
                }
                positions.put(topic.roadmapTopicId(), new Position(
                    START_X + (entry.getKey() * LAYER_SPACING),
                    START_Y + (index * ROW_SPACING)
                ));
            }
        }

        return positions;
    }
}
