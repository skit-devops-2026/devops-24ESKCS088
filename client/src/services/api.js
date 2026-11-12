import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

// Interceptor to add JWT token from localStorage to every outgoing request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Fallback for user email if present
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                if (parsed.email) {
                    config.headers['x-user-email'] = parsed.email;
                }
                if (parsed._id) {
                    config.headers['x-user-id'] = parsed._id;
                }
            } catch (e) {
                // Ignore parse error
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
