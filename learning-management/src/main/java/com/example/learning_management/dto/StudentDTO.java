package com.example.learning_management.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentDTO {
    private Long id;
    private String firstname;
    private String lastname;
    private String email;
}