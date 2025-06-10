package com.example.learning_management.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ExamSubmissionDTO {
    private Long id;
    private Long examId;
    private Long studentId;
    private String studentName;
    private String fileUrl;
    private LocalDateTime submissionTime;
    private Double marks;
}