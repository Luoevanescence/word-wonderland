import axios from 'axios';
import { getToken, logout } from '../utils/auth';

// 使用相对路径 /api，通过 Vite proxy 转发到后端
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 自动添加 token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理 token 过期
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // token 过期或无效
      if (error.response.status === 401) {
        const errorCode = error.response.data?.code;
        if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_INVALID') {
          // 清除登录信息
          logout();
          // 跳转到登录页
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Words API
export const wordsAPI = {
  getAll: () => api.get('/words'),
  getById: (id) => api.get(`/words/${id}`),
  create: (data) => api.post('/words', data),
  update: (id, data) => api.put(`/words/${id}`, data),
  delete: (id) => api.delete(`/words/${id}`),
  bulkDelete: (ids) => api.post('/words/bulk/delete', { ids }),
  getRandom: (count = 10) => api.get(`/words/random?count=${count}`)
};

// Phrases API
export const phrasesAPI = {
  getAll: () => api.get('/phrases'),
  getById: (id) => api.get(`/phrases/${id}`),
  create: (data) => api.post('/phrases', data),
  update: (id, data) => api.put(`/phrases/${id}`, data),
  delete: (id) => api.delete(`/phrases/${id}`),
  bulkDelete: (ids) => api.post('/phrases/bulk/delete', { ids }),
  getRandom: (count = 10) => api.get(`/phrases/random?count=${count}`)
};

// Sentences API
export const sentencesAPI = {
  getAll: () => api.get('/sentences'),
  getById: (id) => api.get(`/sentences/${id}`),
  create: (data) => api.post('/sentences', data),
  update: (id, data) => api.put(`/sentences/${id}`, data),
  delete: (id) => api.delete(`/sentences/${id}`),
  bulkDelete: (ids) => api.post('/sentences/bulk/delete', { ids }),
  getRandom: (count = 10) => api.get(`/sentences/random?count=${count}`)
};

// Patterns API
export const patternsAPI = {
  getAll: () => api.get('/patterns'),
  getById: (id) => api.get(`/patterns/${id}`),
  create: (data) => api.post('/patterns', data),
  update: (id, data) => api.put(`/patterns/${id}`, data),
  delete: (id) => api.delete(`/patterns/${id}`),
  bulkDelete: (ids) => api.post('/patterns/bulk/delete', { ids }),
  getRandom: (count = 10) => api.get(`/patterns/random?count=${count}`)
};

// Topics API
export const topicsAPI = {
  getAll: () => api.get('/topics'),
  getById: (id) => api.get(`/topics/${id}`),
  create: (data) => api.post('/topics', data),
  update: (id, data) => api.put(`/topics/${id}`, data),
  delete: (id) => api.delete(`/topics/${id}`),
  bulkDelete: (ids) => api.post('/topics/bulk/delete', { ids }),
  getRandom: (count = 10) => api.get(`/topics/random?count=${count}`)
};

// Parts of Speech API
export const partsOfSpeechAPI = {
  getAll: () => api.get('/parts-of-speech'),
  getById: (id) => api.get(`/parts-of-speech/${id}`),
  create: (data) => api.post('/parts-of-speech', data),
  update: (id, data) => api.put(`/parts-of-speech/${id}`, data),
  delete: (id) => api.delete(`/parts-of-speech/${id}`),
  bulkDelete: (ids) => api.post('/parts-of-speech/bulk/delete', { ids })
};

// Components API
export const componentsAPI = {
  getAll: () => api.get('/components'),
  getById: (id) => api.get(`/components/${id}`),
  create: (data) => api.post('/components', data),
  update: (id, data) => api.put(`/components/${id}`, data),
  delete: (id) => api.delete(`/components/${id}`),
  bulkDelete: (ids) => api.post('/components/bulk/delete', { ids })
};

// Categories API (Words Categories)
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  bulkDelete: (ids) => api.post('/categories/bulk/delete', { ids })
};

export default api;

