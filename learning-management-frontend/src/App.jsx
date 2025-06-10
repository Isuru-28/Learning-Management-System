import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './pages/LoginForm';
import RegisterForm from './pages/RegisterForm';
import PrivateRoute from './services/PrivateRoute';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import InstructorLayout from './layouts/InstructorLayout';
import UsersPage from './pages/admin/UsersPage';
import RegisterUser from './pages/admin/RegisterUser';
import EditUser from './pages/admin/EditUser';
import UserProfile from './pages/UserProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CourseList from './pages/CourseList';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import CourseDetail from './pages/CourseDetail';
import CourseSearchAndEnrollment from './pages/CourseSearchAndEnrollment';
import EnrolledCourses from './pages/EnrolledCourses';
import StudentExamList from './pages/StudentExamList';
import StudentAssignments from './pages/StudentAssignments';
import GradeExams from './pages/GradeExams';
import CourseExams from './pages/CourseExams';
import ExamSubmissions from './pages/ExamSubmissions';

const App = () => {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Private Routes for Admin */}
          <Route path="/admin/*" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminLayout/></PrivateRoute>}>
              <Route index element={<Navigate to="users" />} />
              <Route path="users" element={<UsersPage/>} />
              <Route path="register-user" element={<RegisterUser />} />
              <Route path="edit-user/:id" element={<EditUser />} />
              <Route path="profile" element={<UserProfile/>}/>
          </Route>

          {/* Private Routes for Student */}
          <Route path="/student/*" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentLayout/></PrivateRoute>}>
                <Route index element={<Navigate to="enrollments" />} />
                <Route path="profile" element={<UserProfile/>}/>
                <Route path="courses" element={<CourseSearchAndEnrollment />} />
                <Route path="enrollments" element={<EnrolledCourses />} />
                <Route path="courses/:courseId/exams" element={<StudentExamList />} />
                <Route path="courses/:id" element={<CourseDetail />} />
                <Route path="assignments" element={<StudentAssignments />} />
          </Route>

          {/* Private Routes for Instructor */}
          <Route path="/instructor/*" element={<PrivateRoute allowedRoles={['INSTRUCTOR']}><InstructorLayout/></PrivateRoute>}>
                <Route index element={<Navigate to="courses" />} />
                <Route path="profile" element={<UserProfile/>}/>
                <Route path="courses" element={<CourseList />} />
                <Route path="courses/create" element={<CreateCourse />} />
                <Route path="courses/edit/:id" element={<EditCourse />} />
                <Route path="courses/:id" element={<CourseDetail />} />
                <Route path="grade-exams" element={<GradeExams />} />
                <Route path="grade-exams/:courseId" element={<CourseExams />} />
                <Route path="grade-exams/:courseId/:examId" element={<ExamSubmissions />} />
          </Route>

        {/* Fallback Route for Unknown Routes */}
        <Route path="/" element={<Navigate to="/login" />} />


        </Routes>
    </Router>
  );
};

export default App;
