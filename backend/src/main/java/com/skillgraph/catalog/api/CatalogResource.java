package com.skillgraph.catalog.api;

import com.skillgraph.catalog.domain.CatalogRoadmap;
import com.skillgraph.catalog.infrastructure.CatalogRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/roadmaps")
@Produces(MediaType.APPLICATION_JSON)
public class CatalogResource {
    @Inject
    CatalogRepository catalogRepository;

    @GET
    public List<CatalogRoadmap> listRoadmaps() {
        return catalogRepository.listRoadmaps();
    }
}
