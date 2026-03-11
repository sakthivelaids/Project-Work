import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Courses
export const courseAPI = {
  getAll: (params) => API.get('/courses', { params }),
  getById: (id) => API.get(`/courses/${id}`),
  create: (data) => API.post('/courses', data),
  update: (id, data) => API.put(`/courses/${id}`, data),
  delete: (id) => API.delete(`/courses/${id}`),
  getInstructorCourses: () => API.get('/courses/instructor/my-courses'),
  getCategories: () => API.get('/courses/categories'),
};

// Enrollment
export const enrollAPI = {
  enroll: (course_id) => API.post('/enroll', { course_id }),
  getEnrolled: () => API.get('/enroll'),
  updateProgress: (course_id, progress) => API.put('/enroll/progress', { course_id, progress }),
  getStudents: (course_id) => API.get(`/enroll/students/${course_id}`),
};

// User
export const userAPI = {
  getProfile: () => API.get('/user/profile'),
  updateProfile: (data) => API.put('/user/profile', data),
  changePassword: (data) => API.put('/user/change-password', data),
  getDashboardStats: () => API.get('/user/dashboard-stats'),
};

// Lessons
export const lessonAPI = {
  getByCourse: (course_id) => API.get(`/lessons/course/${course_id}`),
  add: (data) => API.post('/lessons', data),
  update: (id, data) => API.put(`/lessons/${id}`, data),
  delete: (id) => API.delete(`/lessons/${id}`),
};

// Reviews
export const reviewAPI = {
  add: (data) => API.post('/reviews', data),
  getByCourse: (course_id) => API.get(`/reviews/course/${course_id}`),
};

export default API;
