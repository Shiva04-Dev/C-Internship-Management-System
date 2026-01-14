import axios from 'axios';

const API_BASE_URL = 'http://localhost:5132/api';

//Creating axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

//Adding auth tokens to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//Handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            //Token has expired, try to refresh
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/Authen/refresh`, {
                        refreshToken,
                    });

                    localStorage.setItem('accessToken', response.data.accessToken);
                    localStorage.setItem('refreshToken', response.data.refreshToken);

                    //Then retry the original request
                    error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;

                    return axios(error.config);
                } 
                catch {
                    //Refresh failed, logoout
                    localStorage.clear();
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

//Authentication APIs
export const authAPI = {
  loginStudent: (credentials) => api.post('/Authen/login/student', credentials),
  loginCompany: (credentials) => api.post('/Authen/login/company', credentials),
  loginAdmin: (credentials) => api.post('/Authen/login/admin', credentials),
  registerStudent: (data) => api.post('/Authen/register/student', data),
  registerCompany: (data) => api.post('/Authen/register/company', data),
  logout: (refreshToken) => api.post('/Authen/logout', { refreshToken }),
};

//Internship APIs
export const internshipAPI = {
  getAll: (params) => api.get('/Internship', { params }),
  getById: (id) => api.get(`/Internship/${id}`),
  getMine: () => api.get('/Internship/company/mine'),
  create: (data) => api.post('/Internship', data),
  update: (id, data) => api.put(`/Internship/${id}`, data),
  delete: (id) => api.delete(`/Internship/${id}`),
};

//Application APIs
export const applicationAPI = {
  getMine: () => api.get('/Application/student/mine'),
  getForInternship: (id) => api.get(`/Application/internship/${id}`),
  submit: (data) => api.post('/Application', data),
  submitWithResume: (formData) => api.post('/Application/with-resume', formData, {
    headers: {'Content-Type': 'multipart/form-data'}
  }),
  updateStatus: (id, status) => api.put(`/Application/${id}/status`, { status }),
  withdraw: (id) => api.delete(`/Application/${id}`),
  getStats: () => api.get('/Application/stats'),
  downloadResume: (applicationId) => api.get(`/Application/download-resume/${applicationId}`, {
    responseType: 'blob'
  }),
};

//Company APIs
export const companyAPI = {
    banStudent: (studentId) => api.post(`/Company/ban-student/${studentId}`),
    unbanStudent: (studentId) => api.post(`/Company/unban-student/${studentId}`),
    getBannedStudents: () => api.get('/Company/banned-students'),
};

//Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/Admin/dashboard'),
  getStudents: (params) => api.get('/Admin/students', { params }),
  getCompanies: (params) => api.get('/Admin/companies', { params }),
  getInternships: (params) => api.get('/Admin/internships', { params }),
  getApplications: (params) => api.get('/Admin/applications', { params }),
  getReports: () => api.get('/Admin/reports'),
  closeInternship: (id) => api.delete(`/Admin/internship/${id}`),
  banUser: (userId, userType) => api.post(`/Admin/ban-user/${userId}/${userType}`),
  unbanUser: (userId, userType) => api.post(`/Admin/unban-user/${userId}/${userType}`),
  getBannedUsers: () => api.get('/Admin/banned-users'),
};

export default api;