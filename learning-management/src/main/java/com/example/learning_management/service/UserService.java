package com.example.learning_management.service;

import com.example.learning_management.dto.PasswordChangeRequest;
import com.example.learning_management.dto.UserProfileDTO;
import com.example.learning_management.entity.user.User;
import com.example.learning_management.exception.ResourceNotFoundException;
import com.example.learning_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserProfileDTO getUserProfile(Long id) {
        User user = getUserById(id);
        return new UserProfileDTO(user);
    }

    @Transactional
    public UserProfileDTO updateUserProfile(Long id, UserProfileDTO userProfileDTO) {
        logger.debug("Updating user profile for ID: {}", id);
        try {
            User user = getUserById(id);
            user.setFirstname(userProfileDTO.getFirstname());
            user.setLastname(userProfileDTO.getLastname());
            user.setEmail(userProfileDTO.getEmail());
            user.setPhone(userProfileDTO.getPhone());
            User updatedUser = userRepository.save(user);
            logger.debug("User profile updated successfully: {}", updatedUser);
            return new UserProfileDTO(updatedUser);
        } catch (Exception e) {
            logger.error("Error updating user profile for ID: {}", id, e);
            throw e;
        }
    }

    public void changePassword(Long id, PasswordChangeRequest passwordChangeRequest) {
        User user = getUserById(id);
        if (!passwordEncoder.matches(passwordChangeRequest.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(passwordChangeRequest.getNewPassword()));
        userRepository.save(user);
    }
}