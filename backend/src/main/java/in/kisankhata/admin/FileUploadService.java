package in.kisankhata.admin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final long MAX_FILE_SIZE = 1024 * 1024; // 1 MB limit
    private final Path uploadDir;

    public FileUploadService(@Value("${app.upload.dir:./data/uploads}") String uploadPath) {
        this.uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize upload directory", e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file provided for upload");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 1 MB limit");
        }

        String extension = validateMagicBytesAndGetExtension(file);
        String randomFilename = UUID.randomUUID().toString() + extension;

        try {
            Path targetLocation = this.uploadDir.resolve(randomFilename).normalize();
            if (!targetLocation.startsWith(this.uploadDir)) {
                throw new SecurityException("Invalid path traversal detected");
            }
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/api/v1/files/" + randomFilename;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file: " + ex.getMessage(), ex);
        }
    }

    public Path loadFileAsResource(String filename) {
        Path filePath = this.uploadDir.resolve(filename).normalize();
        if (!filePath.startsWith(this.uploadDir)) {
            throw new SecurityException("Path traversal attempt");
        }
        if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
            throw new IllegalArgumentException("File not found");
        }
        return filePath;
    }

    private String validateMagicBytesAndGetExtension(MultipartFile file) {
        byte[] header = new byte[12];
        try (InputStream is = file.getInputStream()) {
            int read = is.read(header);
            if (read < 4) {
                throw new IllegalArgumentException("Corrupt or invalid image file");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to read image header", e);
        }

        // JPEG: FF D8 FF
        if ((header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF) {
            return ".jpg";
        }

        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if ((header[0] & 0xFF) == 0x89 && (header[1] & 0xFF) == 0x50 && (header[2] & 0xFF) == 0x4E && (header[3] & 0xFF) == 0x47) {
            return ".png";
        }

        // WebP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
        if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 &&
            header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50) {
            return ".webp";
        }

        throw new IllegalArgumentException("Only JPEG, PNG, and WebP images are permitted");
    }
}
