import axios from 'axios';

// 使用相对路径 /api，通过 Vite proxy 转发到后端
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

export default api;

