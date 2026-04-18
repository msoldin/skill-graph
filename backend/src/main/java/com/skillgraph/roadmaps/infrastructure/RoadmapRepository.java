package com.skillgraph.roadmaps.infrastructure;

import com.skillgraph.roadmaps.domain.RoadmapEdgeRecord;
import com.skillgraph.roadmaps.domain.RoadmapGraphData;
import com.skillgraph.roadmaps.domain.RoadmapMetadata;
import com.skillgraph.roadmaps.domain.RoadmapTopicRecord;
import com.skillgraph.shared.domain.NotFoundException;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class RoadmapRepository {
    private static final String FIND_ROADMAP = """
        select id, slug, title, description
        from roadmaps
        where slug = ?
        """;

    private static final String FIND_ROADMAP_TOPICS = """
        select
          rt.id as roadmap_topic_id,
          t.slug as topic_slug,
          t.name as topic_name,
          coalesce(rt.label_override, t.name) as label,
          rt.x,
          rt.y,
          rt.group_key,
          rt.is_entrypoint,
          coalesce(string_agg(distinct rta.asset_type, ',' order by rta.asset_type), '') as asset_types
        from roadmap_topics rt
        join topics t on t.id = rt.topic_id
        left join roadmap_topic_assets rta on rta.roadmap_topic_id = rt.id
        where rt.roadmap_id = ?
        group by rt.id, t.slug, t.name, rt.label_override, rt.x, rt.y, rt.group_key, rt.is_entrypoint
        order by label asc, rt.id asc
        """;

    private static final String FIND_ROADMAP_EDGES = """
        select id, source_roadmap_topic_id, target_roadmap_topic_id, edge_type
        from roadmap_edges
        where roadmap_id = ?
        order by id asc
        """;

    @Inject
    AgroalDataSource dataSource;

    public RoadmapMetadata requireRoadmap(String slug) {
        return findRoadmap(slug).orElseThrow(() -> new NotFoundException("Unknown roadmap: " + slug));
    }

    public Optional<RoadmapMetadata> findRoadmap(String slug) {
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(FIND_ROADMAP)) {
            statement.setString(1, slug);
            try (var resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    return Optional.empty();
                }
                return Optional.of(new RoadmapMetadata(
                    resultSet.getLong("id"),
                    resultSet.getString("slug"),
                    resultSet.getString("title"),
                    resultSet.getString("description")
                ));
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to load roadmap metadata", exception);
        }
    }

    public RoadmapGraphData loadGraph(String slug) {
        RoadmapMetadata roadmap = requireRoadmap(slug);
        return new RoadmapGraphData(roadmap, loadTopics(roadmap.id()), loadEdges(roadmap.id()));
    }

    private List<RoadmapTopicRecord> loadTopics(long roadmapId) {
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(FIND_ROADMAP_TOPICS)) {
            statement.setLong(1, roadmapId);
            try (var resultSet = statement.executeQuery()) {
                List<RoadmapTopicRecord> topics = new ArrayList<>();
                while (resultSet.next()) {
                    topics.add(new RoadmapTopicRecord(
                        resultSet.getLong("roadmap_topic_id"),
                        resultSet.getString("topic_slug"),
                        resultSet.getString("topic_name"),
                        resultSet.getString("label"),
                        getNullableDouble(resultSet, "x"),
                        getNullableDouble(resultSet, "y"),
                        resultSet.getString("group_key"),
                        resultSet.getBoolean("is_entrypoint"),
                        parseAssetTypes(resultSet.getString("asset_types"))
                    ));
                }
                return topics;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to load roadmap topics", exception);
        }
    }

    private List<RoadmapEdgeRecord> loadEdges(long roadmapId) {
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(FIND_ROADMAP_EDGES)) {
            statement.setLong(1, roadmapId);
            try (var resultSet = statement.executeQuery()) {
                List<RoadmapEdgeRecord> edges = new ArrayList<>();
                while (resultSet.next()) {
                    edges.add(new RoadmapEdgeRecord(
                        resultSet.getLong("id"),
                        resultSet.getLong("source_roadmap_topic_id"),
                        resultSet.getLong("target_roadmap_topic_id"),
                        resultSet.getString("edge_type")
                    ));
                }
                return edges;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to load roadmap edges", exception);
        }
    }

    private List<String> parseAssetTypes(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        return Arrays.stream(csv.split(","))
            .map(String::trim)
            .filter(value -> !value.isEmpty())
            .toList();
    }

    private Double getNullableDouble(java.sql.ResultSet resultSet, String column) throws SQLException {
        var value = resultSet.getBigDecimal(column);
        return value == null ? null : value.doubleValue();
    }
}
