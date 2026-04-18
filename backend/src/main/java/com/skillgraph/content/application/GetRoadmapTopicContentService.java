package com.skillgraph.content.application;

import com.skillgraph.assets.infrastructure.FilesystemAssetReader;
import com.skillgraph.content.domain.ContentRoadmap;
import com.skillgraph.content.domain.RoadmapTopicAssetRecord;
import com.skillgraph.content.domain.RoadmapTopicContentRecord;
import com.skillgraph.content.domain.TopicAsset;
import com.skillgraph.content.domain.TopicContentResponse;
import com.skillgraph.content.domain.TopicSummary;
import com.skillgraph.content.infrastructure.TopicContentRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Comparator;
import java.util.List;

@ApplicationScoped
public class GetRoadmapTopicContentService {
    @Inject
    TopicContentRepository topicContentRepository;

    @Inject
    FilesystemAssetReader filesystemAssetReader;

    public TopicContentResponse get(String roadmapSlug, String topicSlug) {
        RoadmapTopicContentRecord roadmapTopic = topicContentRepository.requireRoadmapTopic(roadmapSlug, topicSlug);
        List<TopicAsset> assets = topicContentRepository.listAssets(roadmapTopic.roadmapTopicId()).stream()
            .sorted(Comparator.comparingInt(RoadmapTopicAssetRecord::sortOrder).thenComparing(RoadmapTopicAssetRecord::title, String.CASE_INSENSITIVE_ORDER))
            .map(this::toAsset)
            .filter(asset -> asset != null)
            .toList();

        return new TopicContentResponse(
            new ContentRoadmap(roadmapTopic.roadmapSlug(), roadmapTopic.roadmapTitle()),
            new TopicSummary(roadmapTopic.topicSlug(), roadmapTopic.topicTitle(), roadmapTopic.topicSummary()),
            assets
        );
    }

    private TopicAsset toAsset(RoadmapTopicAssetRecord asset) {
        return switch (asset.assetType()) {
            case "markdown" -> new TopicAsset(
                Long.toString(asset.id()),
                asset.assetType(),
                asset.title(),
                asset.sortOrder(),
                filesystemAssetReader.readMarkdown(asset.filePath()),
                null
            );
            case "pdf" -> {
                filesystemAssetReader.resolve(asset.filePath());
                yield new TopicAsset(
                    Long.toString(asset.id()),
                    asset.assetType(),
                    asset.title(),
                    asset.sortOrder(),
                    null,
                    "/api/assets/pdf/" + asset.id()
                );
            }
            case "json", "yaml" -> null;
            default -> throw new IllegalStateException("Unsupported asset type: " + asset.assetType());
        };
    }
}
