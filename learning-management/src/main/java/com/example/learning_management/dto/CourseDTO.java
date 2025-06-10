package com.example.learning_management.dto;

import lombok.Data;

@Data
public class CourseDTO {
    private Long id;
    private String title;
    private String description;
    private InstructorDTO instructor;

    @Data
    public static class InstructorDTO {
        private Long id;
        private String firstname;
        private String lastname;
        private String email;
    }
}