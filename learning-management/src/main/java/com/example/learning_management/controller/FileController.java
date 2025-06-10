package com.example.learning_management.controller;

import com.example.learning_management.dto.CourseFileDTO;
import com.example.learning_management.service.FileService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("auth/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<?> uploadFile(
            @RequestParam Long courseId,
            @RequestParam Long instructorId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("fileType") String fileType) {
        try {
            CourseFileDTO uploadedFile = fileService.uploadFile(courseId, instructorId, file, title, fileType);
            return ResponseEntity.ok(uploadedFile);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to process the file: " + e.getMessage());
        }
    }

    @GetMapping("/download/{fileId}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'INSTRUCTOR')")
    public ResponseEntity<?> downloadFile(@PathVariable Long fileId, @RequestParam Long userId) {
        try {
            Resource resource = fileService.downloadFile(fileId, userId);
            String contentType = "application/octet-stream";
            String headerValue = "attachment; filename=\"" + resource.getFilename() + "\"";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                    .body(resource);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error downloading file: " + e.getMessage());
        }
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<List<CourseFileDTO>> getCourseFiles(@PathVariable Long courseId) {
        return ResponseEntity.ok(fileService.getCourseFiles(courseId));
    }

    @PutMapping("/{fileId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<?> updateFile(
            @PathVariable Long fileId,
            @RequestParam Long instructorId,
            @RequestParam("title") String title,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            CourseFileDTO updatedFile = fileService.updateFile(fileId, instructorId, title, file);
            return ResponseEntity.ok(updatedFile);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to process the file: " + e.getMessage());
        }
    }

    @DeleteMapping("/{fileId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<?> deleteFile(
            @PathVariable Long fileId,
            @RequestParam Long instructorId) {
        try {
            fileService.deleteFile(fileId, instructorId);
            return ResponseEntity.ok().build();
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete the file: " + e.getMessage());
        }
    }
}