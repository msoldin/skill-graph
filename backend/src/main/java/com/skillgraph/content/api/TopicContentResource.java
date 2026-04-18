package com.skillgraph.content.api;

import com.skillgraph.content.application.GetRoadmapTopicContentService;
import com.skillgraph.content.domain.TopicContentResponse;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/api/roadmaps/{roadmapSlug}/topics/{topicSlug}")
@Produces(MediaType.APPLICATION_JSON)
public class TopicContentResource {
    @Inject
    GetRoadmapTopicContentService getRoadmapTopicContentService;

    @GET
    public TopicContentResponse getTopicContent(
        @PathParam("roadmapSlug") String roadmapSlug,
        @PathParam("topicSlug") String topicSlug
    ) {
        return getRoadmapTopicContentService.get(roadmapSlug, topicSlug);
    }
}
