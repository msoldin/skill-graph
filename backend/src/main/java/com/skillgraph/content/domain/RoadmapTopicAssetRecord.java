package com.skillgraph.content.domain;

public record RoadmapTopicAssetRecord(long id, long roadmapTopicId, String assetType, String filePath, String title, int sortOrder) {
}
