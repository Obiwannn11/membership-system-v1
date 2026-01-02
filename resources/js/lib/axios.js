import axios from 'axios';

// Buat instance axios khusus
const api = axios.create({
    baseURL: '/api', // Karena kita satu domain, cukup '/api'
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor: Setiap kali request dikirim, cek apakah ada token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;