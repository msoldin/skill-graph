package com.skillgraph.roadmaps.infrastructure;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RoadmapRepositoryTest {

    @Test
    void keepsOnlyRenderableAssetTypesInGraphMetadata() {
        assertEquals(
            List.of("markdown", "pdf"),
            RoadmapRepository.parseSupportedAssetTypes("json, markdown, pdf, yaml")
        );
    }
}
