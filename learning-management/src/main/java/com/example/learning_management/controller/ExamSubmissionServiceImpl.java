package com.example.learning_management.controller;

import com.example.learning_management.grpc.*;
import com.example.learning_management.service.ExamService;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@GrpcService
public class ExamSubmissionServiceImpl extends ExamSubmissionServiceGrpc.ExamSubmissionServiceImplBase {

    private static final Logger logger = LoggerFactory.getLogger(ExamSubmissionServiceImpl.class);

    @Autowired
    private ExamService examService;

    @Override
    public void updateExamSubmissionMarks(UpdateExamSubmissionMarksRequest request, StreamObserver<UpdateExamSubmissionMarksResponse> responseObserver) {
        logger.info("Received updateExamSubmissionMarks request");

        try {
            request.getExamSubmissionMarksList().forEach(examSubmissionMark ->
                    examService.updateExamSubmissionMarks(examSubmissionMark.getId(), examSubmissionMark.getMarks())
            );

            UpdateExamSubmissionMarksResponse response = UpdateExamSubmissionMarksResponse.newBuilder()
                    .setSuccess(true)
                    .setMessage("Exam submission marks updated successfully")
                    .build();
            responseObserver.onNext(response);
            logger.info("Exam submission marks updated successfully");
        } catch (Exception e) {
            logger.error("Error updating exam submission marks: {}", e.getMessage(), e);
            UpdateExamSubmissionMarksResponse response = UpdateExamSubmissionMarksResponse.newBuilder()
                    .setSuccess(false)
                    .setMessage("Error updating exam submission marks: " + e.getMessage())
                    .build();
            responseObserver.onNext(response);
        }

        responseObserver.onCompleted();
    }

    @Override
    public void resetExamSubmissionMarks(ResetExamSubmissionMarksRequest request, StreamObserver<ResetExamSubmissionMarksResponse> responseObserver) {
        logger.info("Received resetExamSubmissionMarks request");
        try {
            examService.resetExamSubmissionMarks(request.getSubmissionIdsList());

            ResetExamSubmissionMarksResponse response = ResetExamSubmissionMarksResponse.newBuilder()
                    .setSuccess(true)
                    .setMessage("Exam submission marks reset successfully")
                    .build();
            responseObserver.onNext(response);
            logger.info("Exam submission marks reset successfully");
        } catch (Exception e) {
            logger.error("Error resetting exam submission marks: {}", e.getMessage(), e);
            ResetExamSubmissionMarksResponse response = ResetExamSubmissionMarksResponse.newBuilder()
                    .setSuccess(false)
                    .setMessage("Error resetting exam submission marks: " + e.getMessage())
                    .build();
            responseObserver.onNext(response);
        } finally {
            responseObserver.onCompleted();
        }
    }
}