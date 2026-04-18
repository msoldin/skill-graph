package com.skillgraph.assets.api;

import com.skillgraph.assets.infrastructure.FilesystemAssetReader;
import com.skillgraph.content.domain.RoadmapTopicAssetRecord;
import com.skillgraph.content.infrastructure.TopicContentRepository;
import com.skillgraph.shared.domain.BadRequestException;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/assets")
public class AssetResource {
    @Inject
    TopicContentRepository topicContentRepository;

    @Inject
    FilesystemAssetReader filesystemAssetReader;

    @GET
    @Path("/pdf/{assetId}")
    @Produces("application/pdf")
    public Response streamPdf(@PathParam("assetId") long assetId) {
        RoadmapTopicAssetRecord asset = topicContentRepository.requireAsset(assetId);
        if (!"pdf".equals(asset.assetType())) {
            throw new BadRequestException("Asset " + assetId + " is not a PDF");
        }

        var resolved = filesystemAssetReader.resolve(asset.filePath());
        return Response.ok(resolved.toFile(), MediaType.APPLICATION_OCTET_STREAM_TYPE)
            .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + asset.title().replace(' ', '-') + ".pdf\"")
            .build();
    }
}
