package com.skillgraph.catalog.infrastructure;

import com.skillgraph.catalog.domain.CatalogRoadmap;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class CatalogRepository {
    private static final String LIST_ROADMAPS = """
        select slug, title, description
        from roadmaps
        order by title asc
        """;

    @Inject
    AgroalDataSource dataSource;

    public List<CatalogRoadmap> listRoadmaps() {
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(LIST_ROADMAPS);
             var resultSet = statement.executeQuery()) {
            List<CatalogRoadmap> roadmaps = new ArrayList<>();
            while (resultSet.next()) {
                roadmaps.add(new CatalogRoadmap(
                    resultSet.getString("slug"),
                    resultSet.getString("title"),
                    resultSet.getString("description")
                ));
            }
            return roadmaps;
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to load roadmap catalog", exception);
        }
    }
}
