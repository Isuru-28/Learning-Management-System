package com.example.learning_management.auth;

import com.example.learning_management.email.EmailService;
import com.example.learning_management.email.EmailTemplateName;
import com.example.learning_management.entity.token.Token;
import com.example.learning_management.entity.user.Role;
import com.example.learning_management.entity.user.User;
import com.example.learning_management.repository.RoleRepository;
import com.example.learning_management.repository.TokenRepository;
import com.example.learning_management.repository.UserRepository;
import com.example.learning_management.security.JwtService;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    @Value("${application.mailing.frontend.activation-url}")
    private String activationUrl;
    @Value("${application.mailing.frontend.reset-password-url}")
    private String resetPasswordUrl;


    // register an admin
    @Transactional
    public void createAdmin(RegistrationRequest request) throws MessagingException {
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new IllegalStateException("Admin role not found"));

        User adminUser = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .accountLocked(false)
                .enabled(true) // Admin is enabled by default
                .roles(List.of(adminRole))
                .build();

        userRepository.save(adminUser);
    }

    // user creation
    private User createUser(RegistrationRequest request, Role role) {
        return User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .accountLocked(false)
                .enabled(false)
                .roles(List.of(role))
                .build();
    }

    // default user(student) register
    public void register(RegistrationRequest request) throws MessagingException {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }

        var userRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new IllegalStateException("Student role not found"));

        var user = createUser(request, userRole);
        userRepository.save(user);
        sendValidationEmail(user);
    }

    // user registration by admin
    public void registerAdminUser(RegistrationRequest request, String roleName) throws MessagingException {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }

        var role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role not found"));

        var user = createUser(request, role);
        user.setEnabled(true); // Admins can activate accounts directly
        userRepository.save(user);
    }

    // send confirmation email after registration
    private void sendValidationEmail(User user) throws MessagingException {
        var newToken = generateAndSaveActivationToken(user);

        emailService.sendEmail(
                user.getEmail(),
                user.fullname(),
                EmailTemplateName.ACTIVATE_ACCOUNT,
                activationUrl + "?token=" + newToken,
                newToken,
                "Account activation"
        );
    }

    private String generateAndSaveActivationToken(User user) {
        String generatedToken = generateActivationCode(7);
        var token = Token.builder()
                .token(generatedToken)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .user(user)
                .build();
        tokenRepository.save(token);
        return generatedToken;
    }

    private String generateActivationCode(int length) {
        String characters = "0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        SecureRandom secureRandom = new SecureRandom();
        for (int i = 0; i < length; i++) {
            int randomIndex = secureRandom.nextInt(characters.length());
            codeBuilder.append(characters.charAt(randomIndex));
        }
        return codeBuilder.toString();
    }

    public AuthenticationResponse authenticate(@Valid AuthenticationRequest request) {
        var auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var claims = new HashMap<String, Object>();
        var user = ((User) auth.getPrincipal());
        claims.put("fullname", user.fullname());

        var jwtToken = jwtService.generateToken(claims, user);
        return AuthenticationResponse.builder().token(jwtToken).build();
    }


    public void activateAccount(String token) throws MessagingException {
        Token savedToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if(LocalDateTime.now().isAfter(savedToken.getExpiresAt())){
//            sendValidationEmail(savedToken.getUser());
            throw new RuntimeException("Token is expired. new token has send");
        }

        var user = userRepository.findById(savedToken.getUser().getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setEnabled(true);
        userRepository.save(user);

        savedToken.setValidatedAt(LocalDateTime.now());
        tokenRepository.save(savedToken);
    }

    // forget password
    public void initiatePasswordReset(String email) throws MessagingException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(1);

        Token resetToken = Token.builder()
                .token(token)
                .user(user)
                .expiresAt(expiryDate)
                .build();

        tokenRepository.save(resetToken);

        String resetLink = resetPasswordUrl + "?token=" + token;
        emailService.sendEmail(
                user.getEmail(),
                user.fullname(),
                EmailTemplateName.RESET_PASSWORD,
                resetLink,
                token,
                "Password Reset Request"
        );
    }

    // reset the password
    public void resetPassword(String token, String newPassword) {
        Token resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
    }
}