package com.skillgraph.content.domain;

import java.util.List;

public record TopicContentResponse(ContentRoadmap roadmap, TopicSummary topic, List<TopicAsset> assets) {
}
