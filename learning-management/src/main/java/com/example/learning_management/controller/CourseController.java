package com.example.learning_management.controller;

import com.example.learning_management.dto.CourseDTO;
import com.example.learning_management.dto.EnrollmentDTO;
import com.example.learning_management.dto.ExamDTO;
import com.example.learning_management.dto.StudentDTO;
import com.example.learning_management.entity.Course;
import com.example.learning_management.entity.Exam;
import com.example.learning_management.service.CourseService;
import com.example.learning_management.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("auth/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final ExamService examService;

    @PostMapping
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<CourseDTO> createCourse(@RequestBody Course course, @RequestParam Long instructorId) {
        return ResponseEntity.ok(courseService.createCourse(course, instructorId));
    }

    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(courseService.getAllCourses(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByInstructor(@PathVariable Long instructorId) {
        return ResponseEntity.ok(courseService.getCoursesByInstructor(instructorId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @RequestBody CourseDTO courseDTO, @RequestParam Long instructorId) {
        return ResponseEntity.ok(courseService.updateCourse(id, courseDTO, instructorId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id, @RequestParam Long instructorId) {
        courseService.deleteCourse(id, instructorId);
        return ResponseEntity.noContent().build();
    }

    // enrollment process

    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<EnrollmentDTO> enrollInCourse(@PathVariable Long courseId, @RequestParam Long studentId) {
        return ResponseEntity.ok(courseService.enrollStudentInCourse(studentId, courseId));
    }

    @GetMapping("/enrollments")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<List<EnrollmentDTO>> getEnrollmentsByStudent(@RequestParam Long studentId) {
        return ResponseEntity.ok(courseService.getEnrollmentsByStudent(studentId));
    }

    @GetMapping("/{courseId}/students")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<List<StudentDTO>> getEnrolledStudents(@PathVariable Long courseId, @RequestParam Long requesterId) {
        return ResponseEntity.ok(courseService.getEnrolledStudents(courseId, requesterId));
    }
    @DeleteMapping("/{courseId}/unenroll")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<Void> unenrollFromCourse(@PathVariable Long courseId, @RequestParam Long studentId) {
        courseService.unenrollStudentFromCourse(studentId, courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{courseId}/exams")
    public ResponseEntity<List<ExamDTO>> getCourseExams(@PathVariable Long courseId) {
        List<ExamDTO> exams = examService.getExamsByCourse(courseId);
        return ResponseEntity.ok(exams);
    }
}