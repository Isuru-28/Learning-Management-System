package com.example.learning_management.auth;

import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    // register an admin
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody @Valid RegistrationRequest request) throws MessagingException {
        service.createAdmin(request);
        return ResponseEntity.ok("Admin created successfully");
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseEntity<?> register(@RequestBody @Valid RegistrationRequest request) throws MessagingException {
        try {
            service.register(request);
            return ResponseEntity.accepted().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.internalServerError().body("Failed to send activation email");
        }
    }

    @PostMapping("/register-admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> registerAdminUser(@RequestBody @Valid RegistrationRequest request, @RequestParam String role) throws MessagingException {
        try {
            service.registerAdminUser(request, role);
            return ResponseEntity.ok("User registered successfully with role: " + role);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.internalServerError().body("Failed to send activation email");
        }
    }


    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody @Valid AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @GetMapping("/activate-account")
    public ResponseEntity<String> activateAccount(@RequestParam String token) throws MessagingException {
        service.activateAccount(token);
        return ResponseEntity.ok("User account activated successfully");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) throws MessagingException {
        service.initiatePasswordReset(email);
        return ResponseEntity.ok("Password reset email sent");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        service.resetPassword(token, newPassword);
        return ResponseEntity.ok("Password reset successfully");
    }

}