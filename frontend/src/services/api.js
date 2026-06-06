import axios from "axios";
import { getToken, clearAuth } from "../App.jsx";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// ── Request interceptor: attach JWT ───────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth endpoints ─────────────────────────────────────────────────────────────
export const authAPI = {
  register: (username, password, role) =>
    api.post("/api/register", { username, password, role }),

  login: (username, password) =>
    api.post("/api/login", { username, password }),
};

// ── Posts endpoints ────────────────────────────────────────────────────────────
export const postsAPI = {
  getAll: () => api.get("/api/posts"),

  create: (title, content) =>
    api.post("/api/posts", { title, content }),
};

export default api;
