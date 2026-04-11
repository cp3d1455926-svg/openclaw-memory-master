import axios from 'axios';
import type { MemoryOrb, TimeRange, WallResponse, SearchResponse } from '@/types/memory';

// API 基础 URL (可配置)
const API_BASE_URL = import.meta.env.VITE_MEMORY_MASTER_API_URL || 'http://localhost:3001/api/v1';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以添加认证 token
    const token = localStorage.getItem('memory_master_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Memory API
export const memoryAPI = {
  // 获取记忆墙数据
  getWallMemories: async (range: TimeRange = 'all'): Promise<WallResponse> => {
    const response = await api.get<WallResponse>('/wall/memories', {
      params: { range, limit: 100 },
    });
    return response;
  },

  // 获取单个记忆详情
  getMemory: async (id: string): Promise<MemoryOrb> => {
    const response = await api.get<MemoryOrb>(`/wall/memories/${id}`);
    return response;
  },

  // 记录访问
  recordAccess: async (id: string, duration?: number): Promise<{ accessCount: number }> => {
    const response = await api.post(`/wall/memories/${id}/access`, { duration });
    return response;
  },

  // 搜索记忆
  search: async (query: string, type?: string, limit = 50): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>('/wall/search', {
      params: { q: query, type, limit },
    });
    return response;
  },

  // 设置核心记忆
  setCoreMemory: async (id: string, isCore: boolean): Promise<MemoryOrb> => {
    const response = await api.post(`/wall/memories/${id}/core`, { isCore });
    return response;
  },

  // 获取统计
  getStats: async (): Promise<{
    total: number;
    today: number;
    compressed: number;
    byType: Record<string, number>;
    byEmotion: Record<string, number>;
  }> => {
    const response = await api.get('/wall/stats');
    return response;
  },

  // 更新记忆
  updateMemory: async (id: string, updates: Partial<MemoryOrb>): Promise<MemoryOrb> => {
    const response = await api.put(`/wall/memories/${id}`, updates);
    return response;
  },

  // 删除记忆
  deleteMemory: async (id: string): Promise<void> => {
    await api.delete(`/wall/memories/${id}`);
  },
};

// 导出 axios 实例 (用于高级用法)
export { api };
