package com.example.learning_management.service;

import com.example.learning_management.entity.Course;
import com.example.learning_management.entity.Enrollment;
import com.example.learning_management.entity.ExamSubmission;
import com.example.learning_management.entity.user.User;
import com.example.learning_management.repository.EnrollmentRepository;
import com.example.learning_management.repository.ExamSubmissionRepository;
import com.example.learning_management.repository.UserRepository;
import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TranscriptGenerationService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ExamSubmissionRepository examSubmissionRepository;

    public byte[] generateTranscriptPdf(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        List<ExamSubmission> examSubmissions = examSubmissionRepository.findByStudentIdAndMarksIsNotNull(studentId);

        String transcriptContent = generateTranscriptContent(student, enrollments, examSubmissions);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            pdfDoc.setDefaultPageSize(PageSize.A4);

            ConverterProperties converterProperties = new ConverterProperties();
            HtmlConverter.convertToPdf(transcriptContent, pdfDoc, converterProperties);

            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private String generateTranscriptContent(User student, List<Enrollment> enrollments, List<ExamSubmission> examSubmissions) {
        try {
            String template = loadTemplate("templates/transcript_template.html");

            Map<Course, List<ExamSubmission>> submissionsByCourse = examSubmissions.stream()
                    .collect(Collectors.groupingBy(submission -> submission.getExam().getCourse()));

            StringBuilder courseContent = new StringBuilder();
            for (Enrollment enrollment : enrollments) {
                Course course = enrollment.getCourse();
                courseContent.append("<div class=\"course\">")
                        .append("<h3>").append(course.getTitle()).append("</h3>");

                List<ExamSubmission> courseSubmissions = submissionsByCourse.get(course);
                if (courseSubmissions != null && !courseSubmissions.isEmpty()) {
                    courseContent.append("<table class=\"exam-table\">")
                            .append("<tr><th>Exam</th><th>Grade</th></tr>");
                    for (ExamSubmission submission : courseSubmissions) {
                        courseContent.append("<tr>")
                                .append("<td>").append(submission.getExam().getTitle()).append("</td>")
                                .append("<td>").append(getGrade(submission.getMarks())).append("</td>")
                                .append("</tr>");
                    }
                    courseContent.append("</table>");
                } else {
                    courseContent.append("<p>No graded exams for this course.</p>");
                }
                courseContent.append("</div>");
            }

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
            String issuedDate = LocalDateTime.now().format(formatter);

            return template
                    .replace("${studentId}", student.getId().toString())
                    .replace("${studentEmail}", student.getEmail())
                    .replace("${studentName}", student.getFirstname() + " " + student.getLastname())
                    .replace("${studentPhone}", student.getPhone())
                    .replace("${issuedDate}", issuedDate)
                    .replace("${courseContent}", courseContent.toString());

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate transcript content", e);
        }
    }

    private String loadTemplate(String templatePath) throws IOException {
        ClassPathResource resource = new ClassPathResource(templatePath);
        return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
    }

    private String getGrade(Double marks) {
        if (marks == null) return "N/A";
        if (marks >= 85) return "A+";
        if (marks >= 70) return "A";
        if (marks >= 65) return "A-";
        if (marks >= 60) return "B+";
        if (marks >= 55) return "B";
        if (marks >= 50) return "B-";
        if (marks >= 45) return "C+";
        if (marks >= 40) return "C";
        if (marks >= 35) return "C-";
        if (marks >= 30) return "D+";
        if (marks >= 25) return "D";
        return "E";
    }
}