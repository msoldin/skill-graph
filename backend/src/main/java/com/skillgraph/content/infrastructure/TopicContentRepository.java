package com.skillgraph.content.infrastructure;

import com.skillgraph.content.domain.RoadmapTopicAssetRecord;
import com.skillgraph.content.domain.RoadmapTopicContentRecord;
import com.skillgraph.shared.domain.NotFoundException;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class TopicContentRepository {
    private static final String FIND_ROADMAP_TOPIC = """
        select
          rt.id as roadmap_topic_id,
          r.slug as roadmap_slug,
          r.title as roadmap_title,
          t.slug as topic_slug,
          coalesce(rt.label_override, t.name) as topic_title,
          t.summary as topic_summary
        from roadmaps r
        join roadmap_topics rt on rt.roadmap_id = r.id
        join topics t on t.id = rt.topic_id
        where r.slug = ? and t.slug = ?
        """;

    private static final String FIND_ASSETS = """
        select id, roadmap_topic_id, asset_type, file_path, title, sort_order
        from roadmap_topic_assets
        where roadmap_topic_id = ?
        order by sort_order asc, title asc
        """;

    private static final String FIND_ASSET_BY_ID = """
        select id, roadmap_topic_id, asset_type, file_path, title, sort_order
        from roadmap_topic_assets
        where id = ?
        """;

    @Inject
    AgroalDataSource dataSource;

    public RoadmapTopicContentRecord requireRoadmapTopic(String roadmapSlug, String topicSlug) {
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(FIND_ROADMAP_TOPIC)) {
            statement.setString(1, roadmapSlug);
            statement.setString(2, topicSlug);
            try (var resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    throw new NotFoundException("Topic not found in roadmap: " + roadmapSlug + "/" + topicSlug);
                }
                return new RoadmapTopicContentRecord(
                    resultSet.getLong("roadmap_topic_id"),
                    resultSet.getString("roadmap_slug"),
                    resultSet.getString("roadmap_title"),
                    resultSet.getString("topic_slug"),
                    resultSet.getString("topic_title"),
                    resultSet.getString("topic_summary")
                );
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to load roadmap topic content", exception);
        }
    }

    public List<RoadmapTopicAssetRecord> listAssets(long roadmapTopicId) {
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(FIND_ASSETS)) {
            statement.setLong(1, roadmapTopicId);
            try (var resultSet = statement.executeQuery()) {
                List<RoadmapTopicAssetRecord> assets = new ArrayList<>();
                while (resultSet.next()) {
                    assets.add(readAsset(resultSet));
                }
                return assets;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to load topic assets", exception);
        }
    }

    public RoadmapTopicAssetRecord requireAsset(long assetId) {
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(FIND_ASSET_BY_ID)) {
            statement.setLong(1, assetId);
            try (var resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    throw new NotFoundException("Missing asset: " + assetId);
                }
                return readAsset(resultSet);
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to load asset", exception);
        }
    }

    private RoadmapTopicAssetRecord readAsset(java.sql.ResultSet resultSet) throws SQLException {
        return new RoadmapTopicAssetRecord(
            resultSet.getLong("id"),
            resultSet.getLong("roadmap_topic_id"),
            resultSet.getString("asset_type"),
            resultSet.getString("file_path"),
            resultSet.getString("title"),
            resultSet.getInt("sort_order")
        );
    }
}
