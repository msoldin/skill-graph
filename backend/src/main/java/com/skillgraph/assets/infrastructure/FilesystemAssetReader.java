package com.skillgraph.assets.infrastructure;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@ApplicationScoped
public class FilesystemAssetReader {
    private final Path contentRoot;

    public FilesystemAssetReader(@ConfigProperty(name = "app.content-root") String contentRoot) {
        this.contentRoot = Path.of(contentRoot).normalize().toAbsolutePath();
    }

    public String readMarkdown(String filePath) {
        try {
            return Files.readString(resolve(filePath), StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to read asset file: " + filePath, exception);
        }
    }

    public Path resolve(String filePath) {
        Path resolved = contentRoot.resolve(filePath).normalize().toAbsolutePath();
        if (!resolved.startsWith(contentRoot)) {
            throw new IllegalArgumentException("Asset path escapes content root");
        }
        if (!Files.exists(resolved)) {
            throw new IllegalStateException("Asset file missing on disk: " + filePath);
        }
        return resolved;
    }
}
