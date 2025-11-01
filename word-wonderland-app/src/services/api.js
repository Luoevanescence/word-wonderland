import axios from 'axios';

// 使用相对路径 /api，通过 Vite proxy 转发到后端
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Random content APIs - 支持分类筛选
export const getRandomWords = (count = 10, categoryId = null) => {
  const params = new URLSearchParams({ count: count.toString() });
  if (categoryId) params.append('categoryId', categoryId);
  return api.get(`/words/random?${params.toString()}`);
};
export const getRandomPhrases = (count = 10) => api.get(`/phrases/random?count=${count}`);
export const getRandomSentences = (count = 10) => api.get(`/sentences/random?count=${count}`);
export const getRandomPatterns = (count = 10) => api.get(`/patterns/random?count=${count}`);
export const getRandomTopics = (count = 10) => api.get(`/topics/random?count=${count}`);

// Get by ID APIs
export const getWordById = (id) => api.get(`/words/${id}`);
export const getPhraseById = (id) => api.get(`/phrases/${id}`);
export const getPatternById = (id) => api.get(`/patterns/${id}`);

// Categories API
export const getCategories = () => api.get('/categories/public');

export default api;

