import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-logout on 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// ── Auth ──
export const demoLogin = (email, displayName) =>
    api.post('/auth/demo-login', { email, display_name: displayName });

export const getMe = () => api.get('/auth/me');

// ── Chat ──
export const getModels = () => api.get('/chat/models');
export const createSession = (title) => api.post('/chat/sessions', { title });
export const getSessions = () => api.get('/chat/sessions');
export const deleteSession = (id) => api.delete(`/chat/sessions/${id}`);
export const getMessages = (sessionId) => api.get(`/chat/sessions/${sessionId}/messages`);
export const sendMessage = (sessionId, content, model, imageBase64) =>
    api.post(`/chat/sessions/${sessionId}/messages`, {
        content,
        model: model || undefined,
        image_base64: imageBase64 || undefined,
    });

export const uploadDocument = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/chat/upload-document', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// ── Memory ──
export const getMemories = () => api.get('/memory/');
export const clearMemories = () => api.delete('/memory/');

export default api;
