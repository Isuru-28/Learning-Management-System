package com.example.learning_management.service;

import com.example.learning_management.dto.CourseDTO;
import com.example.learning_management.dto.EnrollmentDTO;
import com.example.learning_management.dto.StudentDTO;
import com.example.learning_management.entity.Course;
import com.example.learning_management.entity.Enrollment;
import com.example.learning_management.entity.user.User;
import com.example.learning_management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ExamSubmissionRepository examSubmissionRepository;
    private final ExamRepository examRepository;
    private final CourseFileRepository courseFileRepository;

    public CourseDTO createCourse(Course course, Long instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));
        course.setInstructor(instructor);
        Course savedCourse = courseRepository.save(course);
        return convertToCourseDTO(savedCourse);
    }

    public List<CourseDTO> getAllCourses(String search) {
        List<Course> courses;
        if (search != null && !search.isEmpty()) {
            courses = courseRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search, search);
        } else {
            courses = courseRepository.findAll();
        }
        return courses.stream()
                .map(this::convertToCourseDTO)
                .collect(Collectors.toList());
    }

    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return convertToCourseDTO(course);
    }

    public List<CourseDTO> getCoursesByInstructor(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId).stream()
                .map(this::convertToCourseDTO)
                .collect(Collectors.toList());
    }

    public CourseDTO updateCourse(Long courseId, CourseDTO courseDTO, Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new AccessDeniedException("You are not authorized to update this course");
        }

        course.setTitle(courseDTO.getTitle());
        course.setDescription(courseDTO.getDescription());

        Course updatedCourse = courseRepository.save(course);
        return convertToCourseDTO(updatedCourse);
    }

    @Transactional
    public void deleteCourse(Long courseId, Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new AccessDeniedException("You are not authorized to delete this course");
        }

        // Delete related entities
        examSubmissionRepository.deleteByCourseId(courseId);
        examRepository.deleteByCourseId(courseId);
        courseFileRepository.deleteByCourseId(courseId);
        enrollmentRepository.deleteByCourseId(courseId);

        courseRepository.delete(course);
    }

    // student enrollment to courses
    public EnrollmentDTO enrollStudentInCourse(Long studentId, Long courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new RuntimeException("Student is already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .enrollmentDate(LocalDateTime.now())
                .build();

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return convertToEnrollmentDTO(savedEnrollment);
    }

    public void unenrollStudentFromCourse(Long studentId, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Student is not enrolled in this course"));

        enrollmentRepository.delete(enrollment);
    }

    private CourseDTO convertToCourseDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());

        CourseDTO.InstructorDTO instructorDTO = new CourseDTO.InstructorDTO();
        instructorDTO.setId(course.getInstructor().getId());
        instructorDTO.setFirstname(course.getInstructor().getFirstname());
        instructorDTO.setLastname(course.getInstructor().getLastname());
        instructorDTO.setEmail(course.getInstructor().getEmail());

        dto.setInstructor(instructorDTO);
        return dto;
    }

    public List<EnrollmentDTO> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(this::convertToEnrollmentDTO)
                .collect(Collectors.toList());
    }

    private EnrollmentDTO convertToEnrollmentDTO(Enrollment enrollment) {
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setId(enrollment.getId());
        dto.setStudentId(enrollment.getStudent().getId());
        dto.setStudentName(enrollment.getStudent().getFirstname() + " " + enrollment.getStudent().getLastname());
        dto.setCourseId(enrollment.getCourse().getId());
        dto.setCourseTitle(enrollment.getCourse().getTitle());
        dto.setEnrollmentDate(enrollment.getEnrollmentDate());
        return dto;
    }

    public List<StudentDTO> getEnrolledStudents(Long courseId, Long requesterId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!isAdminOrInstructor(requester, course)) {
            throw new AccessDeniedException("You are not authorized to view enrolled students for this course");
        }

        return enrollmentRepository.findByCourseId(courseId).stream()
                .map(enrollment -> convertToStudentDTO(enrollment.getStudent()))
                .collect(Collectors.toList());
    }

    private boolean isAdminOrInstructor(User user, Course course) {
        return user.getRoles().stream().anyMatch(role -> role.getName().equals("ADMIN")) ||
                (user.getRoles().stream().anyMatch(role -> role.getName().equals("INSTRUCTOR")) &&
                        course.getInstructor().getId().equals(user.getId()));
    }

    private StudentDTO convertToStudentDTO(User student) {
        return StudentDTO.builder()
                .id(student.getId())
                .firstname(student.getFirstname())
                .lastname(student.getLastname())
                .email(student.getEmail())
                .build();
    }
}