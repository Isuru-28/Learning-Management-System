package com.example.learning_management.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;


import java.util.HashMap;
import java.util.Map;

import static java.nio.charset.StandardCharsets.UTF_8;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${application.mailing.frontend.activation-url}")
    private String activationUrl;

    @Value("${application.mailing.frontend.reset-password-url}")
    private String resetPasswordUrl;

    @Async
    public void sendEmail(
            String to,
            String username,
            EmailTemplateName emailTemplate,
            String linkValue,
            String token,
            String subject
    ) throws MessagingException {
        // Determine which URL to use based on the template name
        String fullUrl;
        if (emailTemplate == EmailTemplateName.RESET_PASSWORD) {
            fullUrl = resetPasswordUrl + "?token=" + token;
        } else {
            fullUrl = activationUrl + "?token=" + token;
        }

        // Determine the template name to use
        String templateName = emailTemplate != null ? emailTemplate.getName() : "confirm_email";

        // Create the MIME message
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED, UTF_8.name());

        // Set up the context with email properties
        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("confirmationUrl", fullUrl);
        properties.put("activation_code", token); // Optional: can be customized

        Context context = new Context();
        context.setVariables(properties);

        // Set the email properties and content
        helper.setFrom("steameriss.28@gmail.com");
        helper.setTo(to);
        helper.setSubject(subject);

        String template = templateEngine.process(templateName, context);
        helper.setText(template, true);

        // Send the email
        mailSender.send(mimeMessage);
        log.info("Email sent successfully to {}", to);
    }
}
