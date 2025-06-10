package com.example.learning_management.service;

import com.example.learning_management.dto.CourseFileDTO;
import com.example.learning_management.entity.Course;
import com.example.learning_management.entity.CourseFile;
import com.example.learning_management.entity.Exam;
import com.example.learning_management.entity.user.User;
import com.example.learning_management.repository.*;
import com.example.learning_management.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileService {

    private static final Logger logger = LoggerFactory.getLogger(FileService.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.download-dir}")
    private String downloadDir;

    private Path fileStorageLocation;
    private Path fileDownloadLocation;

    private final CourseFileRepository courseFileRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.fileDownloadLocation = Paths.get(downloadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            Files.createDirectories(this.fileDownloadLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Transactional
    public CourseFileDTO uploadFile(Long courseId, Long userId, MultipartFile file, String title, String fileType) throws IOException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!isAuthorizedToUpload(user, course)) {
            throw new AccessDeniedException("You are not authorized to upload files to this course");
        }

        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;

        if (fileName.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid path sequence " + fileName);
        }

        Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        CourseFile courseFile = CourseFile.builder()
                .title(title)
                .fileUrl(uniqueFileName)
                .fileType(fileType)
                .uploadDate(LocalDateTime.now())
                .course(course)
                .uploader(user)
                .build();

        return convertToCourseFileDTO(courseFileRepository.save(courseFile));
    }

    public Resource downloadFile(Long fileId, Long userId) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CourseFile courseFile = courseFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        if (!isUserAuthorizedToDownload(user, courseFile.getCourse())) {
            throw new AccessDeniedException("You are not authorized to download this file");
        }

        Path filePath = this.fileStorageLocation.resolve(courseFile.getFileUrl());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new ResourceNotFoundException("File not found " + courseFile.getFileUrl());
        }

        return resource;
    }

    public List<CourseFileDTO> getCourseFiles(Long courseId) {
        return courseFileRepository.findByCourseId(courseId).stream()
                .filter(file -> !"EXAM".equals(file.getFileType()))
                .map(this::convertToCourseFileDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseFileDTO updateFile(Long fileId, Long instructorId, String newTitle, MultipartFile newFile) throws IOException {
        CourseFile courseFile = courseFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        if (!courseFile.getUploader().getId().equals(instructorId)) {
            throw new AccessDeniedException("You are not authorized to update this file");
        }

        courseFile.setTitle(newTitle);

        if (newFile != null && !newFile.isEmpty()) {
            String fileName = StringUtils.cleanPath(newFile.getOriginalFilename());
            String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;

            if (fileName.contains("..")) {
                throw new IllegalArgumentException("Filename contains invalid path sequence " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(newFile.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Files.deleteIfExists(this.fileStorageLocation.resolve(courseFile.getFileUrl()));

            courseFile.setFileUrl(uniqueFileName);
//            courseFile.setFileType(newFile.getContentType());
        }

        courseFile.setUploadDate(LocalDateTime.now());
        return convertToCourseFileDTO(courseFileRepository.save(courseFile));
    }

    @Transactional
    public void deleteFile(Long fileId, Long instructorId) throws IOException {
        CourseFile courseFile = courseFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        if (!courseFile.getUploader().getId().equals(instructorId)) {
            throw new AccessDeniedException("You are not authorized to delete this file");
        }

        Files.deleteIfExists(this.fileStorageLocation.resolve(courseFile.getFileUrl()));
        courseFileRepository.delete(courseFile);
    }

    private boolean isAuthorizedToUpload(User user, Course course) {
        return course.getInstructor().getId().equals(user.getId()) ||
                enrollmentRepository.existsByStudentIdAndCourseId(user.getId(), course.getId());
    }

    private boolean isUserAuthorizedToDownload(User user, Course course) {
        if (user.getRoles().stream().anyMatch(role -> role.getName().equals("INSTRUCTOR"))) {
            return course.getInstructor().getId().equals(user.getId());
        } else if (user.getRoles().stream().anyMatch(role -> role.getName().equals("STUDENT"))) {
            return enrollmentRepository.existsByStudentIdAndCourseId(user.getId(), course.getId());
        }
        return false;
    }

    private CourseFileDTO convertToCourseFileDTO(CourseFile courseFile) {
        return CourseFileDTO.builder()
                .id(courseFile.getId())
                .title(courseFile.getTitle())
                .fileUrl(courseFile.getFileUrl())
                .fileType(courseFile.getFileType())
                .uploadDate(courseFile.getUploadDate())
                .courseId(courseFile.getCourse().getId())
                .uploaderName(courseFile.getUploader().getFirstname() + " " + courseFile.getUploader().getLastname())
                .build();
    }
}