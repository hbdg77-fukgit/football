import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Posts from "./pages/Posts.jsx";
import CreatePost from "./pages/CreatePost.jsx";

// ── Auth helpers ───────────────────────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function saveAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// ── Route guards ───────────────────────────────────────────────────────────────

/** Redirect to /login if not authenticated */
function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

/** Redirect to /posts if not admin */
function AdminRoute({ children }) {
  const user = getUser();
  if (!getToken()) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/posts" replace />;
  return children;
}

/** Redirect to /posts if already logged in */
function GuestRoute({ children }) {
  return !getToken() ? children : <Navigate to="/posts" replace />;
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <Routes>
            <Route path="/" element={<Navigate to="/posts" replace />} />

            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />

            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />

            <Route
              path="/posts"
              element={
                <PrivateRoute>
                  <Posts />
                </PrivateRoute>
              }
            />

            <Route
              path="/posts/create"
              element={
                <AdminRoute>
                  <CreatePost />
                </AdminRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/posts" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
