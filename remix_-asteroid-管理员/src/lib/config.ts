// 统一 API 基址：开发用 .env 指向本地，生产留空走同源 /api
export const API_BASE: string = import.meta.env.VITE_API_BASE ?? '/api';
export const CHAT_API = `${API_BASE}/chat`;
