package com.example.learning_management.auth;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RegistrationRequest {

    @NotEmpty
    @NotBlank(message = "First Name is mandatory")
    private String firstname;

    @NotEmpty
    @NotBlank(message = "Last Name is mandatory")
    private String lastname;

    @NotEmpty
    @Email(message = "email is wrong")
    @NotBlank(message = "Email Name is mandatory")
    private String email;

    @NotEmpty
    @NotBlank(message = "Phone Number is mandatory")
    private String phone;

    @NotEmpty
    @NotBlank(message = "Password Name is mandatory")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;
}
