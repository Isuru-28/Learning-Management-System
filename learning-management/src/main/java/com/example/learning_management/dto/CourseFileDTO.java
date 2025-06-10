package com.example.learning_management.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CourseFileDTO {
    private Long id;
    private String title;
    private String fileUrl;
    private String fileType;
    private LocalDateTime uploadDate;
    private Long courseId;
    private String uploaderName;
}