import axios from 'axios';

// API Base URL - uses environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5132/api';

console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/Authen/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authenAPI = {
  registerStudent: (data) => api.post('/Authen/register/student', data),
  registerCompany: (data) => api.post('/Authen/register/company', data),
  login: (data, userType) => api.post(`/Authen/login/${userType}`, data),
  refreshToken: (refreshToken) => api.post('/Authen/refresh-token', { refreshToken }),
  logout: (refreshToken) => api.post('/Authen/logout', { refreshToken }),
};

// Student API
export const studentAPI = {
  getProfile: () => api.get('/Student/profile'),
  updateProfile: (data) => api.put('/Student/profile', data),
};

// Company API
export const companyAPI = {
  getProfile: () => api.get('/Company/profile'),
  updateProfile: (data) => api.put('/Company/profile', data),
  banStudent: (studentId, data) => api.post(`/Company/ban-student/${studentId}`, data),
  unbanStudent: (studentId) => api.post(`/Company/unban-student/${studentId}`),
  getBannedStudents: () => api.get('/Company/banned-students'),
};

// Internship API
export const internshipAPI = {
  getAll: (params) => api.get('/Internship', { params }),
  getById: (id) => api.get(`/Internship/${id}`),
  create: (data) => api.post('/Internship', data),
  update: (id, data) => api.put(`/Internship/${id}`, data),
  close: (id) => api.delete(`/Internship/${id}`),
  getMyInternships: () => api.get('/Internship/company/mine'),
};

// Application API
export const applicationAPI = {
  getMine: () => api.get('/Application/student/mine'),
  getForInternship: (internshipId) => api.get(`/Application/internship/${internshipId}`),
  submit: (data) => api.post('/Application', data),
  submitWithResume: (formData) => api.post('/Application/with-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateStatus: (id, data) => api.put(`/Application/${id}/status`, data),
  withdraw: (id) => api.delete(`/Application/${id}`),
  downloadResume: (applicationId) => api.get(`/Application/download-resume/${applicationId}`, {
    responseType: 'blob',
  }),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/Admin/dashboard'),
  getStudents: (params) => api.get('/Admin/students', { params }),
  getCompanies: (params) => api.get('/Admin/companies', { params }),
  getInternships: (params) => api.get('/Admin/internships', { params }),
  getApplications: (params) => api.get('/Admin/applications', { params }),
  getReports: () => api.get('/Admin/reports'),
  forceCloseInternship: (id) => api.delete(`/Admin/internship/${id}`),
  banUser: (userId, userType, data) => api.post(`/Admin/ban-user/${userId}/${userType}`, data),
  unbanUser: (userId, userType) => api.post(`/Admin/unban-user/${userId}/${userType}`),
  getBannedUsers: () => api.get('/Admin/banned-users'),
};

export default api;