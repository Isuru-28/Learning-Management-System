package com.example.learning_management.controller;

import com.example.learning_management.dto.ExamDTO;
import com.example.learning_management.dto.ExamSubmissionDTO;
import com.example.learning_management.entity.user.User;
import com.example.learning_management.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/auth/courses/{courseId}/exam-management")
@RequiredArgsConstructor
public class ExamController {

    private static final Logger logger = LoggerFactory.getLogger(ExamController.class);
    private final ExamService examService;

    @PostMapping
    public ResponseEntity<ExamDTO> createExam(
            @PathVariable Long courseId,
            @RequestParam Long instructorId,
            @RequestParam String title,
            @RequestParam MultipartFile file,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) throws IOException {
        ExamDTO exam = examService.createExam(courseId, instructorId, title, file, startDate, endDate);
        return ResponseEntity.ok(exam);
    }

    @GetMapping
    public ResponseEntity<List<ExamDTO>> getExamsByCourse(@PathVariable Long courseId) {
        List<ExamDTO> exams = examService.getExamsByCourse(courseId);
        return ResponseEntity.ok(exams);
    }

    @PutMapping("/{examId}")
    public ResponseEntity<ExamDTO> updateExam(
            @PathVariable Long examId,
            @RequestParam Long instructorId,
            @RequestParam String title,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) throws IOException {
        ExamDTO exam = examService.updateExam(examId, instructorId, title, file, startDate, endDate);
        return ResponseEntity.ok(exam);
    }

    @DeleteMapping("/{examId}")
    public ResponseEntity<Void> deleteExam(
            @PathVariable Long examId,
            @RequestParam Long instructorId) throws IOException {
        examService.deleteExam(examId, instructorId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<List<ExamDTO>> getExamsForStudent(@RequestParam Long studentId) {
        List<ExamDTO> exams = examService.getExamsForStudent(studentId);
        return ResponseEntity.ok(exams);
    }

    // exam submission
    @PostMapping("/{examId}/submit")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ExamSubmissionDTO> submitExamAnswer(
            @PathVariable Long courseId,
            @PathVariable Long examId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam MultipartFile file) throws IOException {
        logger.info("Received exam submission request - courseId: {}, examId: {}, user: {}", courseId, examId, userDetails.getUsername());
        logger.info("User authorities: {}", userDetails.getAuthorities());
        logger.info("File details - name: {}, size: {}, content type: {}", file.getOriginalFilename(), file.getSize(), file.getContentType());

        Long studentId = ((User) userDetails).getId();
        try {
            ExamSubmissionDTO submission = examService.submitExamAnswer(examId, studentId, file);
            logger.info("Exam submission successful - submissionId: {}", submission.getId());
            return ResponseEntity.ok(submission);
        } catch (Exception e) {
            logger.error("Error submitting exam answer: ", e);
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{examId}/submissions")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<List<ExamSubmissionDTO>> getExamSubmissions(@PathVariable Long examId) {
        List<ExamSubmissionDTO> submissions = examService.getExamSubmissions(examId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/{examId}/submissions/{studentId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<ExamSubmissionDTO> getStudentExamSubmission(
            @PathVariable Long examId,
            @PathVariable Long studentId) {
        ExamSubmissionDTO submission = examService.getStudentExamSubmission(examId, studentId);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/{examId}/submissions/{submissionId}/download")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<Resource> downloadExamSubmission(
            @PathVariable Long examId,
            @PathVariable Long submissionId,
            @RequestParam Long instructorId) {
        try {
            Resource resource = examService.downloadExamSubmission(examId, submissionId, instructorId);
            String contentType = "application/octet-stream";
            String headerValue = "attachment; filename=\"" + resource.getFilename() + "\"";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                    .body(resource);
        } catch (Exception e) {
            logger.error("Error downloading exam submission: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(null);
        }
    }
}