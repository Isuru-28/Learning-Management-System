package com.example.learning_management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamDTO {
    private Long id;
    private String title;
    private String fileUrl;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long courseId;
    private String courseTitle;
}