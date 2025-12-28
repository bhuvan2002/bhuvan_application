import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const apiService = {
    get: (url: string, params?: any) => api.get(url, { params }),
    post: (url: string, data?: any) => api.post(url, data),
    put: (url: string, data?: any) => api.put(url, data),
    patch: (url: string, data?: any) => api.patch(url, data),
    delete: (url: string) => api.delete(url),
};

export default apiService;
