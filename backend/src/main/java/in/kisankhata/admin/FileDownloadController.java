package in.kisankhata.admin;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;

@RestController
@RequestMapping("/api/v1/files")
public class FileDownloadController {

    private final FileUploadService fileService;

    public FileDownloadController(FileUploadService fileService) {
        this.fileService = fileService;
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path filePath = fileService.loadFileAsResource(filename);
            Resource resource = new UrlResource(filePath.toUri());

            MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
            String lower = filename.toLowerCase();
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                mediaType = MediaType.IMAGE_JPEG;
            } else if (lower.endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            } else if (lower.endsWith(".webp")) {
                mediaType = MediaType.parseMediaType("image/webp");
            }

            return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(resource);
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
