package com.example.learning_management.repository;

import com.example.learning_management.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCourseId(Long courseId);
    List<Exam> findByCourseIdIn(List<Long> courseIds);

    @Modifying
    @Query("DELETE FROM Exam e WHERE e.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);

    Optional<Exam> findByFileUrl(String fileUrl);
}