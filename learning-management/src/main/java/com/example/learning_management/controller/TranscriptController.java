package com.example.learning_management.controller;

import com.example.learning_management.service.TranscriptGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth/transcripts")
@RequiredArgsConstructor
public class TranscriptController {

    private final TranscriptGenerationService transcriptGenerationService;

    @GetMapping("/generate/{studentId}")
    public ResponseEntity<byte[]> generateTranscript(@PathVariable Long studentId) {
        byte[] pdfContent = transcriptGenerationService.generateTranscriptPdf(studentId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "transcript.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent);
    }
}