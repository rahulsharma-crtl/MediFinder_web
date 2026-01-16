import axios from 'axios';

const getBaseURL = () => {
    const url = import.meta.env.VITE_API_URL || '/api';
    // If it's a full URL and doesn't end with /api, append it
    if (url.startsWith('http') && !url.endsWith('/api')) {
        return `${url.replace(/\/$/, '')}/api`;
    }
    return url;
};

const api = axios.create({
    baseURL: getBaseURL()
});

// Add a request interceptor to include JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const medicineService = {
    search: (q: string) => api.get(`/medicines/search?q=${q}`),
    getDetails: (id: string) => api.get(`/medicines/${id}`)
};

export const reservationService = {
    create: (data: any) => api.post('/reservations', data),
    getPharmacyReservations: () => api.get('/reservations/pharmacy'),
    updateStatus: (id: string, status: string) => api.patch(`/reservations/${id}/status`, { status })
};

export const aiService = {
    getRecommendations: (disease: string) => api.post('/ai/recommend', { disease }),
    analyzePrescription: (imageBase64: string) => api.post('/ai/analyze-prescription', { image: imageBase64 })
};

export const authService = {
    loginByPhone: (contact: string) => api.post('/auth/login-by-phone', { contact }),
    register: (data: any) => api.post('/auth/register', data)
};

export default api;
