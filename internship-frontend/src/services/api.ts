/// <reference types="vite/client" />

import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterStudentData {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  phoneNumber: string;
  university?: string;
  degree?: string;
}

interface RegisterCompanyData {
  companyName: string;
  email: string;
  password: string;
  phoneNumber: string;
  website?: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface InternshipParams {
  title?: string;
  location?: string;
  [key: string]: unknown;
}

interface InternshipData {
  title: string;
  description: string;
  requirements: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface ApplicationData {
  internshipID: number;
  [key: string]: unknown;
}

interface ApplicationStatus {
  status: string;
}

interface BanStudentData {
  Reason: string;
}

interface BanUserData {
  Reason: string;
}

interface AdminParams {
  [key: string]: unknown;
}

interface UpdateDiscoverableData {
  isDiscoverable: boolean;
}

interface StudentSearchParams {
  university?: string;
  degree?: string;
  query?: string;
  [key: string]: unknown;
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Shared in-flight refresh so concurrent 401s reuse one /refresh call instead
// of racing — the backend revokes a refresh token on first use.
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return Promise.reject(new Error('No refresh token available'));
    }

    refreshPromise = axios
      .post<RefreshTokenResponse>(`${API_BASE_URL}/Authen/refresh`, { refreshToken })
      .then((response) => {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        return response.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    const axiosError = error as {
      response?: { status?: number };
      config?: InternalAxiosRequestConfig;
    };

    if (axiosError.response?.status === 401 && localStorage.getItem('refreshToken')) {
      try {
        const newAccessToken = await refreshAccessToken();

        if (axiosError.config?.headers) {
          axiosError.config.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return axios(axiosError.config!);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  loginStudent: (credentials: LoginCredentials) =>
    api.post('/Authen/login/student', credentials),
  loginCompany: (credentials: LoginCredentials) =>
    api.post('/Authen/login/company', credentials),
  loginAdmin: (credentials: LoginCredentials) =>
    api.post('/Authen/login/admin', credentials),
  registerStudent: (data: RegisterStudentData) =>
    api.post('/Authen/register/student', data),
  registerCompany: (data: RegisterCompanyData) =>
    api.post('/Authen/register/company', data),
  logout: (refreshToken: string) =>
    api.post('/Authen/logout', { refreshToken }),
};

export const internshipAPI = {
  getAll: (params?: InternshipParams) =>
    api.get('/Internship', { params }),
  getById: (id: string | number) =>
    api.get(`/Internship/${id}`),
  getMine: () =>
    api.get('/Internship/company/mine'),
  create: (data: InternshipData) =>
    api.post('/Internship', data),
  update: (id: string | number, data: InternshipData) =>
    api.put(`/Internship/${id}`, data),
  delete: (id: string | number) =>
    api.delete(`/Internship/${id}`),
};

export const applicationAPI = {
  getMine: () =>
    api.get('/Application/student/mine'),
  getForInternship: (id: string | number) =>
    api.get(`/Application/internship/${id}`),
  submit: (data: ApplicationData) =>
    api.post('/Application', data),
  submitWithResume: (formData: FormData) =>
    api.post('/Application/with-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateStatus: (id: string | number, status: ApplicationStatus) =>
    api.put(`/Application/${id}/status`, status),
  withdraw: (id: string | number) =>
    api.delete(`/Application/${id}`),
  getStats: () =>
    api.get('/Application/stats'),
  downloadResume: (applicationId: string | number) =>
    api.get(`/Application/download-resume/${applicationId}`, {
      responseType: 'blob',
    }),
};

export const studentAPI = {
  getMyResume: () =>
    api.get('/Student/resume'),
  uploadResume: (formData: FormData) =>
    api.post('/Student/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteResume: () =>
    api.delete('/Student/resume'),
  downloadResume: () =>
    api.get('/Student/resume/download', {
      responseType: 'blob',
    }),
  getDiscoverable: () =>
    api.get('/Student/discoverable'),
  updateDiscoverable: (isDiscoverable: boolean) =>
    api.put('/Student/discoverable', { isDiscoverable } as UpdateDiscoverableData),
};

export const companyAPI = {
  banStudent: (studentId: string | number, reason: string) =>
    api.post(`/Company/ban-student/${studentId}`, { Reason: reason } as BanStudentData),
  unbanStudent: (studentId: string | number) =>
    api.post(`/Company/unban-student/${studentId}`),
  getBannedStudents: () =>
    api.get('/Company/banned-students'),
  getMyProfile: () =>
    api.get('/Company/me'),
  getApplicationStats: () =>
    api.get('/Company/application-stats'),
  searchStudents: (params?: StudentSearchParams) =>
    api.get('/Company/students', { params }),
  downloadStudentResume: (studentId: string | number) =>
    api.get(`/Company/download-student-resume/${studentId}`, {
      responseType: 'blob',
    }),
};

export const adminAPI = {
  getDashboard: () =>
    api.get('/Admin/dashboard'),
  getStudents: (params?: AdminParams) =>
    api.get('/Admin/students', { params }),
  getCompanies: (params?: AdminParams) =>
    api.get('/Admin/companies', { params }),
  getInternships: (params?: AdminParams) =>
    api.get('/Admin/internships', { params }),
  getApplications: (params?: AdminParams) =>
    api.get('/Admin/applications', { params }),
  getReports: () =>
    api.get('/Admin/reports'),
  closeInternship: (id: string | number) =>
    api.delete(`/Admin/internship/${id}`),
  banUser: (userId: string | number, userType: string, reason: string) =>
    api.post(`/Admin/ban-user/${userId}/${userType}`, { Reason: reason } as BanUserData),
  unbanUser: (userId: string | number, userType: string) =>
    api.post(`/Admin/unban-user/${userId}/${userType}`),
  getBannedUsers: () =>
    api.get('/Admin/banned-users'),
  approveCompany: (id: string | number) =>
    api.post(`/Admin/companies/${id}/approve`),
};

export default api;