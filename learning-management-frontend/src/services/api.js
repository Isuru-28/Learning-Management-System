import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8088/api/v1/auth',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Envoy proxy address for gRPC calls
const envoyBaseURL = 'http://localhost:51051';

// Add response interceptor for logging
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  return Promise.reject(error);
});

// Function to register a user
export const registerUser = (data) => api.post('/register', data);

// Function to register an instructor or other user types (via admin registration)
export const registerAdminUser = (data, role) => {
  const token = sessionStorage.getItem('token');
  return api.post(`/register-admin?role=${role}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Function to login a user
export const loginUser = (data) => api.post('/authenticate', data);

// Function to get user by ID
export const getUserById = (userId) => {
  const token = sessionStorage.getItem('token');
  return api.get(`/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Function to update user by admin
export const updateUser = (userId, data) => {
  const token = sessionStorage.getItem('token');
  return api.put(`/admin/users/${userId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Function to get user profile
export const getUserProfile = () => {
  const token = sessionStorage.getItem('token');
  return api.get('/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Function to update user profile
export const updateUserProfile = (data) => {
  const token = sessionStorage.getItem('token');
  return api.put('/profile', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Function to change password
export const changePassword = (data) => {
  const token = sessionStorage.getItem('token');
  return api.put('/profile/change-password', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// forget password
export const forgotPassword = (email) => api.post('/forgot-password', null, { params: { email } });

export const resetPassword = (token, newPassword) => api.post('/reset-password', null, { params: { token, newPassword } });

// Course management functions
export const getCourses = () => api.get('/courses');

export const getCourseById = (id) => api.get(`/courses/${id}`);

export const createCourse = (courseData, instructorId) => {
  return api.post(`/courses?instructorId=${instructorId}`, courseData);
};

export const updateCourse = (id, courseData, instructorId) => {
  return api.put(`/courses/${id}?instructorId=${instructorId}`, courseData);
};

export const deleteCourse = (id, instructorId) => {
  return api.delete(`/courses/${id}?instructorId=${instructorId}`);
};

// File management functions
export const getCourseFiles = (courseId) => {
  return api.get(`/files/course/${courseId}`);
};

export const uploadCourseFile = (courseId, instructorId, file, title, fileType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('courseId', courseId);
  formData.append('instructorId', instructorId);
  formData.append('fileType', fileType);
  return api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateCourseFile = (fileId, instructorId, title, file) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('instructorId', instructorId);
  if (file) {
    formData.append('file', file);
  }
  return api.put(`/files/${fileId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteCourseFile = (fileId, instructorId) => {
  return api.delete(`/files/${fileId}?instructorId=${instructorId}`);
};

// Function to search courses
export const searchCourses = (searchTerm) => api.get(`/courses?search=${searchTerm}`);

// Function to enroll in a course
export const enrollInCourse = (courseId, studentId) => api.post(`/courses/${courseId}/enroll?studentId=${studentId}`);

// Function to get enrolled courses
export const getEnrolledCourses = (studentId) => api.get(`/courses/enrollments?studentId=${studentId}`);

// Function to unenroll from a course
export const unenrollFromCourse = (courseId, studentId) => api.delete(`/courses/${courseId}/unenroll?studentId=${studentId}`);

// Function to download a file
export const downloadFile = (fileId, userId) => api.get(`/files/download/${fileId}?userId=${userId}`, {
  responseType: 'blob'
});

// Exam management functions
export const getExamsByCourse = (courseId) => api.get(`/courses/${courseId}/exam-management`);

export const createExam = (courseId, examData) => {
  const instructorId = sessionStorage.getItem('userId');
  return api.post(`/courses/${courseId}/exam-management?instructorId=${instructorId}`, examData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateExam = (courseId, examId, examData) => {
  const instructorId = sessionStorage.getItem('userId');
  return api.put(`/courses/${courseId}/exam-management/${examId}?instructorId=${instructorId}`, examData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteExam = (courseId, examId) => {
  const instructorId = sessionStorage.getItem('userId');
  return api.delete(`/courses/${courseId}/exam-management/${examId}?instructorId=${instructorId}`);
};


export const downloadExam = (examId, userId) => {
  return api.get(`/files/download/${examId}?userId=${userId}`, {
    responseType: 'blob',
  });
};

export const getExamsForStudent = (courseId) => api.get(`/courses/${courseId}/exams`);


// student answers submission

export const submitExamAnswer = (courseId, examId, studentId, file) => {
  console.log('Submitting exam answer:', { courseId, examId, studentId });
  const formData = new FormData();
  formData.append('file', file);
  formData.append('studentId', studentId);
  
  const url = `/courses/${courseId}/exam-management/${examId}/submit`;
  console.log('API call URL:', url);
  
  return api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).catch(error => {
    console.error('Error in submitExamAnswer:', error.response || error);
    throw error;
  });
};

export const getExamSubmissions = (examId) => {
  const userId = sessionStorage.getItem('userId');
  return api.get(`/courses/${examId}/exam-management/${examId}/submissions?userId=${userId}`);
};

export const downloadExamSubmission = (submissionId) => {
  const userId = sessionStorage.getItem('userId');
  return api.get(`/files/download/${submissionId}?userId=${userId}`, {
    responseType: 'blob',
  });
};

// using envoy proxy for gRPC calls

export const updateExamSubmissionMarks = (examSubmissionMarks) => {
  return axios.put(`${envoyBaseURL}/api/marks`, { exam_submission_marks: examSubmissionMarks }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    },
  });
};

export const resetExamSubmissionMarks = (submissionIds) => {
  return axios.delete(`${envoyBaseURL}/api/resetmark`, {
    data: { submission_ids: submissionIds },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    },
  });
}

// report generate

export const generateTranscript = (userId) => {
  return api.get(`/transcripts/generate/${userId}`, {
    responseType: 'blob',
  });
};

export default api;
