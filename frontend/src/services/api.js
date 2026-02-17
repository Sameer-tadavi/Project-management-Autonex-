import axios from 'axios';

// Ensure HTTPS for production (non-localhost) URLs to prevent Mixed Content errors
let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
if (!apiBaseUrl.includes('localhost') && apiBaseUrl.startsWith('http://')) {
    apiBaseUrl = apiBaseUrl.replace('http://', 'https://');
}

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            // window.location.href = '/login/admin'; 
        }
        return Promise.reject(error);
    }
);

// === Projects API (Main Projects - formerly Parent Projects) ===
export const projectApi = {
    getAll: () => api.get('/projects').then(res => res.data),
    getOne: (id) => api.get(`/projects/${id}`).then(res => res.data),
    create: (data) => api.post('/projects', data).then(res => res.data),
    update: (id, data) => api.put(`/projects/${id}`, data).then(res => res.data),
    delete: (id) => api.delete(`/projects/${id}`).then(res => res.data),
    getContext: (id) => api.get(`/projects/${id}/context`).then(res => res.data),
    getCloneSuggestions: (id) => api.get(`/projects/${id}/clone-suggestions`).then(res => res.data),
};

// === Sub-Projects API (formerly Projects) ===
export const subProjectApi = {
    getAll: () => api.get('/sub-projects').then(res => res.data),
    getOne: (id) => api.get(`/sub-projects/${id}`).then(res => res.data),
    create: (data) => api.post('/sub-projects', data).then(res => res.data),
    update: (id, data) => api.put(`/sub-projects/${id}`, data).then(res => res.data),
    delete: (id) => api.delete(`/sub-projects/${id}`).then(res => res.data),
};

// === Recommendations API ===
export const recommendationsApi = {
    getByProject: (projectId) => api.get(`/recommendations/project/${projectId}`).then(res => res.data),
    getDashboard: () => api.get('/recommendations/dashboard').then(res => res.data),
    getTimeline: (projectId, includeDaily = false) =>
        api.get(`/recommendations/project/${projectId}/timeline`, { params: { include_daily: includeDaily } })
            .then(res => res.data),
};

// Backward compatibility alias
export const parentProjectApi = projectApi;

export const employeeApi = {
    getAll: () => api.get('/employees').then(res => res.data),
    getOne: (id) => api.get(`/employees/${id}`).then(res => res.data),
    create: (data) => api.post('/employees', data).then(res => res.data),
    update: (id, data) => api.put(`/employees/${id}`, data).then(res => res.data),
    delete: (id) => api.delete(`/employees/${id}`).then(res => res.data),
};

export const allocationApi = {
    getAll: () => api.get('/allocations').then(res => res.data),
    create: (data) => api.post('/allocations', data).then(res => res.data),
    update: (id, data) => api.put(`/allocations/${id}`, data).then(res => res.data),
    delete: (id) => api.delete(`/allocations/${id}`).then(res => res.data),
    // NEW: Validation and filtering endpoints
    validate: (data) => api.post('/allocations/validate', data).then(res => res.data),
    getEmployeeStatus: (activeOnly = true) =>
        api.get('/allocations/employee-status', { params: { active_only: activeOnly } })
            .then(res => res.data),
    getByProject: (projectId) => api.get(`/allocations/by-project/${projectId}`).then(res => res.data),
    getByEmployee: (employeeId) => api.get(`/allocations/by-employee/${employeeId}`).then(res => res.data),
};

export const leaveApi = {
    getAll: () => api.get('/leaves').then(res => res.data),
    create: (data) => api.post('/leaves', data).then(res => res.data),
    update: (id, data) => api.put(`/leaves/${id}`, data).then(res => res.data),
    delete: (id) => api.delete(`/leaves/${id}`).then(res => res.data),
};

export const skillsApi = {
    getSummary: () => api.get('/skills/summary').then(res => res.data),
    getAll: () => api.get('/skills').then(res => res.data),
    create: (data) => api.post('/skills', data).then(res => res.data),
    delete: (id) => api.delete(`/skills/${id}`).then(res => res.data),
};

// Alias for inconsistency in naming if any
export const skillApi = skillsApi;

export default api;

