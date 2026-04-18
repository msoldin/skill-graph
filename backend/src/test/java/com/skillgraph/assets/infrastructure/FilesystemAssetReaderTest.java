package com.skillgraph.assets.infrastructure;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class FilesystemAssetReaderTest {
    @TempDir
    Path tempDir;

    @Test
    void readsMarkdownInsideContentRoot() throws IOException {
        Path markdown = tempDir.resolve("notes.md");
        Files.writeString(markdown, "# Hello\n");

        FilesystemAssetReader reader = new FilesystemAssetReader(tempDir.toString());

        assertEquals("# Hello\n", reader.readMarkdown("notes.md"));
    }

    @Test
    void rejectsPathsThatEscapeTheContentRoot() {
        FilesystemAssetReader reader = new FilesystemAssetReader(tempDir.toString());

        assertThrows(IllegalArgumentException.class, () -> reader.resolve("../secret.txt"));
    }
}
