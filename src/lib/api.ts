import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL || 'https://taskmaster-3-41fr.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
});

// Add request interceptor to add token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('taskmaster-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;