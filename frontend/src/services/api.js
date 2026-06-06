import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear local storage and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const register = (username, password, role = "user") =>
  api.post("/api/register", { username, password, role });

export const login = (username, password) =>
  api.post("/api/login", { username, password });

// ── Posts ─────────────────────────────────────────────────────────────────────
export const getPosts = () => api.get("/api/posts");

export const createPost = (title, body) =>
  api.post("/api/posts", { title, body });

export default api;
