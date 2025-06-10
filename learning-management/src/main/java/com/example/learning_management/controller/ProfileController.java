package com.example.learning_management.controller;

import com.example.learning_management.dto.PasswordChangeRequest;
import com.example.learning_management.dto.UserProfileDTO;
import com.example.learning_management.entity.user.User;
import com.example.learning_management.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/auth/profile")
@RequiredArgsConstructor
public class ProfileController {

    private static final Logger logger = LoggerFactory.getLogger(ProfileController.class);
    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserProfileDTO> getUserProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getUserProfile(user.getId()));
    }

    @PutMapping
    public ResponseEntity<UserProfileDTO> updateUserProfile(
            @RequestBody UserProfileDTO userProfileDTO,
            Authentication authentication) {
        logger.debug("Received update request for user profile: {}", userProfileDTO);
        User user = (User) authentication.getPrincipal();
        logger.debug("Updating profile for user ID: {}", user.getId());
        UserProfileDTO updatedProfile = userService.updateUserProfile(user.getId(), userProfileDTO);
        logger.debug("Profile updated successfully: {}", updatedProfile);
        return ResponseEntity.ok(updatedProfile);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @RequestBody PasswordChangeRequest passwordChangeRequest,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        userService.changePassword(user.getId(), passwordChangeRequest);
        return ResponseEntity.ok().build();
    }
}