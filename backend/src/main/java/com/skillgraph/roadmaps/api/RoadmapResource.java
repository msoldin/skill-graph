package com.skillgraph.roadmaps.api;

import com.skillgraph.roadmaps.application.GetRoadmapGraphService;
import com.skillgraph.roadmaps.domain.RoadmapGraphResponse;
import com.skillgraph.roadmaps.domain.RoadmapMetadata;
import com.skillgraph.roadmaps.domain.RoadmapSummary;
import com.skillgraph.roadmaps.infrastructure.RoadmapRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/api/roadmaps/{roadmapSlug}")
@Produces(MediaType.APPLICATION_JSON)
public class RoadmapResource {
    @Inject
    RoadmapRepository roadmapRepository;

    @Inject
    GetRoadmapGraphService getRoadmapGraphService;

    @GET
    public RoadmapSummary getRoadmap(@PathParam("roadmapSlug") String roadmapSlug) {
        RoadmapMetadata roadmap = roadmapRepository.requireRoadmap(roadmapSlug);
        return new RoadmapSummary(roadmap.slug(), roadmap.title(), roadmap.description());
    }

    @GET
    @Path("/graph")
    public RoadmapGraphResponse getGraph(@PathParam("roadmapSlug") String roadmapSlug) {
        return getRoadmapGraphService.get(roadmapSlug);
    }
}
