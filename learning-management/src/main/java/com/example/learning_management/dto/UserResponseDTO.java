// UserResponseDTO.java
package com.example.learning_management.dto;

import com.example.learning_management.entity.user.Role;
import com.example.learning_management.entity.user.User;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class UserResponseDTO {
    private Long id;
    private String firstname;
    private String lastname;
    private String email;
    private String phone;
    private boolean enabled;
    private List<String> roles; // Simplified roles representation

    // Constructor to initialize the fields from User entity
    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.firstname = user.getFirstname();
        this.lastname = user.getLastname();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.enabled = user.isEnabled();
        this.roles = user.getRoles().stream()
                .map(Role::getName) // Extract role names only
                .collect(Collectors.toList());
    }
}
