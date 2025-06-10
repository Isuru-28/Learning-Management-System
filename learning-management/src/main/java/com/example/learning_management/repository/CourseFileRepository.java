package com.example.learning_management.repository;

import com.example.learning_management.entity.CourseFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseFileRepository extends JpaRepository<CourseFile, Long> {
    List<CourseFile> findByCourseId(Long courseId);

    Optional<CourseFile> findByFileUrl(String fileUrl);

    @Modifying
    @Query("DELETE FROM CourseFile cf WHERE cf.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query("DELETE FROM CourseFile cf WHERE cf.fileUrl = :fileUrl")
    void deleteByFileUrl(@Param("fileUrl") String fileUrl);


}