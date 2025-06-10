package com.example.learning_management.service;

import com.example.learning_management.dto.ExamDTO;
import com.example.learning_management.dto.CourseFileDTO;
import com.example.learning_management.dto.ExamSubmissionDTO;
import com.example.learning_management.entity.*;
import com.example.learning_management.entity.user.User;
import com.example.learning_management.repository.*;
import com.example.learning_management.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import java.time.ZoneId;
import java.time.ZonedDateTime;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final CourseRepository courseRepository;
    private final FileService fileService;
    private final EnrollmentRepository enrollmentRepository;
    private final ExamSubmissionRepository examSubmissionRepository;
    private final UserRepository userRepository;
    private final CourseFileRepository courseFileRepository;

    private static final Logger logger = LoggerFactory.getLogger(ExamService.class);

    @Transactional
    public ExamDTO createExam(Long courseId, Long instructorId, String title, MultipartFile file, LocalDateTime startDate, LocalDateTime endDate) throws IOException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        CourseFileDTO uploadedFile = fileService.uploadFile(courseId, instructorId, file, title, "EXAM");

        Exam exam = Exam.builder()
                .title(title)
                .fileUrl(uploadedFile.getFileUrl())
                .startDate(startDate)
                .endDate(endDate)
                .course(course)
                .build();

        return convertToDTO(examRepository.save(exam));
    }

    public List<ExamDTO> getExamsByCourse(Long courseId) {
        return examRepository.findByCourseId(courseId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExamDTO updateExam(Long examId, Long instructorId, String title, MultipartFile file, LocalDateTime startDate, LocalDateTime endDate) throws IOException {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));

        exam.setTitle(title);
        exam.setStartDate(startDate);
        exam.setEndDate(endDate);

        if (file != null) {
            CourseFileDTO uploadedFile = fileService.uploadFile(exam.getCourse().getId(), instructorId, file, title, "EXAM");
            exam.setFileUrl(uploadedFile.getFileUrl());
        }

        return convertToDTO(examRepository.save(exam));
    }

    @Transactional
    public void deleteExam(Long examId, Long instructorId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));

        if (!exam.getCourse().getInstructor().getId().equals(instructorId)) {
            throw new AccessDeniedException("You are not authorized to delete this exam");
        }

        // Delete associated CourseFile
        if (exam.getCourseFile() != null) {
            courseFileRepository.deleteByFileUrl(exam.getFileUrl());
        }

        // Delete exam submissions
        examSubmissionRepository.deleteAll(exam.getSubmissions());

        // Delete the exam
        examRepository.delete(exam);
    }

    public List<ExamDTO> getExamsForStudent(Long studentId) {
        List<Long> courseIds = enrollmentRepository.findByStudentId(studentId).stream()
                .map(enrollment -> enrollment.getCourse().getId())
                .collect(Collectors.toList());

        return examRepository.findByCourseIdIn(courseIds).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // submissions handling

    @Transactional
    public ExamSubmissionDTO submitExamAnswer(Long examId, Long studentId, MultipartFile file) throws IOException {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (!isStudentEnrolledInCourse(student, exam.getCourse())) {
            throw new AccessDeniedException("You are not enrolled in this course");
        }

        ZoneId colomboZone = ZoneId.of("Asia/Colombo");
        ZonedDateTime now = ZonedDateTime.now(colomboZone);

        if (now.isBefore(exam.getStartDate().atZone(colomboZone)) || now.isAfter(exam.getEndDate().atZone(colomboZone))) {
            throw new IllegalStateException("Exam submission is not allowed");
        }

        CourseFileDTO uploadedFile = fileService.uploadFile(exam.getCourse().getId(), studentId, file, "Exam Submission", "EXAM_SUBMISSION");

        ExamSubmission submission = ExamSubmission.builder()
                .exam(exam)
                .student(student)
                .fileUrl(uploadedFile.getFileUrl())
                .submissionTime(now.toLocalDateTime())
                .build();

        return convertToExamSubmissionDTO(examSubmissionRepository.save(submission));
    }

    public List<ExamSubmissionDTO> getExamSubmissions(Long examId) {
        return examSubmissionRepository.findByExamId(examId).stream()
                .map(this::convertToExamSubmissionDTO)
                .collect(Collectors.toList());
    }

    public Resource downloadExamSubmission(Long examId, Long submissionId, Long instructorId) throws IOException {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));

        if (!exam.getCourse().getInstructor().getId().equals(instructorId)) {
            throw new AccessDeniedException("You are not authorized to download this submission");
        }

        ExamSubmission submission = examSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam submission not found"));

        if (!submission.getExam().getId().equals(examId)) {
            throw new IllegalArgumentException("Submission does not belong to the specified exam");
        }

        return fileService.downloadFile(submissionId, instructorId);
    }

    public ExamSubmissionDTO getStudentExamSubmission(Long examId, Long studentId) {
        return examSubmissionRepository.findByExamIdAndStudentId(examId, studentId)
                .map(this::convertToExamSubmissionDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Exam submission not found"));
    }

    private boolean isStudentEnrolledInCourse(User student, Course course) {
        return enrollmentRepository.existsByStudentAndCourse(student, course);
    }

    private ExamDTO convertToDTO(Exam exam) {
        return ExamDTO.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .fileUrl(exam.getFileUrl())
                .startDate(exam.getStartDate())
                .endDate(exam.getEndDate())
                .courseId(exam.getCourse().getId())
                .courseTitle(exam.getCourse().getTitle())
                .build();
    }

    private ExamSubmissionDTO convertToExamSubmissionDTO(ExamSubmission submission) {
        return ExamSubmissionDTO.builder()
                .id(submission.getId())
                .examId(submission.getExam().getId())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getFirstname() + " " + submission.getStudent().getLastname())
                .fileUrl(submission.getFileUrl())
                .submissionTime(submission.getSubmissionTime())
                .marks(submission.getMarks())
                .build();
    }

    // gRPC methods

    @Transactional
    public void updateExamSubmissionMarks(Long submissionId, Double marks) {
        logger.info("Updating marks for submission ID: {}, Marks: {}", submissionId, marks);

        ExamSubmission submission = examSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> {
                    logger.error("Exam submission not found with id: {}", submissionId);
                    return new ResourceNotFoundException("Exam submission not found with id: " + submissionId);
                });

        if (marks < 0 || marks > 100) {
            logger.error("Invalid marks value: {} for submission ID: {}", marks, submissionId);
            throw new IllegalArgumentException("Marks must be between 0 and 100");
        }

        submission.setMarks(marks);
        examSubmissionRepository.save(submission);
        logger.info("Successfully updated marks for submission ID: {}, New marks: {}", submissionId, marks);
    }

    @Transactional
    public void resetExamSubmissionMarks(List<Long> submissionIds) {
        List<ExamSubmission> submissions = examSubmissionRepository.findAllById(submissionIds);
        for (ExamSubmission submission : submissions) {
            submission.setMarks(null);
        }
        examSubmissionRepository.saveAll(submissions);
    }
}