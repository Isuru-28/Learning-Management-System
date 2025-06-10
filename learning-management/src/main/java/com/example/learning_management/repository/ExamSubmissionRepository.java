package com.example.learning_management.repository;

import com.example.learning_management.entity.ExamSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;

public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, Long> {
    List<ExamSubmission> findByExamId(Long examId);
    Optional<ExamSubmission> findByExamIdAndStudentId(Long examId, Long studentId);

    @Modifying
    @Query("DELETE FROM ExamSubmission es WHERE es.exam.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT examSubmission FROM ExamSubmission examSubmission WHERE examSubmission.student.id = :studentId AND examSubmission.marks IS NOT NULL")
    List<ExamSubmission> findByStudentIdAndMarksIsNotNull(@Param("studentId") Long studentId);
}