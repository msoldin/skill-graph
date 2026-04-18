package com.skillgraph.assets.api;

import com.skillgraph.assets.infrastructure.FilesystemAssetReader;
import com.skillgraph.content.domain.RoadmapTopicAssetRecord;
import com.skillgraph.content.infrastructure.TopicContentRepository;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AssetResourceTest {
    @TempDir
    Path tempDir;

    @Test
    void servesPdfWithASinglePdfContentTypeHeader() throws IOException {
        Path pdf = tempDir.resolve("reference.pdf");
        Files.write(pdf, new byte[] {37, 80, 68, 70});

        AssetResource resource = new AssetResource();
        resource.topicContentRepository = new TopicContentRepository() {
            @Override
            public RoadmapTopicAssetRecord requireAsset(long assetId) {
                return new RoadmapTopicAssetRecord(assetId, 101, "pdf", "reference.pdf", "Reference", 0);
            }
        };
        resource.filesystemAssetReader = new FilesystemAssetReader(tempDir.toString());

        Response response = resource.streamPdf(1002);

        assertEquals(List.of("application/pdf"), response.getHeaders().get(HttpHeaders.CONTENT_TYPE));
    }
}
